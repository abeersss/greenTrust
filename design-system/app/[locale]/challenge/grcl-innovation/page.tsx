import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { GRCLInnovationChallenge } from "@/components/challenge/grcl-innovation-challenge";
import { JsonLd } from "@/components/site/json-ld";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, learningResourceSchema } from "@/lib/seo/schema";
import { siteUrl } from "@/lib/seo/site";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TITLE = { en: "GRCL: Innovation Under Fire | CyberAbeer Decision Labs", ar: "GRCL: الابتكار تحت الضغط | معامل قرار CyberAbeer" };
// PHASE 8 SEO pass (2026-08-01): trimmed from ~247/216 chars to match the
// ~160-195 char range every other lab's meta description already uses
// (first-defender 164, data-guardian 170, network-guardian 194) so Google
// stops truncating this mid-sentence in search results -- the original
// copy is preserved verbatim as on-page body copy in
// grcl-innovation-challenge.tsx, only the <meta name="description"> is shorter.
const DESCRIPTION = {
  en: "Sit on an Innovation Review Board and defend five realistic governance decisions using Dr. Abeer Alshammari's GRCL framework. Free, no signup required to play.",
  ar: "اجلس في مجلس مراجعة الابتكار ودافع عن خمسة قرارات حوكمة واقعية باستخدام إطار GRCL للدكتورة عبير الشمري. مجاني ولا يتطلب تسجيلاً للعب.",
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
    path: "challenge/grcl-innovation",
    title: locale === "ar" ? TITLE.ar : TITLE.en,
    description: locale === "ar" ? DESCRIPTION.ar : DESCRIPTION.en,
  });
}

/**
 * Decision Labs, lab 5 of 6: GRCL: Innovation Under Fire. Follows the
 * exact routing and SEO pattern established by /challenge/data-guardian
 * (itself following /challenge/soc-night-shift and
 * /challenge/network-guardian) -- generateMetadata + breadcrumb/
 * learningResource JSON-LD + a page-view tracker -- with title/
 * description authored as inline bilingual literals here, matching
 * how this lab's own copy is authored (see
 * grcl-innovation-challenge.tsx).
 */
export default async function GRCLInnovationChallengePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const shareUrl = `${siteUrl}/${l}/challenge/grcl-innovation`;
  const supabase = await createSupabaseServerClient();
  const authResult = await supabase.auth.getUser();
  const user = authResult.data.user;

  return (
    <div data-brand="labs" className="mx-auto max-w-6xl px-4 py-8 tablet:px-6 tablet:py-12">
      <PageViewTracker event="challenge_viewed" props={{ locale: l }} />
      <JsonLd
        data={[
          breadcrumbSchema(l, [{ name: tNav("challenge"), path: "challenge/grcl-innovation" }]),
          learningResourceSchema({
            locale: l,
            path: "challenge/grcl-innovation",
            name: l === "ar" ? TITLE.ar : TITLE.en,
            description: l === "ar" ? DESCRIPTION.ar : DESCRIPTION.en,
            isFree: true,
          }),
        ]}
      />
      <GRCLInnovationChallenge locale={l} shareUrl={shareUrl} isAuthenticated={Boolean(user)} />
    </div>
  );
}
