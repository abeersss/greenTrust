import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { Link } from "@/lib/i18n/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { Newspaper, ExternalLink, Images } from "lucide-react";
import { pressItems } from "@/lib/media/press";

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
    path: "media",
    title: t("mediaTitle"),
    description: t("mediaDescription"),
  });
}

function formatDate(iso: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-KW" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export default async function MediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "media" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const items = [...pressItems].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 tablet:px-6">
      <JsonLd data={[breadcrumbSchema(l, [{ name: tNav("media"), path: "media" }])]} />

      <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("media") }]} />

      <Badge variant="primary" className="mt-6">
        {t("kicker")}
      </Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary tablet:text-4xl">{t("title")}</h1>
      <p className="mt-3 text-lg text-text-secondary">{t("intro")}</p>

      <section className="mt-10" aria-labelledby="press-heading">
        <h2
          id="press-heading"
          className="flex items-center gap-2 font-display text-xl font-semibold text-text-primary"
        >
          <Newspaper className="h-5 w-5 text-primary" aria-hidden="true" />
          {t("pressHeading")}
        </h2>

        <ul className="mt-6 space-y-6">
          {items.map((item) => (
            <li key={item.id} className="rounded-card border border-border bg-surface-raised p-5 tablet:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                <span>{item.publication}</span>
                <span aria-hidden="true"> · </span>
                <time dateTime={item.date}>{formatDate(item.date, l)}</time>
              </p>
              <h3
                lang={item.headlineLang}
                dir={item.headlineLang === "ar" ? "rtl" : "ltr"}
                className="mt-2 font-display text-lg font-semibold text-text-primary"
              >
                {item.headline}
              </h3>
              {item.author && (
                <p className="mt-1 text-sm text-text-muted">
                  {t("byline", { author: item.author })}
                </p>
              )}
              <p className="mt-3 text-text-secondary">{item.summary[l]}</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {t("readOriginal", { publication: item.publication })}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-text-muted">{t("disclaimer")}</p>
      </section>

      <div className="mt-10 flex flex-wrap gap-4 rounded-card border border-border bg-surface-raised p-5">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <Images className="h-4 w-4" aria-hidden="true" />
          {t("galleryCta")}
        </Link>
        <Link href="/about" className="text-sm font-medium text-primary hover:underline">
          {t("aboutCta")}
        </Link>
      </div>
    </div>
  );
}
