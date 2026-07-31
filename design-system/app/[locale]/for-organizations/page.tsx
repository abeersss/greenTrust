import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { EnterpriseEnquiryForm } from "@/components/forms/enterprise-enquiry-form";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { Link } from "@/lib/i18n/navigation";
import { GraduationCap, Building2, ArrowRight } from "lucide-react";

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
    path: "for-organizations",
    title: t("forOrganizationsTitle"),
    description: t("forOrganizationsDescription"),
  });
}

/**
 * Orientation page for the 2026-07-29 strategic update: CyberAbeer is
 * free for individuals (learning, labs, tools, assessments); GreenTrust
 * AI is the paid enterprise product. This page exists so an
 * organizational visitor lands somewhere that explains that split in
 * plain terms before being routed to GreenTrust's deeper marketing
 * page and existing enterprise enquiry form -- it deliberately does
 * not duplicate GreenTrust's pillar/capability content, only explains
 * the two-audience model and links onward.
 */
export default async function ForOrganizationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "forOrganizations" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <div>
      <PageViewTracker event="for_organizations_viewed" props={{ locale: l }} />
      <JsonLd data={breadcrumbSchema(l, [{ name: tNav("forOrganizations"), path: "for-organizations" }])} />

      <div className="mx-auto max-w-6xl px-4 pt-8 tablet:px-6">
        <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("forOrganizations") }]} />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-12 text-center tablet:py-16">
        <Badge variant="primary" className="mb-4">
          {t("kicker")}
        </Badge>
        <h1 className="font-display text-3xl font-bold text-text-primary tablet:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">{t("heroSubtitle")}</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 tablet:flex-row">
          <Button asChild size="lg">
            <a href="#request-review">
              {t("primaryCta")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/greentrust">{t("secondaryCta")}</Link>
          </Button>
        </div>
      </section>

      {/* Two audiences */}
      <section className="mx-auto max-w-6xl px-4 py-12 tablet:px-6">
        <h2 className="text-center font-display text-xl font-semibold text-text-primary">
          {t("splitHeading")}
        </h2>
        <div className="mt-8 grid gap-6 tablet:grid-cols-2">
          <Card className="flex flex-col p-2">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-accent/10 text-accent">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="font-display text-xl">{t("individualHeading")}</CardTitle>
              <CardDescription>{t("individualBody")}</CardDescription>
            </CardHeader>
            <div className="mt-auto p-6 pt-0">
              <Button asChild variant="outline" size="sm">
                <Link href="/free-tools">
                  {t("individualCta")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Card>

          <Card data-brand="greentrust" className="flex flex-col p-2">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="font-display text-xl">{t("orgHeading")}</CardTitle>
              <CardDescription>{t("orgBody")}</CardDescription>
            </CardHeader>
            <div className="mt-auto p-6 pt-0">
              <Button asChild variant="outline" size="sm">
                <Link href="/greentrust">
                  {t("orgCta")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Free organizational tool */}
      <section className="mx-auto max-w-4xl px-4 py-12 text-center tablet:px-6">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {l === "ar" ? "أداة تقييم مجانية" : "A free assessment tool"}
        </h2>
        <p className="mt-3 text-text-secondary">
          {l === "ar"
            ? "قبل حجز مراجعة مؤسسية، جرّب تقييم النضج الأمني السيبراني المجاني القائم على إطار NIST CSF 2.0."
            : "Before booking an enterprise review, try the free Cybersecurity Posture Assessment built on the NIST CSF 2.0 framework."}
        </p>
        <div className="mt-6">
          <Button asChild size="lg" variant="outline">
            <Link href="/for-organizations/cybersecurity-posture-assessment">
              {l === "ar" ? "ابدأ تقييم النضج الأمني السيبراني" : "Start the Cybersecurity Posture Assessment"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      {/* What organizations pay for */}
      <section className="border-y border-border bg-surface-raised">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center tablet:px-6">
          <h2 className="font-display text-xl font-semibold text-text-primary">{t("whatPaysHeading")}</h2>
          <p className="mt-3 text-text-secondary">{t("whatPaysBody")}</p>
        </div>
      </section>

      {/* Enquiry form */}
      <section id="request-review" className="mx-auto max-w-xl px-4 py-16 tablet:px-6">
        <h2 className="text-center font-display text-2xl font-semibold text-text-primary">
          {t("formHeading")}
        </h2>
        <p className="mt-2 text-center text-text-secondary">{t("formBody")}</p>
        <div className="mt-8">
          <EnterpriseEnquiryForm locale={l} />
        </div>
        <p className="mt-6 text-center text-xs text-text-muted">{t("formNote")}</p>
      </section>
    </div>
  );
}
