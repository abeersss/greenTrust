import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { ContactForm } from "@/components/forms/contact-form";
import { EnterpriseEnquiryForm } from "@/components/forms/enterprise-enquiry-form";
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
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({
    locale,
    path: "contact",
    title: t("contactTitle"),
    description: t("contactDescription"),
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "contact" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 tablet:px-6">
      <JsonLd data={breadcrumbSchema(l, [{ name: tNav("contact"), path: "contact" }])} />
      <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("contact") }]} />

      <Badge variant="primary" className="mt-6">
        {t("kicker")}
      </Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary tablet:text-4xl">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">{t("intro")}</p>

      <div className="mt-10 grid gap-8 tablet:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("generalHeading")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm locale={l} />
          </CardContent>
        </Card>

        <Card data-brand="greentrust">
          <CardHeader>
            <CardTitle>{t("enterpriseHeading")}</CardTitle>
            <CardDescription>{t("enterpriseIntro")}</CardDescription>
          </CardHeader>
          <CardContent>
            <EnterpriseEnquiryForm locale={l} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
