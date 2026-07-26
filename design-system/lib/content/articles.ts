import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  readingTimeMinutes: number | null;
  categoryName: string | null;
}

export interface ArticleDetail extends ArticleSummary {
  body: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  authorName: string | null;
}

/**
 * Minimal shapes for the raw rows Supabase's dynamic `.select()` string
 * returns from the two nested queries below. These aren't generated
 * from the DB schema (no `Database` type is wired up yet), so they're
 * kept intentionally loose/optional rather than using `any`, which
 * `@typescript-eslint/no-explicit-any` (enabled in .eslintrc.json)
 * disallows.
 */
interface CategoryTranslationRow {
  name: string | null;
  locale: string;
}

interface ArticleJoinRow {
  id: string;
  status: string;
  published_at: string | null;
  categories?: { category_translations?: CategoryTranslationRow[] | null } | null;
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
      .select(
        `
        slug, title, excerpt, reading_time_minutes,
        articles!inner (
          id, status, published_at,
          categories ( category_translations ( name, locale ) )
        )
      `
      )
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
    return ((data ?? []) as unknown as ArticleTranslationRow[]).map((row) => ({
      id: row.articles.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      publishedAt: row.articles.published_at,
      readingTimeMinutes: row.reading_time_minutes,
      categoryName:
        row.articles.categories?.category_translations?.find((t) => t.locale === locale)?.name ?? null,
    }));
  } catch (err) {
    console.error("getPublishedArticles failed, returning empty list", err);
    return [];
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
          id, status, published_at,
          categories ( category_translations ( name, locale ) ),
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
    return {
      id: row.articles.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      body: row.body ?? "",
      publishedAt: row.articles.published_at,
      readingTimeMinutes: row.reading_time_minutes,
      metaTitle: row.meta_title ?? null,
      metaDescription: row.meta_description ?? null,
      ogImageUrl: row.og_image_url ?? null,
      categoryName:
        row.articles.categories?.category_translations?.find((t) => t.locale === locale)?.name ?? null,
      authorName: row.articles.authors?.display_name ?? null,
    };
  } catch (err) {
    console.error("getArticleBySlug failed, returning null", err);
    return null;
  }
}
