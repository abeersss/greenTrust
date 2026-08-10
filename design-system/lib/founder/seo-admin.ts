import "server-only";
import { siteUrl } from "@/lib/seo/site";

export type PageSeoCheck = {
  label: string;
  path: string;
  locale: "en" | "ar";
  url: string;
  reachable: boolean;
  statusCode: number | null;
  title: string | null;
  titleLength: number | null;
  description: string | null;
  descriptionLength: number | null;
  hasCanonical: boolean;
  hreflangCount: number;
  hasJsonLd: boolean;
  issues: string[];
};

export type SitemapStats = {
  reachable: boolean;
  totalUrls: number;
  enUrls: number;
  arUrls: number;
};

export type RobotsStatus = {
  reachable: boolean;
  allowsIndexing: boolean;
  referencesSitemap: boolean;
};

export type SeoOverview = {
  sitemap: SitemapStats;
  robots: RobotsStatus;
  pages: PageSeoCheck[];
};

/**
 * Founder SEO Dashboard (CyberAbeer Platform Phase II, Batch 3). There is
 * no third-party SEO crawler wired into this codebase, so rather than
 * fabricate scores, this live-fetches a curated set of real indexable
 * routes plus sitemap.xml and robots.txt straight from production and
 * parses the actual HTML each one returns -- title, meta description,
 * canonical tag, hreflang alternates, and JSON-LD presence -- so a
 * founder sees what search engines actually see, not a static claim.
 */
const KEY_PAGES: { path: string; label: string }[] = [
  { path: "", label: "Homepage" },
  { path: "labs", label: "CyberAbeer Labs" },
  { path: "ctf", label: "CTF Hub" },
  { path: "insights", label: "Insights" },
  { path: "intelligence", label: "Cyber Intelligence" },
  { path: "learn", label: "Learning Center" },
  { path: "tools", label: "Free Tools" },
  { path: "for-organizations", label: "For Organizations" },
  { path: "about", label: "About Dr. Abeer" },
  { path: "research", label: "Research" },
  { path: "greentrust", label: "GreenTrust AI" },
];

function getTags(html: string, tagName: string): string[] {
  const re = new RegExp("<" + tagName + "\\b[^>]*>", "gi");
  return html.match(re) ?? [];
}

function getAttr(tag: string, name: string): string | null {
  const re = new RegExp(name + "\\s*=\\s*\"([^\"]*)\"", "i");
  const m = tag.match(re);
  return m ? (m[1] ?? null) : null;
}

async function checkPage(locale: "en" | "ar", path: string, label: string): Promise<PageSeoCheck> {
  const url = siteUrl + "/" + locale + (path ? "/" + path : "");

  try {
    const res = await fetch(url, { method: "GET", cache: "no-store" });

    if (!res.ok) {
      return {
        label: label,
        path: path,
        locale: locale,
        url: url,
        reachable: false,
        statusCode: res.status,
        title: null,
        titleLength: null,
        description: null,
        descriptionLength: null,
        hasCanonical: false,
        hreflangCount: 0,
        hasJsonLd: false,
        issues: ["Page returned status " + res.status],
      };
    }

    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? (titleMatch[1] ?? "").trim() : null;

    const metaTags = getTags(html, "meta");
    const descTag = metaTags.find(function (t) { return getAttr(t, "name") === "description"; });
    const description = descTag ? getAttr(descTag, "content") : null;

    const linkTags = getTags(html, "link");
    const hasCanonical = linkTags.some(function (t) { return getAttr(t, "rel") === "canonical"; });
    const hreflangCount = linkTags.filter(function (t) { return getAttr(t, "hreflang") !== null; }).length;

    const scriptTags = getTags(html, "script");
    const hasJsonLd = scriptTags.some(function (t) { return getAttr(t, "type") === "application/ld+json"; });

    const issues: string[] = [];
    if (!title) {
      issues.push("Missing <title>");
    } else if (title.length < 15 || title.length > 65) {
      issues.push("Title length " + title.length + " chars (aim for 15-65)");
    }
    if (!description) {
      issues.push("Missing meta description");
    } else if (description.length < 50 || description.length > 160) {
      issues.push("Description length " + description.length + " chars (aim for 50-160)");
    }
    if (!hasCanonical) issues.push("Missing canonical tag");
    if (hreflangCount < 2) issues.push("Missing hreflang alternates");
    if (!hasJsonLd) issues.push("No structured data (JSON-LD)");

    return {
      label: label,
      path: path,
      locale: locale,
      url: url,
      reachable: true,
      statusCode: res.status,
      title: title,
      titleLength: title ? title.length : null,
      description: description,
      descriptionLength: description ? description.length : null,
      hasCanonical: hasCanonical,
      hreflangCount: hreflangCount,
      hasJsonLd: hasJsonLd,
      issues: issues,
    };
  } catch {
    return {
      label: label,
      path: path,
      locale: locale,
      url: url,
      reachable: false,
      statusCode: null,
      title: null,
      titleLength: null,
      description: null,
      descriptionLength: null,
      hasCanonical: false,
      hreflangCount: 0,
      hasJsonLd: false,
      issues: ["Request failed"],
    };
  }
}

async function getSitemapStats(): Promise<SitemapStats> {
  try {
    const res = await fetch(siteUrl + "/sitemap.xml", { cache: "no-store" });
    if (!res.ok) {
      return { reachable: false, totalUrls: 0, enUrls: 0, arUrls: 0 };
    }
    const xml = await res.text();
    const locs = Array.from(xml.matchAll(/<loc>([^<]*)<\/loc>/g)).map(function (m) { return m[1] ?? ""; });
    const enUrls = locs.filter(function (u) { return u.indexOf("/en") !== -1; }).length;
    const arUrls = locs.filter(function (u) { return u.indexOf("/ar") !== -1; }).length;
    return { reachable: true, totalUrls: locs.length, enUrls: enUrls, arUrls: arUrls };
  } catch {
    return { reachable: false, totalUrls: 0, enUrls: 0, arUrls: 0 };
  }
}

async function getRobotsStatus(): Promise<RobotsStatus> {
  try {
    const res = await fetch(siteUrl + "/robots.txt", { cache: "no-store" });
    if (!res.ok) {
      return { reachable: false, allowsIndexing: false, referencesSitemap: false };
    }
    const text = await res.text();
    const blocksAll = /Disallow:\s*\/\s*$/im.test(text);
    const referencesSitemap = /Sitemap:/i.test(text);
    return { reachable: true, allowsIndexing: !blocksAll, referencesSitemap: referencesSitemap };
  } catch {
    return { reachable: false, allowsIndexing: false, referencesSitemap: false };
  }
}

export async function getSeoOverview(): Promise<SeoOverview> {
  const pageChecks = KEY_PAGES.flatMap(function (page) {
    return [checkPage("en", page.path, page.label), checkPage("ar", page.path, page.label)];
  });

  const [sitemap, robots, pages] = await Promise.all([
    getSitemapStats(),
    getRobotsStatus(),
    Promise.all(pageChecks),
  ]);

  return { sitemap: sitemap, robots: robots, pages: pages };
   }
