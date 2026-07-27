import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PhishingHunterChallenge } from "@/components/challenge/phishing-hunter-challenge";
import { JsonLd } from "@/components/site/json-ld";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, learningResourceSchema } from "@/lib/seo/schema";
import { siteUrl } from "@/lib/seo/site";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({
    locale,
    path: "challenge/first-defender",
    title: t("challengeFirstDefenderTitle"),
    description: t("challengeFirstDefenderDescription"),
  });
}

/**
 * CONTINUE BATCH A (2026-07-27): this route now renders the rebuilt
 * CyberAbeer Decision Labs™ Phishing Hunter™ investigation workstation
 * (components/challenge/phishing-hunter-challenge.tsx) instead of the
 * old First Defender quiz component. The URL slug and the underlying
 * challenge key ("first_defender_spot_the_phish") are both unchanged,
 * so every existing bio/story link, the seeded `challenges` row, and
 * the badge mapping in lib/challenges/keys.ts keep working without a
 * migration; only the gameplay behind this route is new. The old quiz
 * component (components/challenge/first-defender-challenge.tsx) is
 * kept in the repo, still compiling, but is no longer reachable from
 * any route.
 */
export default async function FirstDefenderChallengePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "seo" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const shareUrl = `${siteUrl}/${l}/challenge/first-defender`;
  const supabase = await createSupabaseServerClient();
  const authResult = await supabase.auth.getUser();
  const user = authResult.data.user;

  return (
    <div data-brand="labs" className="mx-auto max-w-6xl px-4 py-8 tablet:px-6 tablet:py-12">
      <PageViewTracker event="challenge_viewed" props={{ locale: l }} />
      <JsonLd
        data={[
          breadcrumbSchema(l, [{ name: tNav("challenge"), path: "challenge/first-defender" }]),
          learningResourceSchema({
            locale: l,
            path: "challenge/first-defender",
            name: t("challengeFirstDefenderTitle"),
            description: t("challengeFirstDefenderDescription"),
            isFree: true,
          }),
        ]}
      />
      <PhishingHunterChallenge locale={l} shareUrl={shareUrl} isAuthenticated={Boolean(user)} />
    </div>
  );
}
