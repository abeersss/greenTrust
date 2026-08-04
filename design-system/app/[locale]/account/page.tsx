import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { LogoutButton } from "@/components/account/logout-button";
import { buildMetadata } from "@/lib/seo/metadata";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import type { GreenTrustDomainKey } from "@/lib/assessments/greentrust-free";
import { AchievementMedal } from "@/components/achievements/achievement-medal";
import { getAchievementSymbol } from "@/components/achievements/achievement-symbols";
import { getCtfAchievementSymbol } from "@/components/achievements/ctf-symbols";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements/catalog";
import { getCtfAchievementByBadgeKey } from "@/lib/achievements/ctf-catalog";
import { getCtfBadgeName } from "@/lib/ctf/challenges";
import BadgeTile from "@/components/account/badge-tile";
import { siteUrl } from "@/lib/seo/site";
import { getCtfCompletionStatus } from "@/lib/actions/certificate";
import { User, Award } from "lucide-react";

/**
 * Mirrors BadgeTile's own slug map so the share URL points at the
 * live challenge page (public, real OG content) rather than the
 * private /account page. Kept as a local copy since BadgeTile is a
 * client component and this is computed server-side.
 */
const BADGE_SHARE_SLUG: Record<string, string> = {
  first_defender: "first-defender",
  phishing_hunter: "first-defender",
  network_guardian: "network-guardian",
  soc_responder: "soc-night-shift",
  data_guardian: "data-guardian",
};

// The `badges.key` value that shipped in migration 010 was
// "first_defender" (Milestone 2's original name for this challenge,
// before it was rebuilt as "Phishing Hunter"). Accepting both keys
// here means the account page shows the real gold medal regardless of
// which name actually made it into the live database, without
// depending on a database rename that may or may not have happened.
const BADGE_KEY_TO_ACHIEVEMENT: Record<string, string> = {
  first_defender: "phishingHunter",
  phishing_hunter: "phishingHunter",
  network_guardian: "networkGuardian",
  soc_responder: "socNightShift",
  data_guardian: "dataGuardian",
  grc_strategist: "grcStrategist",
  agent_zero: "agentZero",
};

function achievementForBadgeKey(badgeKey: string | undefined) {
  if (!badgeKey) return undefined;
  const achievementKey = BADGE_KEY_TO_ACHIEVEMENT[badgeKey];
  if (!achievementKey) return undefined;
  return ACHIEVEMENT_CATALOG.find((entry) => entry.key === achievementKey && entry.hasMedalArt);
}

/**
 * Builds the public, unauthenticated /badge/[badgeKey] share-card URL
 * used as `shareUrl` for every badge Share button (founder
 * instruction, 2026-08-04: "the sharing will be with badge as image
 * in the post"). X/LinkedIn/Facebook's link-preview scrapers read the
 * Open Graph image from this page, not from the intent link itself,
 * so every share now routes through here instead of straight at the
 * challenge page.
 */
function buildBadgeShareUrl(
  locale: string,
  badgeKey: string,
  name: string,
  number: string | undefined,
  backHref: string,
) {
  const params = new URLSearchParams({ name, number: number ?? "", back: backHref });
  return `${siteUrl}/${locale}/badge/${encodeURIComponent(badgeKey)}?${params.toString()}`;
}

/**
 * Direct PNG image URL for a badge (see
 * app/badge-image/[badgeKey]/route.ts), passed to BadgeTile as
 * `shareImageUrl` so it can fetch and attach the actual image to the
 * native Web Share sheet on supporting devices.
 */
function buildBadgeImageUrl(locale: string, badgeKey: string, name: string, number: string | undefined) {
  const params = new URLSearchParams({ name, number: number ?? "", locale });
  return `${siteUrl}/api/badge-image/${encodeURIComponent(badgeKey)}?${params.toString()}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "account" });
  return buildMetadata({ locale, path: "account", title: t("title"), description: t("title"), noIndex: true });
}

interface BadgeRow {
  awarded_at: string;
  badges: {
    key: string;
    badge_translations: { locale: string; name: string; description: string | null }[];
  } | null;
}

interface AttemptRow {
  id: string;
  status: string;
  score: number;
  completed_at: string | null;
  challenges: {
    key: string;
    challenge_translations: { locale: string; title: string }[];
  } | null;
}

interface AssessmentRow {
  id: string;
  score: number | null;
  created_at: string;
  result: { domainScores?: Record<GreenTrustDomainKey, number>; riskClassification?: string } | null;
}

/**
 * Protected account page (Phase 8, Priority 2's "user profile" and
 * Priority 3/4's "user can return later and still see result").
 * Reads every table through the RLS-scoped Supabase server client
 * (never the service-role client), so this page can only ever return
 * the signed-in user's own rows: `tool_submissions_select`,
 * `attempts_owner_select`, `user_badges_owner_select`, and
 * `user_xp_totals_owner_select` (007_rls_policies.sql) already scope
 * every one of these queries to `auth.uid()` at the database level,
 * so there is no separate authorization check to get wrong here.
 */
export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${l}/login`);
  }

  const t = await getTranslations({ locale, namespace: "account" });
  const tAch = await getTranslations({ locale, namespace: "achievements" });

  const [{ data: profile }, { data: xpTotal }, { data: badgeRows }, { data: attemptRows }, { data: assessmentRows }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, created_at").eq("id", user.id).maybeSingle(),
      supabase.from("user_xp_totals").select("total_xp").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("user_badges")
        .select("awarded_at, badges(key, badge_translations(locale, name, description))")
        .eq("user_id", user.id),
      supabase
        .from("attempts")
        .select("id, status, score, completed_at, challenges(key, challenge_translations(locale, title))")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false }),
      supabase
        .from("tool_submissions")
        .select("id, score, created_at, result")
        .eq("user_id", user.id)
        .eq("tool_key", "greentrust_free_assessment")
        .order("created_at", { ascending: false }),
    ]);

  const badges = (badgeRows ?? []) as unknown as BadgeRow[];
  // CTF badges are a visually distinct track (see lib/achievements/ctf-catalog.ts)
  // but live in the exact same `user_badges` rows as Labs badges -- a
  // CTF flag's `badges.key` (e.g. "flag_hidden_in_plain_sight") simply
  // doesn't match any key in BADGE_KEY_TO_ACHIEVEMENT above, so this
  // split partitions the one query result into two render lists rather
  // than requiring a second database round-trip.
  const labsBadges = badges.filter((b) => !getCtfAchievementByBadgeKey(b.badges?.key ?? ""));
  const ctfBadges = badges.filter((b) => getCtfAchievementByBadgeKey(b.badges?.key ?? ""));
  const academyOrder = ["cyberDefense", "governance", "aiTrust", "dataTrust", "futureTrust"] as const;
  const earnedAchievementKeys = new Set(
    badges
      .map((b) => (b.badges?.key ? (BADGE_KEY_TO_ACHIEVEMENT[b.badges.key] ?? b.badges.key) : undefined))
      .filter(Boolean),
  );
  const academyProgress = academyOrder.map((academy) => {
    const entries = ACHIEVEMENT_CATALOG.filter((entry) => entry.academy === academy);
    const earned = entries.filter((entry) => earnedAchievementKeys.has(entry.key)).length;
    return { academy, total: entries.length, earned };
  });
  const attempts = (attemptRows ?? []) as unknown as AttemptRow[];
  const assessments = (assessmentRows ?? []) as unknown as AssessmentRow[];

  const memberSince = profile?.created_at
    ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(new Date(profile.created_at))
    : "";

  // CTF certificate CTA (CTF 2.0 Phase 2, founder instruction: "make
  // it a certificate for CTF that can be shown under account"). Reuses
  // the same getCtfCompletionStatus the CTF Path rail reads, so the
  // account page and /labs/ctf never disagree about whether a
  // certificate exists yet.
  const ctfCertStatus = await getCtfCompletionStatus();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 tablet:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Account avatar (founder instruction: "make my account an
              icon of user"). A generic user-circle glyph rather than a
              photo upload -- there is no avatar-image field or upload
              flow in this schema, and initials would require choosing
              a deterministic color scheme; the icon is the simplest
              correct representation of "this is a person's account". */}
          <span
            className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary tablet:h-14 tablet:w-14"
            aria-hidden="true"
          >
            <User className="h-6 w-6 tablet:h-7 tablet:w-7" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{t("title")}</p>
            <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">
              {profile?.full_name || t("title")}
            </h1>
            {memberSince && <p className="mt-1 text-sm text-text-muted">{t("memberSince", { date: memberSince })}</p>}
          </div>
        </div>
        <LogoutButton label={t("logoutCta")} />
      </div>

      {ctfCertStatus.allComplete && (
        <Link
          href={
            ctfCertStatus.certificateReference ? `/certificate/${ctfCertStatus.certificateReference}` : "/labs/ctf/certificate"
          }
          className="mt-6 flex items-center gap-3 rounded-lg border border-yellow-500/40 bg-gradient-to-r from-yellow-50 to-transparent px-4 py-3 text-sm font-semibold text-yellow-800 hover:from-yellow-100"
        >
          <Award className="h-5 w-5 shrink-0" aria-hidden="true" />
          {locale === "ar"
            ? ctfCertStatus.certificateReference
              ? "شهادة إتمام CTF جاهزة — عرضها ←"
              : "أكملت جميع تحديات CTF — احصل على شهادتك ←"
            : ctfCertStatus.certificateReference
              ? "Your CTF certificate is ready — view it →"
              : "All CTF challenges complete — claim your certificate →"}
        </Link>
      )}

      <Card className="mt-8">
        <CardContent className="flex items-center justify-between py-6">
          <span className="text-sm text-text-secondary">{t("xpLabel")}</span>
          <span className="font-display text-3xl font-bold text-primary">{xpTotal?.total_xp ?? 0}</span>
        </CardContent>
      </Card>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-text-primary">{t("badgesHeading")}</h2>
        {labsBadges.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">{t("noBadges")}</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-4">
            {labsBadges.map((b) => {
              const translation = b.badges?.badge_translations.find((tr) => tr.locale === locale);
              const achievement = achievementForBadgeKey(b.badges?.key);
              const badgeKey = b.badges?.key ?? "";
              const name = translation?.name ?? badgeKey;
              const slug = BADGE_SHARE_SLUG[badgeKey];
              const backHref = slug ? `/challenge/${slug}` : "/labs/decision-labs";
              const shareUrl = buildBadgeShareUrl(locale, badgeKey, name, achievement?.number, backHref);
              const shareImageUrl = buildBadgeImageUrl(locale, badgeKey, name, achievement?.number);
              const shareText =
                locale === "ar"
                  ? `حصلت للتو على شارة "${name}" في CyberAbeer Labs!`
                  : `I just earned the "${name}" badge on CyberAbeer Labs!`;
              const shareLabel = locale === "ar" ? "مشاركة" : "Share";
              return (
                <BadgeTile
                  key={badgeKey}
                  badgeKey={badgeKey}
                  name={name}
                  achievement={
                    achievement
                      ? { number: achievement.number, symbol: getAchievementSymbol(achievement.key) }
                      : null
                  }
                  locale={locale}
                  shareUrl={shareUrl}
                  shareText={shareText}
                  shareLabel={shareLabel}
                  shareImageUrl={shareImageUrl}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* CTF badges (founder instruction, 2026-08-02): a distinct medal
          design labeled "CTF 1".."CTF 6" (see AchievementMedal's
          arcText prop and lib/achievements/ctf-catalog.ts), shown only
          once actually earned -- directly beneath the Labs badges
          section above, mirroring how Labs badges only appear once
          the underlying badge row exists. No "not yet earned" ctf
          placeholders are rendered, matching the existing Labs
          section's noBadges fallback pattern. */}
      {ctfBadges.length > 0 && (
        <section className="mt-8">
          {/* Inlined bilingual heading rather than a new next-intl key:
              messages/en.json and messages/ar.json are large, shared
              files, and this section only needs one short string.
              Every other label here still routes through t()/tAch()
              as before. */}
          <h2 className="font-display text-lg font-semibold text-text-primary">
            {locale === "ar" ? "شارات CTF" : "CTF Badges"}
          </h2>
          <div className="mt-3 flex flex-wrap gap-4">
            {ctfBadges.map((b) => {
              const translation = b.badges?.badge_translations.find((tr) => tr.locale === locale);
              const badgeKey = b.badges?.key ?? "";
              const ctfAchievement = getCtfAchievementByBadgeKey(badgeKey);
              // Fix (2026-08-04): the CTF `badges` rows carry no
              // `badge_translations` (only Labs badges were backfilled
              // with those), so `translation` is always undefined here
              // -- falling straight back to the raw DB key (e.g.
              // "flag_hidden_in_plain_sight") produced the garbled,
              // overlapping text the founder flagged. getCtfBadgeName
              // reads the same bilingual name already authored per
              // challenge in lib/ctf/challenges.ts, so this now shows
              // a real title ("Hidden in Plain Sight") without needing
              // a database backfill.
              const name = translation?.name ?? getCtfBadgeName(badgeKey, l) ?? badgeKey;
              const backHref = ctfAchievement ? `/labs/ctf/${ctfAchievement.slug}` : "/labs/ctf";
              const shareUrl = buildBadgeShareUrl(locale, badgeKey, name, ctfAchievement?.number, backHref);
              const shareImageUrl = buildBadgeImageUrl(locale, badgeKey, name, ctfAchievement?.number);
              const shareText =
                locale === "ar"
                  ? `حصلت للتو على شارة "${name}" في CyberAbeer CTF!`
                  : `I just earned the "${name}" badge in CyberAbeer CTF!`;
              const shareLabel = locale === "ar" ? "مشاركة" : "Share";
              return (
                <BadgeTile
                  key={badgeKey}
                  badgeKey={badgeKey}
                  name={name}
                  achievement={
                    ctfAchievement
                      ? { number: ctfAchievement.number, symbol: getCtfAchievementSymbol(ctfAchievement.category) }
                      : null
                  }
                  locale={locale}
                  shareUrl={shareUrl}
                  shareText={shareText}
                  shareLabel={shareLabel}
                  shareImageUrl={shareImageUrl}
                  hrefOverride={ctfAchievement ? `/labs/ctf/${ctfAchievement.slug}` : "/labs/ctf"}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-text-primary">{tAch("academyHeading")}</h2>
        <div className="mt-3 space-y-3">
          {academyProgress.map(({ academy, earned, total }) => (
            <div key={academy} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">{tAch(`academies.${academy}.name`)}</span>
                <span className="text-xs text-text-muted">{tAch("academyProgressLabel", { earned, total })}</span>
              </div>
              <p className="mt-1 text-xs text-text-muted">{tAch(`academies.${academy}.description`)}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${total > 0 ? Math.round((earned / total) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-text-primary">{t("challengesHeading")}</h2>
        {attempts.length === 0 ? (
          <div className="mt-2 space-y-3">
            <p className="text-sm text-text-muted">{t("noChallenges")}</p>
            <Button asChild size="sm">
              <Link href="/challenge/first-defender">{t("startChallengeCta")}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {attempts.map((attempt) => {
              const translation = attempt.challenges?.challenge_translations.find((tr) => tr.locale === locale);
              return (
                <Card key={attempt.id}>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">{translation?.title ?? attempt.challenges?.key}</CardTitle>
                    <CardDescription>{t("challengeScoreLabel", { score: attempt.score })}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-text-primary">{t("greentrustHeading")}</h2>
        {assessments.length === 0 ? (
          <div className="mt-2 space-y-3">
            <p className="text-sm text-text-muted">{t("noAssessments")}</p>
            <Button asChild size="sm">
              <Link href="/free-tools/ai-governance-quick-check">{t("startAssessmentCta")}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">
                    {t("greentrustScoreLabel", { score: assessment.score ?? 0 })}
                  </CardTitle>
                  {assessment.result?.riskClassification && (
                    <CardDescription>{assessment.result.riskClassification}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
