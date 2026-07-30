import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SocNightShiftChallenge } from "@/components/challenge/soc-night-shift-challenge";
import { JsonLd } from "@/components/site/json-ld";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, learningResourceSchema } from "@/lib/seo/schema";
import { siteUrl } from "@/lib/seo/site";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TITLE = { en: "SOC Night Shift | CyberAbeer Decision Labs", ar: "مناوبة مركز العمليات الليلية | معامل قرار CyberAbeer" };
const DESCRIPTION = {
  en: "You're the only analyst on shift. Investigate a queue of five real-looking alerts with a limited investigation budget, then decide what to escalate, monitor, or close. Free, no signup required to play.",
  ar: "أنت المحلل الوحيد في المناوبة. تحقق في قائمة من خمسة تنبيهات واقعية بميزانية تحقيق محدودة، ثم قرر ما الذي يجب تصعيده أو مراقبته أو إغلاقه. مجاني ولا يتطلب تسجيلاً للعب.",
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
    path: "challenge/soc-night-shift",
    title: locale === "ar" ? TITLE.ar : TITLE.en,
    description: locale === "ar" ? DESCRIPTION.ar : DESCRIPTION.en,
  });
}

/**
 * BATCH B, lab 3 of 6: SOC Night Shift. Follows the exact routing and
 * SEO pattern established by /challenge/network-guardian and
 * /challenge/first-defender -- generateMetadata + breadcrumb/
 * learningResource JSON-LD + a page-view tracker -- with title/
 * description authored as inline bilingual literals here, matching
 * how this lab's own copy is authored (see
 * soc-night-shift-challenge.tsx).
 */
export default async function SocNightShiftChallengePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const shareUrl = `${siteUrl}/${l}/challenge/soc-night-shift`;
  const supabase = await createSupabaseServerClient();
  const authResult = await supabase.auth.getUser();
  const user = authResult.data.user;

  return (
    <div data-brand="labs" className="mx-auto max-w-6xl px-4 py-8 tablet:px-6 tablet:py-12">
      <PageViewTracker event="challenge_viewed" props={{ locale: l }} />
      <JsonLd
        data={[
          breadcrumbSchema(l, [{ name: tNav("challenge"), path: "challenge/soc-night-shift" }]),
          learningResourceSchema({
            locale: l,
            path: "challenge/soc-night-shift",
            name: l === "ar" ? TITLE.ar : TITLE.en,
            description: l === "ar" ? DESCRIPTION.ar : DESCRIPTION.en,
            isFree: true,
          }),
        ]}
      />
      <SocNightShiftChallenge locale={l} shareUrl={shareUrl} isAuthenticated={Boolean(user)} />
    </div>
  );
}
