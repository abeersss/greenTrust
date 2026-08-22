import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { locales, type AppLocale } from "@/lib/i18n/config";

export interface ArticleSource {
  title: string;
  publisher: string | null;
  url: string;
  publishedDate: string | null;
  accessedDate: string;
}

export type IntelSeverity = "critical" | "high" | "important" | "informational";
export type IntelStoryStatus = "developing" | "confirmed" | "updated" | "resolved";
export type ExploitStatus = "actively_exploited" | "poc_available" | "no_known_exploit" | "unknown";
export type CyberAbeerPriority = "immediate" | "urgent" | "planned" | "monitor";

/**
 * Cyber Intelligence metadata (migration 022) is stored as nullable
 * columns directly on `articles` / `article_translations`, not a
 * parallel table -- every regular evergreen article simply has all of
 * these as null. Grouped into its own interface so ArticleSummary's
 * non-intelligence callers (Insights, Learn, topics pages) aren't
 * forced to reason about fields that never apply to them, while
 * `getArticlesByCategoryIds` and friends can still return them for
 * free since the underlying select/mapper is shared.
 */
export interface IntelligenceMeta {
  intelSeverity: IntelSeverity | null;
  intelStoryStatus: IntelStoryStatus | null;
  cveIds: string[];
  cvssScore: number | null;
  affectedProduct: string | null;
  exploitStatus: ExploitStatus | null;
  kevListed: boolean;
  vendorAdvisoryUrl: string | null;
  patchStatus: string | null;
  cyberabeerPriority: CyberAbeerPriority | null;
  menaRelevance: boolean;
  sourcesCheckedAt: string | null;
}

export interface ArticleSummary extends IntelligenceMeta {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  readingTimeMinutes: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  pillarName: string | null;
  pillarSlug: string | null;
  /** Stable pillar `categories.key` (e.g. `pillar_ai_security_governance`), locale-independent -- used to pick a consistent icon, unlike the translated slug/name. */
  pillarKey: string | null;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  audience: string[];
}

export interface ArticleDetail extends ArticleSummary {
  body: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  authorName: string | null;
  reviewedAt: string | null;
  relatedLabKey: string | null;
  /** Executive View summary (Section 15 of the Cyber Intelligence spec) -- null for non-intelligence articles and for intelligence items where a separate executive framing wasn't warranted. */
  executiveSummary: string | null;
  sources: ArticleSource[];
  relatedArticles: ArticleSummary[];
}

export interface CategoryDetail {
  id: string;
  key: string;
  slug: string;
  name: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPillar: boolean;
  /** Child hub categories, populated only when this category is a pillar. */
  hubs: { id: string; key: string; slug: string; name: string; description: string | null }[];
}

export interface PillarSummary {
  id: string;
  key: string;
  slug: string;
  name: string;
  description: string | null;
}

/**
 * The 6 top-level content pillars (AI Security & Governance, GRC &
 * Cyber Governance, Cyber Defense, Data Trust, Future Security, Learn
 * Cybersecurity), seeded once in 012_content_engine_expansion.sql and
 * never expected to change often. Used by the Insights page's "Popular
 * Topics" rail. Categories have no `sort_order` column, so display
 * order is resolved client-side against `PILLAR_KEY_ORDER` below rather
 * than trusting whatever order Postgres happens to return.
 */
const PILLAR_KEY_ORDER = [
  "pillar_ai_security_governance",
  "pillar_grc_governance",
  "pillar_cyber_defense",
  "pillar_data_trust",
  "pillar_future_security",
  "pillar_learn_cybersecurity",
];

export async function getTopLevelPillars(locale: AppLocale): Promise<PillarSummary[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, key, category_translations ( name, slug, description, locale )")
      .eq("is_pillar", true)
      .is("parent_id", null)
      .is("deleted_at", null);

    if (error) throw error;

    interface Row {
      id: string;
      key: string;
      category_translations: { name: string; slug: string; description: string | null; locale: string }[];
    }
    const pillars = ((data ?? []) as unknown as Row[])
      .map((row) => {
        const t = row.category_translations.find((ct) => ct.locale === locale);
        return t ? { id: row.id, key: row.key, slug: t.slug, name: t.name, description: t.description } : null;
      })
      .filter((p): p is PillarSummary => p !== null);

    return pillars.sort((a, b) => PILLAR_KEY_ORDER.indexOf(a.key) - PILLAR_KEY_ORDER.indexOf(b.key));
  } catch (err) {
    console.error("getTopLevelPillars failed, returning empty list", err);
    return [];
  }
}

/**
 * Minimal shapes for the raw rows Supabase's dynamic `.select()` string
 * returns from the nested queries below. These aren't generated from
 * the DB schema (no `Database` type is wired up yet), so they're kept
 * intentionally loose/optional rather than using `any`, which
 * `@typescript-eslint/no-explicit-any` (enabled in .eslintrc.json)
 * disallows.
 */
interface CategoryTranslationRow {
  name: string | null;
  slug?: string | null;
  locale: string;
}

interface CategoryJoinRow {
  id: string;
  parent_id: string | null;
  key?: string;
  category_translations?: CategoryTranslationRow[] | null;
  categories?: { key?: string; category_translations?: CategoryTranslationRow[] | null } | null; // parent, when embedded
}

interface ArticleJoinRow {
  id: string;
  status: string;
  published_at: string | null;
  updated_at: string | null;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  audience: string[] | null;
  reviewed_at: string | null;
  related_lab_key: string | null;
  intel_severity: IntelSeverity | null;
  intel_story_status: IntelStoryStatus | null;
  cve_ids: string[] | null;
  cvss_score: number | null;
  affected_product: string | null;
  exploit_status: ExploitStatus | null;
  kev_listed: boolean | null;
  vendor_advisory_url: string | null;
  patch_status: string | null;
  cyberabeer_priority: CyberAbeerPriority | null;
  mena_relevance: boolean | null;
  sources_checked_at: string | null;
  categories?: CategoryJoinRow | null;
  authors?: { display_name: string | null } | null;
}

interface ArticleTranslationRow {
  slug: string;
  title: string;
  excerpt: string | null;
  body?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
  executive_summary?: string | null;
  reading_time_minutes: number | null;
  articles: ArticleJoinRow;
}

function resolvePillar(
  category: CategoryJoinRow | null | undefined,
  locale: AppLocale
): {
  categoryName: string | null;
  categorySlug: string | null;
  pillarName: string | null;
  pillarSlug: string | null;
  pillarKey: string | null;
} {
  const categoryT = category?.category_translations?.find((t) => t.locale === locale);
  // A hub category's parent (if any) is its pillar; a pillar category with
  // no parent is its own pillar for display purposes.
  const parentT = category?.categories?.category_translations?.find((t) => t.locale === locale);
  return {
    categoryName: categoryT?.name ?? null,
    categorySlug: categoryT?.slug ?? null,
    pillarName: parentT?.name ?? categoryT?.name ?? null,
    pillarSlug: parentT?.slug ?? categoryT?.slug ?? null,
    pillarKey: category?.categories?.key ?? category?.key ?? null,
  };
}

function mapIntelligenceMeta(row: ArticleJoinRow): IntelligenceMeta {
  return {
    intelSeverity: row.intel_severity ?? null,
    intelStoryStatus: row.intel_story_status ?? null,
    cveIds: row.cve_ids ?? [],
    cvssScore: row.cvss_score ?? null,
    affectedProduct: row.affected_product ?? null,
    exploitStatus: row.exploit_status ?? null,
    kevListed: row.kev_listed ?? false,
    vendorAdvisoryUrl: row.vendor_advisory_url ?? null,
    patchStatus: row.patch_status ?? null,
    cyberabeerPriority: row.cyberabeer_priority ?? null,
    menaRelevance: row.mena_relevance ?? false,
    sourcesCheckedAt: row.sources_checked_at ?? null,
  };
}

function mapArticleRow(row: ArticleTranslationRow, locale: AppLocale): ArticleSummary {
  const { categoryName, categorySlug, pillarName, pillarSlug, pillarKey } = resolvePillar(row.articles.categories, locale);
  return {
    id: row.articles.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedAt: row.articles.published_at,
    updatedAt: row.articles.updated_at,
    readingTimeMinutes: row.reading_time_minutes,
    categoryName,
    categorySlug,
    pillarName,
    pillarSlug,
    pillarKey,
    difficulty: row.articles.difficulty ?? null,
    audience: row.articles.audience ?? [],
    ...mapIntelligenceMeta(row.articles),
  };
}

const ARTICLE_JOIN_SELECT = `
  slug, title, excerpt, reading_time_minutes,
  articles!inner (
    id, status, published_at, updated_at, difficulty, audience, reviewed_at, related_lab_key,
    intel_severity, intel_story_status, cve_ids, cvss_score, affected_product, exploit_status,
    kev_listed, vendor_advisory_url, patch_status, cyberabeer_priority, mena_relevance, sources_checked_at,
    categories ( id, parent_id, key, category_translations ( name, slug, locale ), categories ( key, category_translations ( name, slug, locale ) ) )
  )
`;

/**
 * Full detail select for a single article (getArticleBySlug), factored
 * out to a constant so the Unicode-normalization retry path below can
 * reuse the exact same shape without drifting from the primary query.
 */
const ARTICLE_DETAIL_SELECT = `
  slug, title, excerpt, body, meta_title, meta_description, og_image_url, executive_summary, reading_time_minutes,
  articles!inner (
    id, status, published_at, updated_at, difficulty, audience, reviewed_at, related_lab_key,
    intel_severity, intel_story_status, cve_ids, cvss_score, affected_product, exploit_status,
    kev_listed, vendor_advisory_url, patch_status, cyberabeer_priority, mena_relevance, sources_checked_at,
    categories ( id, parent_id, key, category_translations ( name, slug, locale ), categories ( key, category_translations ( name, slug, locale ) ) ),
    authors ( display_name )
  )
`;

/**
 * The Insights and Research pages both read from the same
 * article-publishing pipeline (Phase 3 CONTENT domain:
 * articles + article_translations + categories). This is the "content
 * publishing architecture" the milestone asks for: the query layer,
 * the route, and the rendering all work end to end. No rows are
 * seeded, so until an admin publishes something, this returns an
 * empty array and the pages render an honest "nothing published yet"
 * state instead of fabricated posts.
 *
 * Every query fails soft: if Supabase isn't reachable (for example,
 * this environment has no live project configured yet), the page
 * still renders the empty state rather than crashing the route.
 */
export async function getPublishedArticles(locale: AppLocale): Promise<ArticleSummary[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select(ARTICLE_JOIN_SELECT)
      .eq("locale", locale)
      .eq("articles.status", "published")
      .lte("articles.published_at", new Date().toISOString())
      .order("published_at", { referencedTable: "articles", ascending: false });

    if (error) throw error;

    // Cast through `unknown`: with no generated `Database` types wired up,
    // supabase-js's default inference types every embedded relation as an
    // array (it can't see the FK cardinality), so it infers `articles` as
    // an array here even though PostgREST returns a single object for this
    // many-to-one embed at runtime. That mismatch is wide enough that TS
    // refuses a direct `as ArticleTranslationRow[]` cast ("insufficient
    // overlap"), even though the shape is correct once the real DB types
    // are generated.
    return ((data ?? []) as unknown as ArticleTranslationRow[]).map((row) => mapArticleRow(row, locale));
  } catch (err) {
    console.error("getPublishedArticles failed, returning empty list", err);
    return [];
  }
}

/**
 * Articles for a pillar or hub landing page. `categoryIds` is the hub's
 * own id, or (for a pillar) the pillar's id plus every child hub id --
 * resolved by the caller via `getCategoryBySlug`, since supabase-js
 * cannot express "this category OR its children" as a single filter on
 * a nested embed.
 */
export async function getArticlesByCategoryIds(locale: AppLocale, categoryIds: string[]): Promise<ArticleSummary[]> {
  if (categoryIds.length === 0) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select(ARTICLE_JOIN_SELECT)
      .eq("locale", locale)
      .eq("articles.status", "published")
      .in("articles.category_id", categoryIds)
      .lte("articles.published_at", new Date().toISOString())
      .order("published_at", { referencedTable: "articles", ascending: false });

    if (error) throw error;
    return ((data ?? []) as unknown as ArticleTranslationRow[]).map((row) => mapArticleRow(row, locale));
  } catch (err) {
    console.error("getArticlesByCategoryIds failed, returning empty list", err);
    return [];
  }
}

/**
 * The most recent Cyber Intelligence items across every intelligence
 * hub, identified by `intel_severity is not null` rather than a
 * category-id list -- an article is "intelligence" content because it
 * carries intelligence metadata, regardless of which of the 7 hubs it
 * lives in. Used by the homepage's restrained "Latest Cyber
 * Intelligence" section (Section 21 of the spec, capped at 3-5 items)
 * and by the /intelligence hub's "Today's Cyber Brief" strip.
 */
export async function getLatestIntelligenceArticles(locale: AppLocale, limit = 5): Promise<ArticleSummary[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select(ARTICLE_JOIN_SELECT)
      .eq("locale", locale)
      .eq("articles.status", "published")
      .not("articles.intel_severity", "is", null)
      .lte("articles.published_at", new Date().toISOString())
      .order("published_at", { referencedTable: "articles", ascending: false })
      .limit(limit);

    if (error) throw error;
    return ((data ?? []) as unknown as ArticleTranslationRow[]).map((row) => mapArticleRow(row, locale));
  } catch (err) {
    console.error("getLatestIntelligenceArticles failed, returning empty list", err);
    return [];
  }
}

/**
 * Articles carrying a specific cross-cutting tag (e.g. the founder's own
 * "dr-abeer-insights" voice pieces, which cut across pillars rather than
 * belonging to one). Used by the Insights page's "Dr. Abeer Insights"
 * rail so it stays correct as more tagged pieces are published, instead
 * of hardcoding a slug list in the page component.
 */
export async function getArticlesByTag(locale: AppLocale, tagKey: string): Promise<ArticleSummary[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: tagRow, error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("key", tagKey)
      .maybeSingle();
    if (tagError) throw tagError;
    if (!tagRow) return [];

    const { data: linkRows, error: linkError } = await supabase
      .from("article_tags")
      .select("article_id")
      .eq("tag_id", (tagRow as { id: string }).id);
    if (linkError) throw linkError;

    const articleIds = (linkRows ?? []).map((r) => (r as { article_id: string }).article_id);
    if (articleIds.length === 0) return [];

    const { data, error } = await supabase
      .from("article_translations")
      .select(ARTICLE_JOIN_SELECT)
      .eq("locale", locale)
      .in("articles.id", articleIds)
      .eq("articles.status", "published")
      .order("published_at", { referencedTable: "articles", ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as ArticleTranslationRow[]).map((row) => mapArticleRow(row, locale));
  } catch (err) {
    console.error("getArticlesByTag failed, returning empty list", err);
    return [];
  }
}

/**
 * Resolves a pillar or hub by its locale-specific slug (the `/topics/[pillar]`
 * route param). Returns child hubs only when the category is itself a
 * pillar -- a hub's own page has no further children to list.
 */
export async function getCategoryBySlug(locale: AppLocale, slug: string): Promise<CategoryDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("category_translations")
      .select(
        `
        name, slug, description, meta_title, meta_description,
        categories!inner ( id, key, is_pillar, deleted_at )
        `
      )
      .eq("locale", locale)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    interface Row {
      name: string;
      slug: string;
      description: string | null;
      meta_title: string | null;
      meta_description: string | null;
      categories: { id: string; key: string; is_pillar: boolean; deleted_at: string | null };
    }
    const row = data as unknown as Row;
    if (row.categories.deleted_at) return null;

    let hubs: CategoryDetail["hubs"] = [];
    if (row.categories.is_pillar) {
      const { data: hubRows, error: hubError } = await supabase
        .from("categories")
        .select("id, key, category_translations ( name, slug, description, locale )")
        .eq("parent_id", row.categories.id)
        .is("deleted_at", null);
      if (hubError) throw hubError;

      interface HubRow {
        id: string;
        key: string;
        category_translations: { name: string; slug: string; description: string | null; locale: string }[];
      }
      hubs = ((hubRows ?? []) as unknown as HubRow[])
        .map((h) => {
          const t = h.category_translations.find((ct) => ct.locale === locale);
          return t ? { id: h.id, key: h.key, slug: t.slug, name: t.name, description: t.description } : null;
        })
        .filter((h): h is CategoryDetail["hubs"][number] => h !== null);
    }

    return {
      id: row.categories.id,
      key: row.categories.key,
      slug: row.slug,
      name: row.name,
      description: row.description,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      isPillar: row.categories.is_pillar,
      hubs,
    };
  } catch (err) {
    console.error("getCategoryBySlug failed, returning null", err);
    return null;
  }
}

/**
 * Bilingual articles are independently translated, not transliterated
 * (see 013_content_seed_flagship_articles.sql), so the same article's
 * English and Arabic slugs can legitimately differ. hreflang/canonical
 * tags must point each locale at *that locale's own* slug for the
 * article, not silently reuse the current locale's slug -- otherwise
 * the alternate-language link 404s. This resolves every locale's slug
 * for a given article id in one query, for `buildMetadata`'s
 * `alternatePaths` param.
 */
export async function getArticleLocaleSlugs(articleId: string): Promise<Partial<Record<AppLocale, string>>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select("locale, slug")
      .eq("article_id", articleId)
      .in("locale", locales as unknown as string[]);
    if (error) throw error;

    const result: Partial<Record<AppLocale, string>> = {};
    for (const row of (data ?? []) as { locale: string; slug: string }[]) {
      if ((locales as readonly string[]).includes(row.locale)) {
        result[row.locale as AppLocale] = row.slug;
      }
    }
    return result;
  } catch (err) {
    console.error("getArticleLocaleSlugs failed, returning empty map", err);
    return {};
  }
}

/**
 * Same cross-locale slug problem as `getArticleLocaleSlugs`, for
 * pillar/hub category pages: `category_translations.slug` is
 * independently translated per locale (see
 * 012_content_engine_expansion.sql), so `/topics/[pillar]` needs each
 * locale's own slug for correct hreflang/canonical, not a reused
 * current-locale slug.
 */
export async function getCategoryLocaleSlugs(categoryId: string): Promise<Partial<Record<AppLocale, string>>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("category_translations")
      .select("locale, slug")
      .eq("category_id", categoryId)
      .in("locale", locales as unknown as string[]);
    if (error) throw error;

    const result: Partial<Record<AppLocale, string>> = {};
    for (const row of (data ?? []) as { locale: string; slug: string }[]) {
      if ((locales as readonly string[]).includes(row.locale)) {
        result[row.locale as AppLocale] = row.slug;
      }
    }
    return result;
  } catch (err) {
    console.error("getCategoryLocaleSlugs failed, returning empty map", err);
    return {};
  }
}

/**
 * Unicode-normalization-tolerant slug lookup, used as a fallback inside
 * `getArticleBySlug` when the exact byte match fails. Non-Latin slugs
 * (Arabic in particular) can be composed of visually-identical but
 * byte-different codepoint sequences -- e.g. a precomposed vs.
 * decomposed form, or a presentation-form letter standing in for its
 * standard-block equivalent. A URL that *looks* correct in the browser
 * and even survives a manual percent-decode can still fail a raw
 * `.eq("slug", slug)` match. This scans this locale's published slugs
 * and returns the one whose NFC-normalized form matches the requested
 * slug's NFC-normalized form, so a byte-mismatched-but-visually-identical
 * request still resolves to the real article instead of 404ing.
 */
async function findCanonicalSlugByNormalizedMatch(locale: AppLocale, slug: string): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select("slug, articles!inner(status)")
      .eq("locale", locale)
      .eq("articles.status", "published");

    if (error) throw error;

    const target = slug.normalize("NFC");
    for (const row of (data ?? []) as { slug: string }[]) {
      if (row.slug === slug) continue;
      if (row.slug.normalize("NFC") === target) return row.slug;
    }
    return null;
  } catch (err) {
    console.error("findCanonicalSlugByNormalizedMatch failed, returning null", err);
    return null;
  }
}

export async function getArticleBySlug(locale: AppLocale, slug: string): Promise<ArticleDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select(ARTICLE_DETAIL_SELECT)
      .eq("locale", locale)
      .eq("slug", slug)
      .eq("articles.status", "published")
      .lte("articles.published_at", new Date().toISOString())
      .maybeSingle();

    if (error) throw error;

    let matchedRow = data;

    // Unicode-normalization fallback: retry once against the canonical
    // slug if the exact byte match above found nothing. See
    // findCanonicalSlugByNormalizedMatch for why this is necessary for
    // non-Latin (e.g. Arabic) slugs.
    if (!matchedRow) {
      const canonicalSlug = await findCanonicalSlugByNormalizedMatch(locale, slug);
      if (canonicalSlug) {
        const { data: retryData, error: retryError } = await supabase
          .from("article_translations")
          .select(ARTICLE_DETAIL_SELECT)
          .eq("locale", locale)
          .eq("slug", canonicalSlug)
          .eq("articles.status", "published")
          .lte("articles.published_at", new Date().toISOString())
          .maybeSingle();
        if (retryError) throw retryError;
        matchedRow = retryData;
      }
    }

    if (!matchedRow) return null;

    // Same `unknown` double-cast as getPublishedArticles above, and for
    // the same reason: no generated `Database` types, so supabase-js's
    // inferred shape for the embedded `articles` relation doesn't
    // structurally overlap with the single-object `ArticleJoinRow` type.
    const row = matchedRow as unknown as ArticleTranslationRow;
    const summary = mapArticleRow(row, locale);

    const [{ data: sourceRows }, { data: relationRows }] = await Promise.all([
      supabase
        .from("article_sources")
        .select("title, publisher, url, published_date, accessed_date, sort_order")
        .eq("article_id", row.articles.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("article_relations")
        .select("sort_order, related_article_id, articles:related_article_id ( id )")
        .eq("article_id", row.articles.id)
        .order("sort_order", { ascending: true }),
    ]);

    const sources: ArticleSource[] = (sourceRows ?? []).map((s) => ({
      title: s.title as string,
      publisher: (s.publisher as string | null) ?? null,
      url: s.url as string,
      publishedDate: (s.published_date as string | null) ?? null,
      accessedDate: s.accessed_date as string,
    }));

    // Related articles are resolved as a second, separate lookup by slug
    // rather than a deep nested embed, since we need the *translation* row
    // (title/slug/excerpt) for each related article id, in this locale.
    const relatedIds = (relationRows ?? []).map((r) => r.related_article_id as string);
    let relatedArticles: ArticleSummary[] = [];
    if (relatedIds.length > 0) {
      const { data: relatedRows } = await supabase
        .from("article_translations")
        .select(ARTICLE_JOIN_SELECT)
        .eq("locale", locale)
        .in("articles.id", relatedIds)
        .eq("articles.status", "published");
      relatedArticles = ((relatedRows ?? []) as unknown as ArticleTranslationRow[]).map((r) => mapArticleRow(r, locale));
    }

    return {
      ...summary,
      body: row.body ?? "",
      metaTitle: row.meta_title ?? null,
      metaDescription: row.meta_description ?? null,
      ogImageUrl: row.og_image_url ?? null,
      authorName: row.articles.authors?.display_name ?? null,
      reviewedAt: row.articles.reviewed_at ?? null,
      relatedLabKey: row.articles.related_lab_key ?? null,
      executiveSummary: row.executive_summary ?? null,
      sources,
      relatedArticles,
    };
  } catch (err) {
    console.error("getArticleBySlug failed, returning null", err);
    return null;
  }
}

/**
 * Word-order-tolerant slug fallback. Article slugs are hyphen-joined
 * token sequences; when a slug is renamed (e.g. an Arabic word-order
 * repair pass) after being shared, bookmarked, or indexed elsewhere,
 * the old URL's tokens are identical but in a different order and
 * will never byte-match a direct getArticleBySlug lookup, producing a
 * hard 404 even though the article is still published under a new
 * slug. This scans this locale's published slugs and returns the
 * canonical slug whose token set (order-independent, and each token
 * NFC-normalized so visually-identical-but-byte-different Arabic
 * tokens still match) matches the requested slug, so callers can
 * redirect to the real article instead of 404ing. Only meant to be
 * called as a fallback after getArticleBySlug(locale, slug) has
 * already returned null for the exact slug -- it is not a substitute
 * for the primary lookup (which now has its own NFC-normalized retry
 * for the more common non-reordered case).
 */
export async function findCanonicalSlugByTokenPermutation(locale: AppLocale, slug: string): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select("slug, articles!inner(status)")
      .eq("locale", locale)
      .eq("articles.status", "published");

    if (error) throw error;

    const normalize = (s: string) =>
      s
        .normalize("NFC")
        .split("-")
        .sort()
        .join(" ");
    const requestedTokens = normalize(slug);

    for (const row of (data ?? [])) {
      if (row.slug === slug) continue;
      if (normalize(row.slug) === requestedTokens) return row.slug;
    }
    return null;
  } catch (err) {
    console.error("findCanonicalSlugByTokenPermutation failed, returning null", err);
    return null;
  }
}
import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { locales, type AppLocale } from "@/lib/i18n/config";

export interface ArticleSource {
  title: string;
  publisher: string | null;
  url: string;
  publishedDate: string | null;
  accessedDate: string;
}

export type IntelSeverity = "critical" | "high" | "important" | "informational";
export type IntelStoryStatus = "developing" | "confirmed" | "updated" | "resolved";
export type ExploitStatus = "actively_exploited" | "poc_available" | "no_known_exploit" | "unknown";
export type CyberAbeerPriority = "immediate" | "urgent" | "planned" | "monitor";

/**
 * Cyber Intelligence metadata (migration 022) is stored as nullable
 * columns directly on `articles` / `article_translations`, not a
 * parallel table -- every regular evergreen article simply has all of
 * these as null. Grouped into its own interface so ArticleSummary's
 * non-intelligence callers (Insights, Learn, topics pages) aren't
 * forced to reason about fields that never apply to them, while
 * `getArticlesByCategoryIds` and friends can still return them for
 * free since the underlying select/mapper is shared.
 */
export interface IntelligenceMeta {
  intelSeverity: IntelSeverity | null;
  intelStoryStatus: IntelStoryStatus | null;
  cveIds: string[];
  cvssScore: number | null;
  affectedProduct: string | null;
  exploitStatus: ExploitStatus | null;
  kevListed: boolean;
  vendorAdvisoryUrl: string | null;
  patchStatus: string | null;
  cyberabeerPriority: CyberAbeerPriority | null;
  menaRelevance: boolean;
  sourcesCheckedAt: string | null;
}

export interface ArticleSummary extends IntelligenceMeta {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  readingTimeMinutes: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  pillarName: string | null;
  pillarSlug: string | null;
  /** Stable pillar `categories.key` (e.g. `pillar_ai_security_governance`), locale-independent -- used to pick a consistent icon, unlike the translated slug/name. */
  pillarKey: string | null;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  audience: string[];
}

export interface ArticleDetail extends ArticleSummary {
  body: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  authorName: string | null;
  reviewedAt: string | null;
  relatedLabKey: string | null;
  /** Executive View summary (Section 15 of the Cyber Intelligence spec) -- null for non-intelligence articles and for intelligence items where a separate executive framing wasn't warranted. */
  executiveSummary: string | null;
  sources: ArticleSource[];
  relatedArticles: ArticleSummary[];
}

export interface CategoryDetail {
  id: string;
  key: string;
  slug: string;
  name: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPillar: boolean;
  /** Child hub categories, populated only when this category is a pillar. */
  hubs: { id: string; key: string; slug: string; name: string; description: string | null }[];
}

export interface PillarSummary {
  id: string;
  key: string;
  slug: string;
  name: string;
  description: string | null;
}

/**
 * The 6 top-level content pillars (AI Security & Governance, GRC &
 * Cyber Governance, Cyber Defense, Data Trust, Future Security, Learn
 * Cybersecurity), seeded once in 012_content_engine_expansion.sql and
 * never expected to change often. Used by the Insights page's "Popular
 * Topics" rail. Categories have no `sort_order` column, so display
 * order is resolved client-side against `PILLAR_KEY_ORDER` below rather
 * than trusting whatever order Postgres happens to return.
 */
const PILLAR_KEY_ORDER = [
  "pillar_ai_security_governance",
  "pillar_grc_governance",
  "pillar_cyber_defense",
  "pillar_data_trust",
  "pillar_future_security",
  "pillar_learn_cybersecurity",
];

export async function getTopLevelPillars(locale: AppLocale): Promise<PillarSummary[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, key, category_translations ( name, slug, description, locale )")
      .eq("is_pillar", true)
      .is("parent_id", null)
      .is("deleted_at", null);

    if (error) throw error;

    interface Row {
      id: string;
      key: string;
      category_translations: { name: string; slug: string; description: string | null; locale: string }[];
    }
    const pillars = ((data ?? []) as unknown as Row[])
      .map((row) => {
        const t = row.category_translations.find((ct) => ct.locale === locale);
        return t ? { id: row.id, key: row.key, slug: t.slug, name: t.name, description: t.description } : null;
      })
      .filter((p): p is PillarSummary => p !== null);

    return pillars.sort((a, b) => PILLAR_KEY_ORDER.indexOf(a.key) - PILLAR_KEY_ORDER.indexOf(b.key));
  } catch (err) {
    console.error("getTopLevelPillars failed, returning empty list", err);
    return [];
  }
}

/**
 * Minimal shapes for the raw rows Supabase's dynamic `.select()` string
 * returns from the nested queries below. These aren't generated from
 * the DB schema (no `Database` type is wired up yet), so they're kept
 * intentionally loose/optional rather than using `any`, which
 * `@typescript-eslint/no-explicit-any` (enabled in .eslintrc.json)
 * disallows.
 */
interface CategoryTranslationRow {
  name: string | null;
  slug?: string | null;
  locale: string;
}

interface CategoryJoinRow {
  id: string;
  parent_id: string | null;
  key?: string;
  category_translations?: CategoryTranslationRow[] | null;
  categories?: { key?: string; category_translations?: CategoryTranslationRow[] | null } | null; // parent, when embedded
}

interface ArticleJoinRow {
  id: string;
  status: string;
  published_at: string | null;
  updated_at: string | null;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  audience: string[] | null;
  reviewed_at: string | null;
  related_lab_key: string | null;
  intel_severity: IntelSeverity | null;
  intel_story_status: IntelStoryStatus | null;
  cve_ids: string[] | null;
  cvss_score: number | null;
  affected_product: string | null;
  exploit_status: ExploitStatus | null;
  kev_listed: boolean | null;
  vendor_advisory_url: string | null;
  patch_status: string | null;
  cyberabeer_priority: CyberAbeerPriority | null;
  mena_relevance: boolean | null;
  sources_checked_at: string | null;
  categories?: CategoryJoinRow | null;
  authors?: { display_name: string | null } | null;
}

interface ArticleTranslationRow {
  slug: string;
  title: string;
  excerpt: string | null;
  body?: string;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
  executive_summary?: string | null;
  reading_time_minutes: number | null;
  articles: ArticleJoinRow;
}

function resolvePillar(
  category: CategoryJoinRow | null | undefined,
  locale: AppLocale
): {
  categoryName: string | null;
  categorySlug: string | null;
  pillarName: string | null;
  pillarSlug: string | null;
  pillarKey: string | null;
} {
  const categoryT = category?.category_translations?.find((t) => t.locale === locale);
  // A hub category's parent (if any) is its pillar; a pillar category with
  // no parent is its own pillar for display purposes.
  const parentT = category?.categories?.category_translations?.find((t) => t.locale === locale);
  return {
    categoryName: categoryT?.name ?? null,
    categorySlug: categoryT?.slug ?? null,
    pillarName: parentT?.name ?? categoryT?.name ?? null,
    pillarSlug: parentT?.slug ?? categoryT?.slug ?? null,
    pillarKey: category?.categories?.key ?? category?.key ?? null,
  };
}

function mapIntelligenceMeta(row: ArticleJoinRow): IntelligenceMeta {
  return {
    intelSeverity: row.intel_severity ?? null,
    intelStoryStatus: row.intel_story_status ?? null,
    cveIds: row.cve_ids ?? [],
    cvssScore: row.cvss_score ?? null,
    affectedProduct: row.affected_product ?? null,
    exploitStatus: row.exploit_status ?? null,
    kevListed: row.kev_listed ?? false,
    vendorAdvisoryUrl: row.vendor_advisory_url ?? null,
    patchStatus: row.patch_status ?? null,
    cyberabeerPriority: row.cyberabeer_priority ?? null,
    menaRelevance: row.mena_relevance ?? false,
    sourcesCheckedAt: row.sources_checked_at ?? null,
  };
}

function mapArticleRow(row: ArticleTranslationRow, locale: AppLocale): ArticleSummary {
  const { categoryName, categorySlug, pillarName, pillarSlug, pillarKey } = resolvePillar(row.articles.categories, locale);
  return {
    id: row.articles.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    publishedAt: row.articles.published_at,
    updatedAt: row.articles.updated_at,
    readingTimeMinutes: row.reading_time_minutes,
    categoryName,
    categorySlug,
    pillarName,
    pillarSlug,
    pillarKey,
    difficulty: row.articles.difficulty ?? null,
    audience: row.articles.audience ?? [],
    ...mapIntelligenceMeta(row.articles),
  };
}

const ARTICLE_JOIN_SELECT = `
  slug, title, excerpt, reading_time_minutes,
  articles!inner (
    id, status, published_at, updated_at, difficulty, audience, reviewed_at, related_lab_key,
    intel_severity, intel_story_status, cve_ids, cvss_score, affected_product, exploit_status,
    kev_listed, vendor_advisory_url, patch_status, cyberabeer_priority, mena_relevance, sources_checked_at,
    categories ( id, parent_id, key, category_translations ( name, slug, locale ), categories ( key, category_translations ( name, slug, locale ) ) )
  )
`;

/**
 * Full detail select for a single article (getArticleBySlug), factored
 * out to a constant so the Unicode-normalization retry path below can
 * reuse the exact same shape without drifting from the primary query.
 */
const ARTICLE_DETAIL_SELECT = `
  slug, title, excerpt, body, meta_title, meta_description, og_image_url, executive_summary, reading_time_minutes,
  articles!inner (
    id, status, published_at, updated_at, difficulty, audience, reviewed_at, related_lab_key,
    intel_severity, intel_story_status, cve_ids, cvss_score, affected_product, exploit_status,
    kev_listed, vendor_advisory_url, patch_status, cyberabeer_priority, mena_relevance, sources_checked_at,
    categories ( id, parent_id, key, category_translations ( name, slug, locale ), categories ( key, category_translations ( name, slug, locale ) ) ),
    authors ( display_name )
  )
`;

/**
 * The Insights and Research pages both read from the same
 * article-publishing pipeline (Phase 3 CONTENT domain:
 * articles + article_translations + categories). This is the "content
 * publishing architecture" the milestone asks for: the query layer,
 * the route, and the rendering all work end to end. No rows are
 * seeded, so until an admin publishes something, this returns an
 * empty array and the pages render an honest "nothing published yet"
 * state instead of fabricated posts.
 *
 * Every query fails soft: if Supabase isn't reachable (for example,
 * this environment has no live project configured yet), the page
 * still renders the empty state rather than crashing the route.
 */
export async function getPublishedArticles(locale: AppLocale): Promise<ArticleSummary[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select(ARTICLE_JOIN_SELECT)
      .eq("locale", locale)
      .eq("articles.status", "published")
      .lte("articles.published_at", new Date().toISOString())
      .order("published_at", { referencedTable: "articles", ascending: false });

    if (error) throw error;

    // Cast through `unknown`: with no generated `Database` types wired up,
    // supabase-js's default inference types every embedded relation as an
    // array (it can't see the FK cardinality), so it infers `articles` as
    // an array here even though PostgREST returns a single object for this
    // many-to-one embed at runtime. That mismatch is wide enough that TS
    // refuses a direct `as ArticleTranslationRow[]` cast ("insufficient
    // overlap"), even though the shape is correct once the real DB types
    // are generated.
    return ((data ?? []) as unknown as ArticleTranslationRow[]).map((row) => mapArticleRow(row, locale));
  } catch (err) {
    console.error("getPublishedArticles failed, returning empty list", err);
    return [];
  }
}

/**
 * Articles for a pillar or hub landing page. `categoryIds` is the hub's
 * own id, or (for a pillar) the pillar's id plus every child hub id --
 * resolved by the caller via `getCategoryBySlug`, since supabase-js
 * cannot express "this category OR its children" as a single filter on
 * a nested embed.
 */
export async function getArticlesByCategoryIds(locale: AppLocale, categoryIds: string[]): Promise<ArticleSummary[]> {
  if (categoryIds.length === 0) return [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select(ARTICLE_JOIN_SELECT)
      .eq("locale", locale)
      .eq("articles.status", "published")
      .in("articles.category_id", categoryIds)
      .lte("articles.published_at", new Date().toISOString())
      .order("published_at", { referencedTable: "articles", ascending: false });

    if (error) throw error;
    return ((data ?? []) as unknown as ArticleTranslationRow[]).map((row) => mapArticleRow(row, locale));
  } catch (err) {
    console.error("getArticlesByCategoryIds failed, returning empty list", err);
    return [];
  }
}

/**
 * The most recent Cyber Intelligence items across every intelligence
 * hub, identified by `intel_severity is not null` rather than a
 * category-id list -- an article is "intelligence" content because it
 * carries intelligence metadata, regardless of which of the 7 hubs it
 * lives in. Used by the homepage's restrained "Latest Cyber
 * Intelligence" section (Section 21 of the spec, capped at 3-5 items)
 * and by the /intelligence hub's "Today's Cyber Brief" strip.
 */
export async function getLatestIntelligenceArticles(locale: AppLocale, limit = 5): Promise<ArticleSummary[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select(ARTICLE_JOIN_SELECT)
      .eq("locale", locale)
      .eq("articles.status", "published")
      .not("articles.intel_severity", "is", null)
      .lte("articles.published_at", new Date().toISOString())
      .order("published_at", { referencedTable: "articles", ascending: false })
      .limit(limit);

    if (error) throw error;
    return ((data ?? []) as unknown as ArticleTranslationRow[]).map((row) => mapArticleRow(row, locale));
  } catch (err) {
    console.error("getLatestIntelligenceArticles failed, returning empty list", err);
    return [];
  }
}

/**
 * Articles carrying a specific cross-cutting tag (e.g. the founder's own
 * "dr-abeer-insights" voice pieces, which cut across pillars rather than
 * belonging to one). Used by the Insights page's "Dr. Abeer Insights"
 * rail so it stays correct as more tagged pieces are published, instead
 * of hardcoding a slug list in the page component.
 */
export async function getArticlesByTag(locale: AppLocale, tagKey: string): Promise<ArticleSummary[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: tagRow, error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("key", tagKey)
      .maybeSingle();
    if (tagError) throw tagError;
    if (!tagRow) return [];

    const { data: linkRows, error: linkError } = await supabase
      .from("article_tags")
      .select("article_id")
      .eq("tag_id", (tagRow as { id: string }).id);
    if (linkError) throw linkError;

    const articleIds = (linkRows ?? []).map((r) => (r as { article_id: string }).article_id);
    if (articleIds.length === 0) return [];

    const { data, error } = await supabase
      .from("article_translations")
      .select(ARTICLE_JOIN_SELECT)
      .eq("locale", locale)
      .in("articles.id", articleIds)
      .eq("articles.status", "published")
      .order("published_at", { referencedTable: "articles", ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as ArticleTranslationRow[]).map((row) => mapArticleRow(row, locale));
  } catch (err) {
    console.error("getArticlesByTag failed, returning empty list", err);
    return [];
  }
}

/**
 * Resolves a pillar or hub by its locale-specific slug (the `/topics/[pillar]`
 * route param). Returns child hubs only when the category is itself a
 * pillar -- a hub's own page has no further children to list.
 */
export async function getCategoryBySlug(locale: AppLocale, slug: string): Promise<CategoryDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("category_translations")
      .select(
        `
        name, slug, description, meta_title, meta_description,
        categories!inner ( id, key, is_pillar, deleted_at )
        `
      )
      .eq("locale", locale)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    interface Row {
      name: string;
      slug: string;
      description: string | null;
      meta_title: string | null;
      meta_description: string | null;
      categories: { id: string; key: string; is_pillar: boolean; deleted_at: string | null };
    }
    const row = data as unknown as Row;
    if (row.categories.deleted_at) return null;

    let hubs: CategoryDetail["hubs"] = [];
    if (row.categories.is_pillar) {
      const { data: hubRows, error: hubError } = await supabase
        .from("categories")
        .select("id, key, category_translations ( name, slug, description, locale )")
        .eq("parent_id", row.categories.id)
        .is("deleted_at", null);
      if (hubError) throw hubError;

      interface HubRow {
        id: string;
        key: string;
        category_translations: { name: string; slug: string; description: string | null; locale: string }[];
      }
      hubs = ((hubRows ?? []) as unknown as HubRow[])
        .map((h) => {
          const t = h.category_translations.find((ct) => ct.locale === locale);
          return t ? { id: h.id, key: h.key, slug: t.slug, name: t.name, description: t.description } : null;
        })
        .filter((h): h is CategoryDetail["hubs"][number] => h !== null);
    }

    return {
      id: row.categories.id,
      key: row.categories.key,
      slug: row.slug,
      name: row.name,
      description: row.description,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      isPillar: row.categories.is_pillar,
      hubs,
    };
  } catch (err) {
    console.error("getCategoryBySlug failed, returning null", err);
    return null;
  }
}

/**
 * Bilingual articles are independently translated, not transliterated
 * (see 013_content_seed_flagship_articles.sql), so the same article's
 * English and Arabic slugs can legitimately differ. hreflang/canonical
 * tags must point each locale at *that locale's own* slug for the
 * article, not silently reuse the current locale's slug -- otherwise
 * the alternate-language link 404s. This resolves every locale's slug
 * for a given article id in one query, for `buildMetadata`'s
 * `alternatePaths` param.
 */
export async function getArticleLocaleSlugs(articleId: string): Promise<Partial<Record<AppLocale, string>>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select("locale, slug")
      .eq("article_id", articleId)
      .in("locale", locales as unknown as string[]);
    if (error) throw error;

    const result: Partial<Record<AppLocale, string>> = {};
    for (const row of (data ?? []) as { locale: string; slug: string }[]) {
      if ((locales as readonly string[]).includes(row.locale)) {
        result[row.locale as AppLocale] = row.slug;
      }
    }
    return result;
  } catch (err) {
    console.error("getArticleLocaleSlugs failed, returning empty map", err);
    return {};
  }
}

/**
 * Same cross-locale slug problem as `getArticleLocaleSlugs`, for
 * pillar/hub category pages: `category_translations.slug` is
 * independently translated per locale (see
 * 012_content_engine_expansion.sql), so `/topics/[pillar]` needs each
 * locale's own slug for correct hreflang/canonical, not a reused
 * current-locale slug.
 */
export async function getCategoryLocaleSlugs(categoryId: string): Promise<Partial<Record<AppLocale, string>>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("category_translations")
      .select("locale, slug")
      .eq("category_id", categoryId)
      .in("locale", locales as unknown as string[]);
    if (error) throw error;

    const result: Partial<Record<AppLocale, string>> = {};
    for (const row of (data ?? []) as { locale: string; slug: string }[]) {
      if ((locales as readonly string[]).includes(row.locale)) {
        result[row.locale as AppLocale] = row.slug;
      }
    }
    return result;
  } catch (err) {
    console.error("getCategoryLocaleSlugs failed, returning empty map", err);
    return {};
  }
}

/**
 * Unicode-normalization-tolerant slug lookup, used as a fallback inside
 * `getArticleBySlug` when the exact byte match fails. Non-Latin slugs
 * (Arabic in particular) can be composed of visually-identical but
 * byte-different codepoint sequences -- e.g. a precomposed vs.
 * decomposed form, or a presentation-form letter standing in for its
 * standard-block equivalent. A URL that *looks* correct in the browser
 * and even survives a manual percent-decode can still fail a raw
 * `.eq("slug", slug)` match. This scans this locale's published slugs
 * and returns the one whose NFC-normalized form matches the requested
 * slug's NFC-normalized form, so a byte-mismatched-but-visually-identical
 * request still resolves to the real article instead of 404ing.
 */
async function findCanonicalSlugByNormalizedMatch(locale: AppLocale, slug: string): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select("slug, articles!inner(status)")
      .eq("locale", locale)
      .eq("articles.status", "published");

    if (error) throw error;

    const target = slug.normalize("NFC");
    for (const row of (data ?? []) as { slug: string }[]) {
      if (row.slug === slug) continue;
      if (row.slug.normalize("NFC") === target) return row.slug;
    }
    return null;
  } catch (err) {
    console.error("findCanonicalSlugByNormalizedMatch failed, returning null", err);
    return null;
  }
}

export async function getArticleBySlug(locale: AppLocale, slug: string): Promise<ArticleDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select(ARTICLE_DETAIL_SELECT)
      .eq("locale", locale)
      .eq("slug", slug)
      .eq("articles.status", "published")
      .lte("articles.published_at", new Date().toISOString())
      .maybeSingle();

    console.log(
      "[getArticleBySlug:debug]",
      JSON.stringify({
        locale,
        slug,
        slugLen: slug.length,
        hasData: !!data,
        errMessage: error ? (error).message ?? null : null,
        errCode: error ? (error).code ?? null : null,
        errDetails: error ? (error).details ?? null : null,
        errHint: error ? (error).hint ?? null : null,
      })
    );

    if (error) throw error;

    let matchedRow = data;

    // Unicode-normalization fallback: retry once against the canonical
    // slug if the exact byte match above found nothing. See
    // findCanonicalSlugByNormalizedMatch for why this is necessary for
    // non-Latin (e.g. Arabic) slugs.
    if (!matchedRow) {
      const canonicalSlug = await findCanonicalSlugByNormalizedMatch(locale, slug);
      if (canonicalSlug) {
        const { data: retryData, error: retryError } = await supabase
          .from("article_translations")
          .select(ARTICLE_DETAIL_SELECT)
          .eq("locale", locale)
          .eq("slug", canonicalSlug)
          .eq("articles.status", "published")
          .lte("articles.published_at", new Date().toISOString())
          .maybeSingle();
        if (retryError) throw retryError;
        matchedRow = retryData;
      }
    }

    if (!matchedRow) return null;

    // Same `unknown` double-cast as getPublishedArticles above, and for
    // the same reason: no generated `Database` types, so supabase-js's
    // inferred shape for the embedded `articles` relation doesn't
    // structurally overlap with the single-object `ArticleJoinRow` type.
    const row = matchedRow as unknown as ArticleTranslationRow;
    const summary = mapArticleRow(row, locale);

    const [{ data: sourceRows }, { data: relationRows }] = await Promise.all([
      supabase
        .from("article_sources")
        .select("title, publisher, url, published_date, accessed_date, sort_order")
        .eq("article_id", row.articles.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("article_relations")
        .select("sort_order, related_article_id, articles:related_article_id ( id )")
        .eq("article_id", row.articles.id)
        .order("sort_order", { ascending: true }),
    ]);

    const sources: ArticleSource[] = (sourceRows ?? []).map((s) => ({
      title: s.title as string,
      publisher: (s.publisher as string | null) ?? null,
      url: s.url as string,
      publishedDate: (s.published_date as string | null) ?? null,
      accessedDate: s.accessed_date as string,
    }));

    // Related articles are resolved as a second, separate lookup by slug
    // rather than a deep nested embed, since we need the *translation* row
    // (title/slug/excerpt) for each related article id, in this locale.
    const relatedIds = (relationRows ?? []).map((r) => r.related_article_id as string);
    let relatedArticles: ArticleSummary[] = [];
    if (relatedIds.length > 0) {
      const { data: relatedRows } = await supabase
        .from("article_translations")
        .select(ARTICLE_JOIN_SELECT)
        .eq("locale", locale)
        .in("articles.id", relatedIds)
        .eq("articles.status", "published");
      relatedArticles = ((relatedRows ?? []) as unknown as ArticleTranslationRow[]).map((r) => mapArticleRow(r, locale));
    }

    return {
      ...summary,
      body: row.body ?? "",
      metaTitle: row.meta_title ?? null,
      metaDescription: row.meta_description ?? null,
      ogImageUrl: row.og_image_url ?? null,
      authorName: row.articles.authors?.display_name ?? null,
      reviewedAt: row.articles.reviewed_at ?? null,
      relatedLabKey: row.articles.related_lab_key ?? null,
      executiveSummary: row.executive_summary ?? null,
      sources,
      relatedArticles,
    };
  } catch (err) {
    console.error(
      "getArticleBySlug failed, returning null",
      JSON.stringify({
        message: (err && err.message) ?? String(err),
        code: (err && err.code) ?? null,
        details: (err && err.details) ?? null,
        hint: (err && err.hint) ?? null,
      })
    );
    return null;
  }
}

/**
 * Word-order-tolerant slug fallback. Article slugs are hyphen-joined
 * token sequences; when a slug is renamed (e.g. an Arabic word-order
 * repair pass) after being shared, bookmarked, or indexed elsewhere,
 * the old URL's tokens are identical but in a different order and
 * will never byte-match a direct getArticleBySlug lookup, producing a
 * hard 404 even though the article is still published under a new
 * slug. This scans this locale's published slugs and returns the
 * canonical slug whose token set (order-independent, and each token
 * NFC-normalized so visually-identical-but-byte-different Arabic
 * tokens still match) matches the requested slug, so callers can
 * redirect to the real article instead of 404ing. Only meant to be
 * called as a fallback after getArticleBySlug(locale, slug) has
 * already returned null for the exact slug -- it is not a substitute
 * for the primary lookup (which now has its own NFC-normalized retry
 * for the more common non-reordered case).
 */
export async function findCanonicalSlugByTokenPermutation(locale: AppLocale, slug: string): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select("slug, articles!inner(status)")
      .eq("locale", locale)
      .eq("articles.status", "published");

    if (error) throw error;

    const normalize = (s: string) =>
      s
        .normalize("NFC")
        .split("-")
        .sort()
        .join(" ");
    const requestedTokens = normalize(slug);

    for (const row of (data ?? [])) {
      if (row.slug === slug) continue;
      if (normalize(row.slug) === requestedTokens) return row.slug;
    }
    return null;
  } catch (err) {
    console.error("findCanonicalSlugByTokenPermutation failed, returning null", err);
    return null;
  }
}
