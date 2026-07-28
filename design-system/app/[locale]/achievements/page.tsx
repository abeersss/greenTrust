import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements/catalog";
import { AchievementsGrid } from "@/components/achievements/achievements-grid";
import { buildMetadata } from "@/lib/seo/metadata";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "achievements" });
  // Private, account-specific content: never indexable (Section 11 rule
  // that private/account pages must not be indexable).
  return buildMetadata({ locale, path: "achievements", title: t("pageTitle"), description: t("pageDescription"), noIndex: true });
}

// Same DB-key ambiguity as account/page.tsx: migration 010 shipped
// `badges.key = 'first_defender'`, and a later, never-pushed migration
// may have renamed it to `phishing_hunter` directly against the live
// database. Map both onto the catalog's camelCase key so a real earned
// badge always renders gold here regardless of which name is live.
const BADGE_KEY_TO_ACHIEVEMENT_KEY: Record<string, string> = {
  first_defender: "phishingHunter",
  phishing_hunter: "phishingHunter",
};

/**
 * "My Achievements" -- the collection page from the founder's
 * achievement-system spec. Requires a session (this is the learner's
 * own progress, not public); an anonymous visitor is sent to log in
 * rather than shown an empty/locked wall that isn't really theirs.
 *
 * Only achievement 01 (Phishing Hunter) has real medal art and a real
 * `challengeKey` right now (see lib/achievements/catalog.ts) -- every
 * other slot renders as a generic locked placeholder (number + name
 * only, no unique symbol) until each one is actually built, per the
 * founder's explicit "do not create all 12 medal graphics yet"
 * instruction.
 */
export default async function AchievementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // Same tables/columns account/page.tsx already reads successfully:
  // XP lives on `user_xp_totals.total_xp` (not `profiles.xp_total`, which
  // doesn't hold a live total), and the badge's real key lives on the
  // joined `badges.key` (not a flat `badge_key` column on `user_badges`
  // itself). Querying the wrong shape doesn't error loudly here since
  // Supabase just returns null/empty on a bad relation, which is exactly
  // why this page previously showed 0 XP and every achievement locked
  // even for a user who had genuinely earned one.
  const [{ data: userBadges }, { data: xpTotal }] = await Promise.all([
    supabase
      .from("user_badges")
      .select("awarded_at, badges(key)")
      .eq("user_id", user.id),
    supabase.from("user_xp_totals").select("total_xp").eq("user_id", user.id).maybeSingle(),
  ]);

  const badgeRows = (userBadges ?? []) as unknown as { awarded_at: string; badges: { key: string } | null }[];

  const earnedKeys = new Set(
    badgeRows
      .map((b) => b.badges?.key)
      .filter((key): key is string => Boolean(key))
      .map((key) => BADGE_KEY_TO_ACHIEVEMENT_KEY[key] ?? key)
  );
  const awardedAtByKey = new Map(
    badgeRows
      .filter((b) => b.badges?.key)
      .map((b) => [BADGE_KEY_TO_ACHIEVEMENT_KEY[b.badges!.key] ?? b.badges!.key, b.awarded_at])
  );

  return (
    <AchievementsGrid
      locale={locale as AppLocale}
      catalog={ACHIEVEMENT_CATALOG}
      earnedKeys={Array.from(earnedKeys)}
      awardedAtByKey={Object.fromEntries(awardedAtByKey)}
      totalXp={xpTotal?.total_xp ?? 0}
    />
  );
}
