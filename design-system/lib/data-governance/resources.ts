import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";
import { DG_CATEGORIES, routeForDbKey, type DgCategoryRoute, type DgResourceType } from "./config";

/** Serializable card shape handed to client components. */
export interface DgResourceCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: DgCategoryRoute;
  resourceType: DgResourceType;
  isInteractive: boolean;
  isFeatured: boolean;
  topics: string[];
  readingTime: number | null;
  /** ISO date used for sorting and display. */
  date: string | null;
}

interface MetaRow {
  resource_type: string | null;
  is_interactive: boolean | null;
  is_featured: boolean | null;
  topic_tags: string[] | null;
}

interface Row {
  slug: string;
  title: string;
  excerpt: string | null;
  reading_time_minutes: number | null;
  articles: {
    id: string;
    published_at: string | null;
    updated_at: string | null;
    category_id: string | null;
    article_dg_meta: MetaRow | MetaRow[] | null;
  };
}

const RESOURCE_TYPES: DgResourceType[] = ["guide", "checklist", "framework", "example", "template"];

function asResourceType(value: string | null | undefined): DgResourceType {
  return RESOURCE_TYPES.find((t) => t === value) ?? "guide";
}

function firstMeta(meta: MetaRow | MetaRow[] | null | undefined): MetaRow | null {
  if (!meta) return null;
  if (Array.isArray(meta)) return meta[0] ?? null;
  return meta;
}

/**
 * Published Data Governance resources for a locale, newest first.
 * Fails soft: any error returns an empty list so the hub still renders
 * its honest "being published" state instead of crashing the route.
 */
export async function getDgResources(locale: AppLocale): Promise<DgResourceCard[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: catRows, error: catError } = await supabase
      .from("categories")
      .select("id, key")
      .in(
        "key",
        DG_CATEGORIES.map((c) => c.dbKey)
      )
      .is("deleted_at", null);
    if (catError) throw catError;

    const routeById = new Map<string, DgCategoryRoute>();
    for (const c of (catRows ?? []) as { id: string; key: string }[]) {
      const route = routeForDbKey(c.key);
      if (route) routeById.set(c.id, route);
    }
    if (routeById.size === 0) return [];

    const { data, error } = await supabase
      .from("article_translations")
      .select(
        `
        slug, title, excerpt, reading_time_minutes,
        articles!inner (
          id, published_at, updated_at, category_id,
          article_dg_meta ( resource_type, is_interactive, is_featured, topic_tags )
        )
      `
      )
      .eq("locale", locale)
      .eq("articles.status", "published")
      .in("articles.category_id", Array.from(routeById.keys()))
      .lte("articles.published_at", new Date().toISOString());
    if (error) throw error;

    const cards: DgResourceCard[] = [];
    for (const row of (data ?? []) as unknown as Row[]) {
      const category = row.articles.category_id ? routeById.get(row.articles.category_id) : undefined;
      if (!category) continue;
      const meta = firstMeta(row.articles.article_dg_meta);
      cards.push({
        id: row.articles.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt ?? "",
        category,
        resourceType: asResourceType(meta?.resource_type),
        isInteractive: meta?.is_interactive ?? false,
        isFeatured: meta?.is_featured ?? false,
        topics: meta?.topic_tags ?? [],
        readingTime: row.reading_time_minutes,
        date: row.articles.updated_at ?? row.articles.published_at,
      });
    }

    return cards.sort((a, b) => {
      if (a.date === b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date < b.date ? 1 : -1;
    });
  } catch (err) {
    console.error("getDgResources failed, returning empty list", err);
    return [];
  }
}
