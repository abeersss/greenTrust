import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FirstDefenderChallenge } from "@/components/challenge/first-defender-challenge";
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
 * The Milestone 2 landing page: a free, bilingual, no-signup-required
 * interactive challenge, built as its own minimal-chrome route rather
 * than nested deep in Free Tools or Labs, because its primary traffic
 * source is a direct Instagram bio/story link, not on-site navigation.
 * Layout stays a single narrow column at every breakpoint (no sidebar,
 * no wide hero) since the whole page is designed to be legible and
 * fast on a phone opened from Instagram's in-app browser.
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
    <div data-brand="labs" className="mx-auto max-w-2xl px-4 py-8 tablet:px-6 tablet:py-12">
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
              <FirstDefenderChallenge locale={l} shareUrl={shareUrl} isAuthenticated={Boolean(user)} />
    </div>
  );
}
