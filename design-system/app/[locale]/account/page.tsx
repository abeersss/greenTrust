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
  const attempts = (attemptRows ?? []) as unknown as AttemptRow[];
  const assessments = (assessmentRows ?? []) as unknown as AssessmentRow[];

  const memberSince = profile?.created_at
    ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(new Date(profile.created_at))
    : "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 tablet:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">
            {profile?.full_name ? `${t("title")} — ${profile.full_name}` : t("title")}
          </h1>
          {memberSince && <p className="mt-1 text-sm text-text-muted">{t("memberSince", { date: memberSince })}</p>}
        </div>
        <LogoutButton label={t("logoutCta")} />
      </div>

      <Card className="mt-8">
        <CardContent className="flex items-center justify-between py-6">
          <span className="text-sm text-text-secondary">{t("xpLabel")}</span>
          <span className="font-display text-3xl font-bold text-primary">{xpTotal?.total_xp ?? 0}</span>
        </CardContent>
      </Card>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-text-primary">{t("badgesHeading")}</h2>
        {badges.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">{t("noBadges")}</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.map((b) => {
              const translation = b.badges?.badge_translations.find((tr) => tr.locale === locale);
              return (
                <Badge key={b.badges?.key} variant="success">
                  {translation?.name ?? b.badges?.key}
                </Badge>
              );
            })}
          </div>
        )}
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
