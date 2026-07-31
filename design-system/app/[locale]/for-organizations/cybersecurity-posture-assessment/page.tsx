import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { CyberPostureAssessment } from "@/components/organizational-tools/cybersecurity-posture-assessment";

const COPY = {
  en: {
    title: "Cybersecurity Posture Assessment | CyberAbeer",
    description:
      "Free 30-question self-assessment across the six NIST CSF 2.0 functions. See your organization's cybersecurity maturity in about 10 minutes.",
    breadcrumb: "Cybersecurity Posture Assessment",
    forOrganizations: "For Organizations",
    home: "Home",
  },
  ar: {
    title: "تقييم النضج الأمني السيبراني | سايبر أبير",
    description:
      "تقييم ذاتي مجاني من 30 سؤالًا يغطي وظائف إطار NIST CSF 2.0 الست. تعرّف على نضج مؤسستك الأمني خلال 10 دقائق تقريبًا.",
    breadcrumb: "تقييم النضج الأمني السيبراني",
    forOrganizations: "للمؤسسات",
    home: "الرئيسية",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const c = COPY[locale as AppLocale];
  return buildMetadata({
    locale,
    path: "for-organizations/cybersecurity-posture-assessment",
    title: c.title,
    description: c.description,
  });
}

/**
 * Free web version of the paid "Cybersecurity Posture Assessment Tool"
 * ($47 on abeergrc.netlify.app) -- migrated per the founder's explicit
 * decision to make it free. Scoring, question text, and rating
 * thresholds are carried over verbatim from the source Excel workbook
 * (see lib/organizational-tools/cybersecurity-posture.ts for the full
 * provenance note).
 */
export default async function CyberPostureAssessmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  const c = COPY[l];

  return (
    <div>
      <PageViewTracker event="cyber_posture_assessment_viewed" props={{ locale: l }} />
      <JsonLd
        data={breadcrumbSchema(l, [
          { name: c.forOrganizations, path: "for-organizations" },
          { name: c.breadcrumb, path: "for-organizations/cybersecurity-posture-assessment" },
        ])}
      />
      <div className="mx-auto max-w-6xl px-4 pt-8 tablet:px-6">
        <SiteBreadcrumb
          items={[
            { label: c.home, href: "/" },
            { label: c.forOrganizations, href: "/for-organizations" },
            { label: c.breadcrumb },
          ]}
        />
      </div>
      <section className="mx-auto max-w-6xl px-4 py-12 tablet:px-6">
        <CyberPostureAssessment locale={l} />
      </section>
    </div>
  );
}
