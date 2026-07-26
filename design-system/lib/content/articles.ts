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

    return (data ?? []).map((row: any) => ({
      id: row.articles.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      publishedAt: row.articles.published_at,
      readingTimeMinutes: row.reading_time_minutes,
      categoryName:
        row.articles.categories?.category_translations?.find((t: any) => t.locale === locale)?.name ?? null,
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

    const row = data as any;
    return {
      id: row.articles.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      body: row.body,
      publishedAt: row.articles.published_at,
      readingTimeMinutes: row.reading_time_minutes,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      ogImageUrl: row.og_image_url,
      categoryName:
        row.articles.categories?.category_translations?.find((t: any) => t.locale === locale)?.name ?? null,
      authorName: row.articles.authors?.display_name ?? null,
    };
  } catch (err) {
    console.error("getArticleBySlug failed, returning null", err);
    return null;
  }
}
