import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { Link } from "@/lib/i18n/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { Images } from "lucide-react";
import { galleryItems } from "@/lib/media/press";

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
    path: "gallery",
    title: t("galleryTitle"),
    description: t("galleryDescription"),
  });
}

function formatDate(iso: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-KW" : "en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "media" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 tablet:px-6">
      <JsonLd data={[breadcrumbSchema(l, [{ name: tNav("gallery"), path: "gallery" }])]} />

      <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("gallery") }]} />

      <Badge variant="primary" className="mt-6">
        {t("galleryKicker")}
      </Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary tablet:text-4xl">
        {t("galleryTitle")}
      </h1>
      <p className="mt-3 max-w-3xl text-lg text-text-secondary">{t("galleryIntro")}</p>

      {galleryItems.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={<Images aria-hidden="true" />}
          title={t("galleryEmptyTitle")}
          description={t("galleryEmptyBody")}
          action={
            <Link href="/media" className="text-sm font-medium text-primary hover:underline">
              {t("pressCta")}
            </Link>
          }
        />
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
          {galleryItems.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-card border border-border bg-surface-raised">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt[l]}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-text-secondary">{item.caption[l]}</p>
                {item.date && (
                  <p className="mt-1 text-xs text-text-muted">
                    <time dateTime={item.date}>{formatDate(item.date, l)}</time>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
