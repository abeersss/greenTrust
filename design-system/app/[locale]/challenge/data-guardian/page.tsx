import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DataGuardianChallenge } from "@/components/challenge/data-guardian-challenge";
import { JsonLd } from "@/components/site/json-ld";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, learningResourceSchema } from "@/lib/seo/schema";
import { siteUrl } from "@/lib/seo/site";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TITLE = { en: "Data Guardian | CyberAbeer Decision Labs", ar: "حارس البيانات | معامل قرار CyberAbeer" };
const DESCRIPTION = {
  en: "Audit five realistic data assets with a limited investigation budget, then decide whether to restrict, monitor, or leave each one as-is. Free, no signup required to play.",
  ar: "دقّق خمسة أصول بيانات واقعية بميزانية تحقيق محدودة، ثم قرر ما إذا كنت ستقيّد كل أصل أو تراقبه أو تتركه كما هو. مجاني ولا يتطلب تسجيلاً للعب.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  return buildMetadata({
    locale,
    path: "challenge/data-guardian",
    title: locale === "ar" ? TITLE.ar : TITLE.en,
    description: locale === "ar" ? DESCRIPTION.ar : DESCRIPTION.en,
  });
}

/**
 * BATCH B, lab 4 of 6: Data Guardian. Follows the exact routing and
 * SEO pattern established by /challenge/soc-night-shift and
 * /challenge/network-guardian -- generateMetadata + breadcrumb/
 * learningResource JSON-LD + a page-view tracker -- with title/
 * description authored as inline bilingual literals here, matching
 * how this lab's own copy is authored (see
 * data-guardian-challenge.tsx).
 */
export default async function DataGuardianChallengePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const shareUrl = `${siteUrl}/${l}/challenge/data-guardian`;
  const supabase = await createSupabaseServerClient();
  const authResult = await supabase.auth.getUser();
  const user = authResult.data.user;

  return (
    <div data-brand="labs" className="mx-auto max-w-6xl px-4 py-8 tablet:px-6 tablet:py-12">
      <PageViewTracker event="challenge_viewed" props={{ locale: l }} />
      <JsonLd
        data={[
          breadcrumbSchema(l, [{ name: tNav("challenge"), path: "challenge/data-guardian" }]),
          learningResourceSchema({
            locale: l,
            path: "challenge/data-guardian",
            name: l === "ar" ? TITLE.ar : TITLE.en,
            description: l === "ar" ? DESCRIPTION.ar : DESCRIPTION.en,
            isFree: true,
          }),
        ]}
      />
      <DataGuardianChallenge locale={l} shareUrl={shareUrl} isAuthenticated={Boolean(user)} />
    </div>
  );
}
