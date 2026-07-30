import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { NetworkGuardianChallenge } from "@/components/challenge/network-guardian-challenge";
import { JsonLd } from "@/components/site/json-ld";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, learningResourceSchema } from "@/lib/seo/schema";
import { siteUrl } from "@/lib/seo/site";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TITLE = { en: "Network Guardian | CyberAbeer Decision Labs", ar: "حارس الشبكة | معامل قرار CyberAbeer" };
const DESCRIPTION = {
  en: "Defend a customer database against a simulated network intrusion. Choose which security controls to place, then watch the attack unfold based on your decisions. Free, no signup required to play.",
  ar: "دافع عن قاعدة بيانات العملاء ضد اختراق شبكي محاكى. اختر الضوابط الأمنية التي ستضعها، ثم شاهد كيف تتطور الهجمة بناءً على قراراتك. مجاني ولا يتطلب تسجيلاً للعب.",
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
    path: "challenge/network-guardian",
    title: locale === "ar" ? TITLE.ar : TITLE.en,
    description: locale === "ar" ? DESCRIPTION.ar : DESCRIPTION.en,
  });
}

/**
 * BATCH A, lab 2 of 6: Network Guardian. Follows the exact routing and
 * SEO pattern established by /challenge/first-defender (Phishing
 * Hunter) -- generateMetadata + breadcrumb/learningResource JSON-LD +
 * a page-view tracker -- but title/description are authored as inline
 * bilingual literals here rather than routed through
 * messages/en.json / messages/ar.json, matching how this lab's own
 * gameplay copy is authored (see network-guardian-challenge.tsx).
 */
export default async function NetworkGuardianChallengePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const shareUrl = `${siteUrl}/${l}/challenge/network-guardian`;
  const supabase = await createSupabaseServerClient();
  const authResult = await supabase.auth.getUser();
  const user = authResult.data.user;

  return (
    <div data-brand="labs" className="mx-auto max-w-6xl px-4 py-8 tablet:px-6 tablet:py-12">
      <PageViewTracker event="challenge_viewed" props={{ locale: l }} />
      <JsonLd
        data={[
          breadcrumbSchema(l, [{ name: tNav("challenge"), path: "challenge/network-guardian" }]),
          learningResourceSchema({
            locale: l,
            path: "challenge/network-guardian",
            name: l === "ar" ? TITLE.ar : TITLE.en,
            description: l === "ar" ? DESCRIPTION.ar : DESCRIPTION.en,
            isFree: true,
          }),
        ]}
      />
      <NetworkGuardianChallenge locale={l} shareUrl={shareUrl} isAuthenticated={Boolean(user)} />
    </div>
  );
}
