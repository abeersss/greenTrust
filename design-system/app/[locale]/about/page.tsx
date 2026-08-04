import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { Link } from "@/lib/i18n/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { personSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { ShieldCheck, GraduationCap, Briefcase, Users } from "lucide-react";

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
    path: "about",
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "about" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const credentials = t.raw("credentials") as string[];
  const experienceItems = t.raw("experienceItems") as {
    period: string;
    title: string;
    summary: string;
  }[];
  const educationItems = t.raw("educationItems") as string[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 tablet:px-6">
      <JsonLd data={[personSchema(l), breadcrumbSchema(l, [{ name: tNav("about"), path: "about" }])]} />

      <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("about") }]} />

      <Badge variant="primary" className="mt-6">
        {t("kicker")}
      </Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary tablet:text-4xl">{t("title")}</h1>
      <p className="mt-1 text-lg text-text-secondary">{t("roleLine")}</p>

      <div className="mt-8 space-y-4 text-text-secondary">
        <p>{t("introParagraph1")}</p>
        <p>{t("introParagraph2")}</p>
        <p>{t("introParagraph3")}</p>
      </div>

      {/* Credentials */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-text-primary">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          {t("credentialsHeading")}
        </h2>
        <ul className="mt-4 grid gap-2 tablet:grid-cols-2">
          {credentials.map((credential) => (
            <li
              key={credential}
              className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-secondary"
            >
              {credential}
            </li>
          ))}
        </ul>
      </section>

      {/* Experience */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-text-primary">
          <Briefcase className="h-5 w-5 text-primary" aria-hidden="true" />
          {t("experienceHeading")}
        </h2>
        <p className="mt-2 text-text-secondary">{t("experienceIntro")}</p>
        <ol className="mt-6 space-y-6 border-s-2 border-border ps-6">
          {experienceItems.map((item) => (
            <li key={item.period}>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.period}</p>
              <p className="mt-1 font-display font-semibold text-text-primary">{item.title}</p>
              <p className="mt-1 text-sm text-text-secondary">{item.summary}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Education */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-text-primary">
          <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
          {t("educationHeading")}
        </h2>
        <ul className="mt-4 space-y-2">
          {educationItems.map((item) => (
            <li key={item} className="text-text-secondary">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-card border border-border bg-surface-raised p-4">
          <p className="text-sm font-semibold text-text-primary">{t("dissertationHeading")}</p>
          <p className="mt-1 text-sm italic text-text-secondary">{t("dissertationTitle")}</p>
          <Link href="/research" className="mt-2 inline-block text-sm text-primary hover:underline">
            {t("researchCta")}
          </Link>
        </div>
      </section>

      {/* Memberships */}
      <section className="mt-12 mb-4">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-text-primary">
          <Users className="h-5 w-5 text-primary" aria-hidden="true" />
          {t("membershipsHeading")}
        </h2>
        <p className="mt-2 text-text-secondary">{t("membershipsBody")}</p>
      </section>
    </div>
  );
}
