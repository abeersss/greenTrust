import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DG_CATEGORIES } from "@/lib/data-governance/config";

/**
 * Founder admin data layer for the Data Governance Center. Reads every
 * DG resource regardless of status (the public layer only sees
 * published ones). Uses the founder's cookie-bound client, so the
 * admin RLS policies (is_platform_admin()) gate what comes back.
 */

export interface DgAdminRow {
  id: string;
  category: string;
  status: string;
  updatedAt: string;
  titleEn: string | null;
  titleAr: string | null;
  slugEn: string | null;
  slugAr: string | null;
  resourceType: string;
  isFeatured: boolean;
}

export interface DgAdminLocale {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: string;
}

export interface DgAdminSource {
  title: string;
  publisher: string;
  url: string;
}

export interface DgAdminDetail {
  id: string | null;
  category: string;
  status: string;
  resourceType: string;
  featured: boolean;
  tags: string;
  en: DgAdminLocale;
  ar: DgAdminLocale;
  sources: DgAdminSource[];
}

const EMPTY_LOCALE: DgAdminLocale = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  metaTitle: "",
  metaDescription: "",
  readingTime: "",
};

export function emptyDgDetail(): DgAdminDetail {
  return {
    id: null,
    category: DG_CATEGORIES[0]?.route ?? "classification",
    status: "draft",
    resourceType: "guide",
    featured: false,
    tags: "",
    en: { ...EMPTY_LOCALE },
    ar: { ...EMPTY_LOCALE },
    sources: [],
  };
}

interface TranslationRow {
  locale: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  meta_title: string | null;
  meta_description: string | null;
  reading_time_minutes: number | null;
}

interface MetaRow {
  resource_type: string;
  is_featured: boolean;
  topic_tags: string[] | null;
}

function oneMeta(raw: unknown): MetaRow | null {
  if (Array.isArray(raw)) return (raw[0] as MetaRow | undefined) ?? null;
  return (raw as MetaRow | null) ?? null;
}

function toLocale(t: TranslationRow | undefined): DgAdminLocale {
  if (!t) return { ...EMPTY_LOCALE };
  return {
    title: t.title ?? "",
    slug: t.slug ?? "",
    excerpt: t.excerpt ?? "",
    body: t.body ?? "",
    metaTitle: t.meta_title ?? "",
    metaDescription: t.meta_description ?? "",
    readingTime: t.reading_time_minutes ? String(t.reading_time_minutes) : "",
  };
}

async function categoryMaps() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("id, key")
    .in(
      "key",
      DG_CATEGORIES.map((c) => c.dbKey)
    );
  const rows = (data ?? []) as unknown as { id: string; key: string }[];
  const idToRoute = new Map<string, string>();
  for (const r of rows) {
    const route = DG_CATEGORIES.find((c) => c.dbKey === r.key)?.route;
    if (route) idToRoute.set(r.id, route);
  }
  return idToRoute;
}

export async function getDgAdminList(): Promise<DgAdminRow[]> {
  try {
    const idToRoute = await categoryMaps();
    const ids = Array.from(idToRoute.keys());
    if (ids.length === 0) return [];
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, status, updated_at, category_id, article_translations ( locale, title, slug ), article_dg_meta ( resource_type, is_featured )"
      )
      .in("category_id", ids)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    type Row = {
      id: string;
      status: string;
      updated_at: string;
      category_id: string;
      article_translations: { locale: string; title: string; slug: string }[] | null;
      article_dg_meta: unknown;
    };
    return ((data ?? []) as unknown as Row[]).map((r) => {
      const en = r.article_translations?.find((t) => t.locale === "en");
      const ar = r.article_translations?.find((t) => t.locale === "ar");
      const meta = oneMeta(r.article_dg_meta);
      return {
        id: r.id,
        category: idToRoute.get(r.category_id) ?? "",
        status: r.status,
        updatedAt: r.updated_at,
        titleEn: en?.title ?? null,
        titleAr: ar?.title ?? null,
        slugEn: en?.slug ?? null,
        slugAr: ar?.slug ?? null,
        resourceType: meta?.resource_type ?? "guide",
        isFeatured: meta?.is_featured ?? false,
      };
    });
  } catch (err) {
    console.error("getDgAdminList failed", err);
    return [];
  }
}

export async function getDgAdminDetail(id: string): Promise<DgAdminDetail | null> {
  try {
    const idToRoute = await categoryMaps();
    const supabase = await createSupabaseServerClient();
    const { data: art, error } = await supabase
      .from("articles")
      .select("id, status, category_id")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!art) return null;
    const a = art as unknown as { id: string; status: string; category_id: string };
    const route = idToRoute.get(a.category_id);
    if (!route) return null; // not a Data Governance resource

    const [{ data: trs }, { data: meta }, { data: srcs }] = await Promise.all([
      supabase
        .from("article_translations")
        .select("locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes")
        .eq("article_id", id),
      supabase.from("article_dg_meta").select("resource_type, is_featured, topic_tags").eq("article_id", id).maybeSingle(),
      supabase.from("article_sources").select("title, publisher, url, sort_order").eq("article_id", id).order("sort_order"),
    ]);
    const translations = (trs ?? []) as unknown as TranslationRow[];
    const m = (meta ?? null) as unknown as MetaRow | null;
    const sources = ((srcs ?? []) as unknown as { title: string; publisher: string | null; url: string }[]).map((s) => ({
      title: s.title,
      publisher: s.publisher ?? "",
      url: s.url,
    }));
    return {
      id: a.id,
      category: route,
      status: a.status,
      resourceType: m?.resource_type ?? "guide",
      featured: m?.is_featured ?? false,
      tags: (m?.topic_tags ?? []).join(", "),
      en: toLocale(translations.find((t) => t.locale === "en")),
      ar: toLocale(translations.find((t) => t.locale === "ar")),
      sources,
    };
  } catch (err) {
    console.error("getDgAdminDetail failed", err);
    return null;
  }
}
