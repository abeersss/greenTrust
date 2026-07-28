import type { Metadata } from "next";
import { locales, type AppLocale } from "@/lib/i18n/config";
import { siteUrl, siteName } from "./site";

export interface BuildMetadataParams {
  locale: AppLocale;
  /** Path after the locale segment, e.g. "" for home, "about" for /en/about. No leading/trailing slash. */
  path: string;
  title: string;
  description: string;
  /** Absolute or root-relative path to a 1200x630 image. Defaults to the site-wide OG image route. */
  ogImagePath?: string;
  noIndex?: boolean;
  /**
   * Overrides `path` per locale for content whose slug legitimately
   * differs by language (e.g. bilingual articles, which are translated
   * rather than transliterated -- see 013_content_seed_flagship_articles.sql).
   * Without this, hreflang/canonical would silently point every locale at
   * the *current* locale's slug, which is wrong for any locale whose path
   * actually differs. Only the locales present here are overridden; any
   * locale not listed falls back to `path`.
   */
  alternatePaths?: Partial<Record<AppLocale, string>>;
}

/**
 * Builds a Next.js `Metadata` object with canonical URL, hreflang
 * alternates for every supported locale plus x-default, and
 * OpenGraph/Twitter tags, from a single call per page. Centralizing
 * this means every page gets hreflang and canonical correctly without
 * each page author needing to remember the URL-construction rules.
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  ogImagePath,
  noIndex,
  alternatePaths,
}: BuildMetadataParams): Metadata {
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const pathFor = (l: AppLocale) => (alternatePaths?.[l] ?? cleanPath).replace(/^\/+|\/+$/g, "");
  const urlFor = (l: AppLocale) => `${siteUrl}/${l}${pathFor(l) ? `/${pathFor(l)}` : ""}`;
  const canonical = urlFor(locale);
  const ogImage = ogImagePath ?? `${siteUrl}/opengraph-image`;

  const languages: Record<string, string> = { "x-default": urlFor("en") };
  for (const l of locales) languages[l] = urlFor(l);

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical,
      languages,
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale: locale === "ar" ? "ar_AR" : "en_US",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
