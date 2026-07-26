import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { QuickAssessment } from "@/components/free-tools/quick-assessment";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "assessment" });
  return buildMetadata({
    locale,
    path: "free-tools/quantum-readiness-quick-check",
    title: t("quantum.title"),
    description: t("quantum.intro"),
  });
}

export default async function QuantumQuickCheckPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "assessment.quantum" });
  const tFreeTools = await getTranslations({ locale, namespace: "freeTools" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const questions = t.raw("questions") as { prompt: string; options: string[] }[];

  return (
    <div data-brand="greentrust" className="mx-auto max-w-2xl px-4 py-12 tablet:px-6">
      <JsonLd
        data={breadcrumbSchema(l, [
          { name: tNav("freeTools"), path: "free-tools" },
          { name: t("title"), path: "free-tools/quantum-readiness-quick-check" },
        ])}
      />
      <SiteBreadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("freeTools"), href: "/free-tools" },
          { label: t("title") },
        ]}
      />

      <h1 className="mt-6 font-display text-2xl font-bold text-text-primary tablet:text-3xl">{t("title")}</h1>

      <div className="mt-8">
        <QuickAssessment
          toolKey="quantum_quick_assessment"
          locale={l}
          questions={questions}
          intro={t("intro")}
          resultHeading={t("resultHeading")}
          resultLow={t("resultLow")}
          resultMedium={t("resultMedium")}
          resultHigh={t("resultHigh")}
          ctaReportLabel={t("ctaReport")}
        />
      </div>

      <p className="mt-10 text-center text-xs text-text-muted">{tFreeTools("disclaimer")}</p>
    </div>
  );
}
