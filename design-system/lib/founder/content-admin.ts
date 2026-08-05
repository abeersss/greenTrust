import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Founder Content admin (CyberAbeer Platform Phase II, Batch 1). Reads
 * every article regardless of status (draft/in_review/published/archived)
 * across every content surface that shares the single articles +
 * article_translations + categories pipeline -- Insights, Cyber
 * Intelligence, and the Learn hub topic articles are all rows in this
 * one table, distinguished only by their category's `key` prefix
 * (category_dr_abeer_insights, pillar_cyber_intelligence / hub_*,
 * hub_cissp / hub_cism / hub_iso27001 / hub_cybersecurity_careers).
 * This intentionally reuses the public `articles` table rather than a
 * separate admin-only shadow table: RLS's `articles_admin_write` policy
 * (using is_platform_admin()) already grants the founder session full
 * read/write here, so the regular cookie-bound server client (not the
 * service-role client) is correct and simplest.
 */

export type FounderContentGroup = "all" | "insights" | "intelligence" | "learn" | "other";

export interface FounderArticleRow {
  id: string;
  categoryKey: string | null;
  categoryName: string | null;
  group: FounderContentGroup;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  titleEn: string | null;
  titleAr: string | null;
  slugEn: string | null;
}

interface CategoryTranslationRow {
  name: string | null;
  locale: string;
}

interface CategoryRow {
  key: string | null;
  category_translations: CategoryTranslationRow[] | null;
}

interface ArticleTranslationRow {
  locale: string;
  title: string;
  slug: string;
}

interface ArticleRow {
  id: string;
  status: string;
  published_at: string | null;
  updated_at: string;
  categories: CategoryRow | null;
  article_translations: ArticleTranslationRow[] | null;
}

function groupForCategoryKey(key: string | null): FounderContentGroup {
  if (!key) return "other";
  if (key === "category_dr_abeer_insights") return "insights";
  if (
    key.startsWith("pillar_cyber_intelligence") ||
    key.startsWith("hub_threat_intel") ||
    key.startsWith("hub_vulnerability_intel") ||
    key.startsWith("hub_ai_security_watch") ||
    key.startsWith("hub_quantum_watch") ||
    key.startsWith("hub_agent_watch")
  ) {
    return "intelligence";
  }
  if (key.startsWith("hub_")) return "learn";
  return "other";
}

export async function getAllArticlesForFounder(): Promise<FounderArticleRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        id, status, published_at, updated_at,
        categories ( key, category_translations ( name, locale ) ),
        article_translations ( locale, title, slug )
      `
      )
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return ((data ?? []) as unknown as ArticleRow[]).map((row) => {
      const enTranslation = row.article_translations?.find((t) => t.locale === "en") ?? null;
      const arTranslation = row.article_translations?.find((t) => t.locale === "ar") ?? null;
      const enCategory = row.categories?.category_translations?.find((t) => t.locale === "en") ?? null;
      const categoryKey = row.categories?.key ?? null;

      return {
        id: row.id,
        categoryKey,
        categoryName: enCategory?.name ?? categoryKey,
        group: groupForCategoryKey(categoryKey),
        status: row.status,
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
        titleEn: enTranslation?.title ?? null,
        titleAr: arTranslation?.title ?? null,
        slugEn: enTranslation?.slug ?? null,
      };
    });
  } catch (err) {
    console.error("getAllArticlesForFounder failed, returning empty list", err);
    return [];
  }
}
