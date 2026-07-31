import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { Link } from "@/lib/i18n/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { BookOpen } from "lucide-react";
import { PUBLICATIONS } from "@/lib/research/publications";

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
    path: "research",
    title: t("researchTitle"),
    description: t("researchDescription"),
  });
}

export default async function ResearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "research" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const areas = t.raw("areas") as string[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 tablet:px-6">
      <JsonLd data={breadcrumbSchema(l, [{ name: tNav("research"), path: "research" }])} />
      <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("research") }]} />

      <Badge variant="primary" className="mt-6">
        {t("kicker")}
      </Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary tablet:text-4xl">{t("title")}</h1>
      <p className="mt-3 text-text-secondary">{t("intro")}</p>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-text-primary">{t("areasHeading")}</h2>
        <ul className="mt-4 space-y-3">
          {areas.map((area) => (
            <li key={area} className="flex items-start gap-2.5 text-text-secondary">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {area}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-card border border-border bg-surface-raised p-6">
        <h2 className="font-display text-lg font-semibold text-text-primary">{t("dissertationHeading")}</h2>
        <p className="mt-2 italic text-text-secondary">{t("dissertationTitle")}</p>
        <p className="mt-3 text-sm text-text-muted">{t("dissertationNote")}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-text-primary">{t("publicationsHeading")}</h2>
        <ul className="mt-4 space-y-4">
          {PUBLICATIONS.map((pub) => (
            <li key={pub.doiUrl} className="rounded-card border border-border p-4">
              <a
                href={pub.doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-text-primary underline-offset-4 hover:underline"
              >
                {pub.title}
              </a>
              <p className="mt-1 text-sm text-text-muted">
                {pub.venue} · {pub.year}
              </p>
            </li>
          ))}
        </ul>
        <a
          href="https://orcid.org/0009-0003-9379-2667"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          {t("orcidCta")}
        </a>
      </section>

      <div className="mt-10 text-center">
        <Button asChild variant="outline">
          <Link href="/contact">{t("contactCta")}</Link>
        </Button>
      </div>
    </div>
  );
}
