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
}: BuildMetadataParams): Metadata {
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  const urlFor = (l: AppLocale) => `${siteUrl}/${l}${cleanPath ? `/${cleanPath}` : ""}`;
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
