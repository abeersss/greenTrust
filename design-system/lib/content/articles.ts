import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";

export interface ArticleSource {
  title: string;
  publisher: string | null;
  url: string;
  publishedDate: string | null;
  accessedDate: string;
}

export interface ArticleSummary {
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
  category_translations?: CategoryTranslationRow[] | null;
  categories?: { category_translations?: CategoryTranslationRow[] | null } | null; // parent, when embedded
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
  reading_time_minutes: number | null;
  articles: ArticleJoinRow;
}

function resolvePillar(
  category: CategoryJoinRow | null | undefined,
  locale: AppLocale
): { categoryName: string | null; categorySlug: string | null; pillarName: string | null; pillarSlug: string | null } {
  const categoryT = category?.category_translations?.find((t) => t.locale === locale);
  // A hub category's parent (if any) is its pillar; a pillar category with
  // no parent is its own pillar for display purposes.
  const parentT = category?.categories?.category_translations?.find((t) => t.locale === locale);
  return {
    categoryName: categoryT?.name ?? null,
    categorySlug: categoryT?.slug ?? null,
    pillarName: parentT?.name ?? categoryT?.name ?? null,
    pillarSlug: parentT?.slug ?? categoryT?.slug ?? null,
  };
}

function mapArticleRow(row: ArticleTranslationRow, locale: AppLocale): ArticleSummary {
  const { categoryName, categorySlug, pillarName, pillarSlug } = resolvePillar(row.articles.categories, locale);
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
    difficulty: row.articles.difficulty ?? null,
    audience: row.articles.audience ?? [],
  };
}

const ARTICLE_JOIN_SELECT = `
  slug, title, excerpt, reading_time_minutes,
  articles!inner (
    id, status, published_at, updated_at, difficulty, audience, reviewed_at, related_lab_key,
    categories ( id, parent_id, category_translations ( name, slug, locale ), categories ( category_translations ( name, slug, locale ) ) )
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

export async function getArticleBySlug(locale: AppLocale, slug: string): Promise<ArticleDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("article_translations")
      .select(
        `
        slug, title, excerpt, body, meta_title, meta_description, og_image_url, reading_time_minutes,
        articles!inner (
          id, status, published_at, updated_at, difficulty, audience, reviewed_at, related_lab_key,
          categories ( id, parent_id, category_translations ( name, slug, locale ), categories ( category_translations ( name, slug, locale ) ) ),
          authors ( display_name )
        )
      `
      )
      .eq("locale", locale)
      .eq("slug", slug)
      .eq("articles.status", "published")
      .lte("articles.published_at", new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Same `unknown` double-cast as getPublishedArticles above, and for
    // the same reason: no generated `Database` types, so supabase-js's
    // inferred shape for the embedded `articles` relation doesn't
    // structurally overlap with the single-object `ArticleJoinRow` type.
    const row = data as unknown as ArticleTranslationRow;
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
      sources,
      relatedArticles,
    };
  } catch (err) {
    console.error("getArticleBySlug failed, returning null", err);
    return null;
  }
}
