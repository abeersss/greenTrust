import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AgentZeroChallenge } from "@/components/challenge/agent-zero-challenge";
import { JsonLd } from "@/components/site/json-ld";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, learningResourceSchema } from "@/lib/seo/schema";
import { siteUrl } from "@/lib/seo/site";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TITLE = { en: "Agent Zero | CyberAbeer Decision Labs", ar: "العميل زيرو | معامل قرار CyberAbeer" };
const DESCRIPTION = {
  en: "Contain a rogue AI agent before it escalates its own permissions: investigate five realistic signals, from a prompt-injection payload to a silent IAM privilege escalation, and decide whether to allow, add human approval, revoke a permission, or terminate the session. Free, no signup required to play.",
  ar: "احتوِ وكيل ذكاء اصطناعي مارقًا قبل أن يصعّد صلاحياته الخاصة: افحص خمس إشارات واقعية، من حمولة حقن أوامر إلى تصعيد صلاحيات صامت في إدارة الهوية والوصول، وقرري بين السماح أو إضافة موافقة بشرية أو سحب صلاحية أو إنهاء الجلسة. مجاني ولا يتطلب تسجيلاً للعب.",
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
    path: "challenge/agent-zero",
    title: locale === "ar" ? TITLE.ar : TITLE.en,
    description: locale === "ar" ? DESCRIPTION.ar : DESCRIPTION.en,
  });
}

/**
 * Decision Labs, lab 6 of 6 (final lab in the series): Agent Zero. Follows
 * the exact routing and SEO pattern established by /challenge/grcl-innovation
 * (itself following /challenge/data-guardian, /challenge/soc-night-shift,
 * and /challenge/network-guardian) -- generateMetadata + breadcrumb/
 * learningResource JSON-LD + a page-view tracker -- with title/description
 * authored as inline bilingual literals here, matching how this lab's own
 * copy is authored (see agent-zero-challenge.tsx).
 */
export default async function AgentZeroChallengePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const shareUrl = `${siteUrl}/${l}/challenge/agent-zero`;
  const supabase = await createSupabaseServerClient();
  const authResult = await supabase.auth.getUser();
  const user = authResult.data.user;

  return (
    <div data-brand="labs" className="mx-auto max-w-6xl px-4 py-8 tablet:px-6 tablet:py-12">
      <PageViewTracker event="challenge_viewed" props={{ locale: l }} />
      <JsonLd
        data={[
          breadcrumbSchema(l, [{ name: tNav("challenge"), path: "challenge/agent-zero" }]),
          learningResourceSchema({
            locale: l,
            path: "challenge/agent-zero",
            name: l === "ar" ? TITLE.ar : TITLE.en,
            description: l === "ar" ? DESCRIPTION.ar : DESCRIPTION.en,
            isFree: true,
          }),
        ]}
      />
      <AgentZeroChallenge locale={l} shareUrl={shareUrl} isAuthenticated={Boolean(user)} />
    </div>
  );
}
