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
  return buildMetadata({ locale, path: "achievements", title: t("pageTitle"), description: t("pageDescription"), noindex: true });
}

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

  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("badge_key, awarded_at")
    .eq("user_id", user.id);

  const { data: profile } = await supabase.from("profiles").select("xp_total").eq("id", user.id).single();

  const earnedKeys = new Set((userBadges ?? []).map((b) => b.badge_key));
  const awardedAtByKey = new Map((userBadges ?? []).map((b) => [b.badge_key, b.awarded_at as string]));

  return (
    <AchievementsGrid
      locale={locale as AppLocale}
      catalog={ACHIEVEMENT_CATALOG}
      earnedKeys={Array.from(earnedKeys)}
      awardedAtByKey={Object.fromEntries(awardedAtByKey)}
      totalXp={profile?.xp_total ?? 0}
    />
  );
}
