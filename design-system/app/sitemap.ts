import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/seo/site";
import { getPublishedArticles } from "@/lib/content/articles";

// getPublishedArticles goes through the cookie-aware Supabase server
// client, which makes this route use a dynamic API (`cookies`) and
// therefore ineligible for build-time static generation. Rendering it
// per-request instead (rather than reworking the shared articles
// query to a cookie-free client) is the simplest fix for a low-traffic
// route like this.
export const dynamic = "force-dynamic";

/**
 * Every indexable static route, in both locales, each with a
 * `languages` alternates map so the sitemap itself reinforces the
 * hreflang relationship (not just the per-page <link> tags). Login
 * and register are deliberately excluded: they're marked noIndex in
 * their metadata and have no unique content to list.
 *
 * Insights article URLs are appended dynamically per locale from
 * whatever is actually published; with zero articles published this
 * contributes nothing, which is correct rather than listing
 * placeholder URLs that 404.
 */
const staticPaths = [
  "",
  "about",
  "greentrust",
  "labs",
  "free-tools",
  "free-tools/ai-governance-quick-check",
  "free-tools/quantum-readiness-quick-check",
  "research",
  "insights",
  "contact",
  "challenge/first-defender",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    const urlByLocale = new Map<string, string>();
    for (const locale of locales) {
      urlByLocale.set(locale, `${siteUrl}/${locale}${path ? `/${path}` : ""}`);
    }
    // `noUncheckedIndexedAccess` means a plain object's index signature
    // reads back as `string | undefined`; a Map plus Object.fromEntries
    // avoids that without needing a non-null assertion, since every
    // locale was just set above.
    const languages = Object.fromEntries(urlByLocale);

    for (const locale of locales) {
      entries.push({
        url: urlByLocale.get(locale) ?? `${siteUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : path === "challenge/first-defender" ? 0.8 : 0.7,
        alternates: { languages },
      });
    }
  }

  for (const locale of locales) {
    const articles = await getPublishedArticles(locale);
    for (const article of articles) {
      entries.push({
        url: `${siteUrl}/${locale}/insights/${article.slug}`,
        lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
