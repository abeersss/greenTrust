import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { FreeAssessment } from "@/components/greentrust/free-assessment";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, learningResourceSchema } from "@/lib/seo/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "greentrustAssessment" });
  return buildMetadata({
    locale,
    path: "free-tools/ai-governance-quick-check",
    title: t("title"),
    description: t("intro"),
  });
}

/**
 * Phase 8: this route now hosts the real, deterministic 8-domain
 * GreenTrust Free Assessment (lib/assessments/greentrust-free.ts)
 * rather than the earlier 5-question generic quick-check. The path
 * (`free-tools/ai-governance-quick-check`) is kept as-is deliberately:
 * it is already linked from Free Tools, the GreenTrust marketing page,
 * the sitemap, and any external links, and changing it would only
 * create dead links for no benefit.
 */
export default async function GreenTrustFreeAssessmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "greentrustAssessment" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div data-brand="greentrust" className="mx-auto max-w-2xl px-4 py-12 tablet:px-6">
      <PageViewTracker event="greentrust_viewed" props={{ locale: l, page: "free_assessment" }} />
      <JsonLd
        data={[
          breadcrumbSchema(l, [
            { name: tNav("freeTools"), path: "free-tools" },
            { name: t("title"), path: "free-tools/ai-governance-quick-check" },
          ]),
          learningResourceSchema({
            locale: l,
            path: "free-tools/ai-governance-quick-check",
            name: t("title"),
            description: t("intro"),
            isFree: true,
          }),
        ]}
      />
      <SiteBreadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("freeTools"), href: "/free-tools" },
          { label: t("title") },
        ]}
      />

      <h1 className="sr-only">{t("title")}</h1>

      <div className="mt-8">
        <FreeAssessment locale={l} isLoggedIn={Boolean(user)} />
      </div>
    </div>
  );
}
