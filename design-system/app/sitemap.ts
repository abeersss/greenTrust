import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/seo/site";
import { getPublishedArticles } from "@/lib/content/articles";

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
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = `${siteUrl}/${locale}${path ? `/${path}` : ""}`;
    }

    for (const locale of locales) {
      entries.push({
        url: languages[locale],
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
