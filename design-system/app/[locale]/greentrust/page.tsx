import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { EnterpriseEnquiryForm } from "@/components/forms/enterprise-enquiry-form";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getVerifiedTestimonials } from "@/lib/content/social-proof";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { Bot, ShieldAlert, Atom, FileCheck2 } from "lucide-react";

const pillarIcons = [Bot, ShieldAlert, Atom, FileCheck2];

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
    path: "greentrust",
    title: t("greentrustTitle"),
    description: t("greentrustDescription"),
  });
}

export default async function GreenTrustPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "greentrust" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const pillars = t.raw("pillars") as { title: string; body: string }[];
  const testimonials = await getVerifiedTestimonials("greentrust");

  return (
    <div data-brand="greentrust">
      <PageViewTracker event="greentrust_viewed" props={{ locale: l }} />
      <JsonLd data={breadcrumbSchema(l, [{ name: tNav("greentrust"), path: "greentrust" }])} />

      <div className="mx-auto max-w-6xl px-4 pt-8 tablet:px-6">
        <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("greentrust") }]} />
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
      </section>

      {/* What it does */}
      <section className="mx-auto max-w-3xl px-4 pb-4 text-center tablet:px-6">
        <h2 className="font-display text-2xl font-semibold text-text-primary">{t("whatHeading")}</h2>
        <p className="mt-3 text-text-secondary">{t("whatBody")}</p>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-12 tablet:px-6">
        <h2 className="text-center font-display text-xl font-semibold text-text-primary">
          {t("pillarsHeading")}
        </h2>
        <div className="mt-8 grid gap-6 tablet:grid-cols-2">
          {pillars.map((pillar, index) => {
            const Icon = pillarIcons[index] ?? Bot;
            return (
              <Card key={pillar.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <CardTitle>{pillar.title}</CardTitle>
                  <CardDescription>{pillar.body}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-y border-border bg-surface-raised">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center tablet:px-6">
          <h2 className="font-display text-xl font-semibold text-text-primary">{t("whoHeading")}</h2>
          <p className="mt-3 text-text-secondary">{t("whoBody")}</p>
        </div>
      </section>

      {/* Testimonials: only rendered if real, verified ones exist. */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 py-12 tablet:px-6">
          <div className="grid gap-6 tablet:grid-cols-2">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardHeader>
                  <CardDescription className="text-base italic">&ldquo;{testimonial.quote}&rdquo;</CardDescription>
                  <p className="mt-2 text-sm font-semibold text-text-primary">{testimonial.authorName}</p>
                  {(testimonial.authorTitle || testimonial.authorOrganization) && (
                    <p className="text-xs text-text-muted">
                      {[testimonial.authorTitle, testimonial.authorOrganization].filter(Boolean).join(", ")}
                    </p>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Waitlist / enquiry form */}
      <section id="request-access" className="mx-auto max-w-xl px-4 py-16 tablet:px-6">
        <h2 className="text-center font-display text-2xl font-semibold text-text-primary">
          {t("formHeading")}
        </h2>
        <p className="mt-2 text-center text-text-secondary">{t("formBody")}</p>
        <div className="mt-8">
          <EnterpriseEnquiryForm locale={l} />
        </div>
        <p className="mt-6 text-center text-xs text-text-muted">{t("waitlistNote")}</p>
      </section>
    </div>
  );
}
