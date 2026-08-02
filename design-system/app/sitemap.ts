import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/seo/site";
import { getPublishedArticles, getLatestIntelligenceArticles, getTopLevelPillars, getCategoryBySlug } from "@/lib/content/articles";

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
 * All 6 Decision Labs (PHASE 8 SEO pass, 2026-08-01): every
 * `/challenge/*` route that has shipped a real, playable lab must be
 * listed here -- this array previously only had `challenge/first-defender`
 * hardcoded, which meant network-guardian, soc-night-shift,
 * data-guardian, grcl-innovation, and agent-zero were all live and
 * linked from the Decision Labs landing page but completely invisible
 * to search engines via the sitemap. `labs/decision-labs` itself (the
 * landing page that lists all 6 cards) was missing too, for the same
 * reason -- only the parent `/labs` marketing page was listed.
 *
 * CyberAbeer CTF track (2026-08-02): a second, structurally different
 * challenge track alongside Decision Labs -- 6 flag-submission
 * challenges under `/labs/ctf/[slug]`, plus the `/labs/ctf` listing
 * page itself. Listed individually (not derived dynamically) since
 * the CTF challenge set is static data in lib/ctf/challenges.ts, same
 * treatment as the Decision Labs challenge routes above.
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
  "for-organizations",
  "labs",
  "labs/decision-labs",
  "labs/ctf",
  "free-tools",
  "free-tools/ai-governance-quick-check",
  "free-tools/quantum-readiness-quick-check",
  "research",
  "insights",
  "learn",
  "intelligence",
  "contact",
  "challenge/first-defender",
  "challenge/network-guardian",
  "challenge/soc-night-shift",
  "challenge/data-guardian",
  "challenge/grcl-innovation",
  "challenge/agent-zero",
  "labs/ctf/web-hidden-in-plain-sight",
  "labs/ctf/web-broken-access-control",
  "labs/ctf/forensics-suspicious-log",
  "labs/ctf/forensics-deleted-file",
  "labs/ctf/crypto-caesars-mistake",
  "labs/ctf/crypto-weak-key",
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

    // Every playable Decision Lab is a conversion-driving page, so all
    // of them get the same 0.8 priority `challenge/first-defender` used
    // to have alone -- there's no reason the first lab built should
    // outrank the other five in the sitemap's own priority signal.
    // CTF challenge pages get the same 0.8 treatment as Decision Labs
    // challenge pages -- both are conversion-driving, playable content;
    // the `labs/ctf` listing page itself sits at 0.75, same tier as
    // `labs/decision-labs`.
    const isChallenge = path.startsWith("challenge/") || path.startsWith("labs/ctf/");
    const priority =
      path === ""
        ? 1
        : isChallenge
          ? 0.8
          : path === "labs/decision-labs" || path === "labs/ctf"
            ? 0.75
            : 0.7;

    for (const locale of locales) {
      entries.push({
        url: urlByLocale.get(locale) ?? `${siteUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority,
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

    // Cyber Intelligence items get their own /intelligence/[slug] URLs
    // (not /insights) and a slightly higher changeFrequency since
    // developing stories can update -- "monthly" would undersell how
    // often a DEVELOPING/UPDATED item's lastmod actually moves.
    const intelligenceArticles = await getLatestIntelligenceArticles(locale, 500);
    for (const article of intelligenceArticles) {
      entries.push({
        url: `${siteUrl}/${locale}/intelligence/${article.slug}`,
        lastModified: article.updatedAt
          ? new Date(article.updatedAt)
          : article.publishedAt
            ? new Date(article.publishedAt)
            : new Date(),
        changeFrequency: "weekly",
        priority: 0.65,
      });
    }

    // Pillar and hub topic pages (/topics/[pillar]) are indexable
    // taxonomy pages that organize the published articles above; they
    // exist independent of any single article's publish state, so they
    // list unconditionally per locale rather than being derived from
    // the article set.
    const pillars = await getTopLevelPillars(locale);
    for (const pillar of pillars) {
      entries.push({
        url: `${siteUrl}/${locale}/topics/${pillar.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.65,
      });
      const category = await getCategoryBySlug(locale, pillar.slug);
      for (const hub of category?.hubs ?? []) {
        entries.push({
          url: `${siteUrl}/${locale}/topics/${hub.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}
