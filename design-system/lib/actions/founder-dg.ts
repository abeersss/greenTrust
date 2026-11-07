"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireFounder } from "@/lib/auth/founder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DG_CATEGORIES } from "@/lib/data-governance/config";
import type { AppLocale } from "@/lib/i18n/config";
import { actionError, actionSuccess, type ActionResult } from "./types";

const STATUSES = ["draft", "founder_review", "published", "archived"] as const;
const TYPES = ["guide", "checklist", "framework", "example", "template"] as const;

export interface DgSaveLocale {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: string;
}

export interface DgSaveInput {
  id: string | null;
  category: string;
  status: string;
  resourceType: string;
  featured: boolean;
  tags: string;
  en: DgSaveLocale;
  ar: DgSaveLocale;
  sources: { title: string; publisher: string; url: string }[];
}

/** Lowercase latin slugs; Arabic letters and digits are kept as-is. */
function normalizeSlug(raw: string): string {
  return raw
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/**
 * Defense in depth only: bodies are founder-authored HTML (same trust
 * model as the Insights article template), but scripts, inline event
 * handlers and javascript: URLs are never allowed through.
 */
function cleanBody(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

function hasContent(l: DgSaveLocale): boolean {
  return Boolean(l.title.trim() || l.slug.trim() || l.body.trim());
}

function readingMinutes(l: DgSaveLocale): number {
  const n = Math.floor(Number(l.readingTime));
  if (Number.isFinite(n) && n > 0 && n < 120) return n;
  const words = l.body.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function saveDgResource(locale: AppLocale, input: DgSaveInput): Promise<ActionResult> {
  await requireFounder(locale);

  const cat = DG_CATEGORIES.find((c) => c.route === input.category);
  if (!cat) return actionError("Choose a valid category.");
  if (!(STATUSES as readonly string[]).includes(input.status)) return actionError("Invalid status.");
  if (!(TYPES as readonly string[]).includes(input.resourceType)) return actionError("Invalid resource type.");

  const locales: { code: "en" | "ar"; data: DgSaveLocale }[] = [
    { code: "en" as const, data: input.en },
    { code: "ar" as const, data: input.ar },
  ].filter((x) => hasContent(x.data));
  if (locales.length === 0) return actionError("Add content in English, Arabic, or both.");

  for (const l of locales) {
    const label = l.code === "en" ? "English" : "Arabic";
    if (!l.data.title.trim()) return actionError(`${label}: add a title.`);
    if (!normalizeSlug(l.data.slug || l.data.title)) return actionError(`${label}: add a slug.`);
    if (!l.data.body.trim()) return actionError(`${label}: add the body.`);
  }

  const sources: { title: string; publisher: string; url: string }[] = [];
  for (const s of input.sources) {
    if (!s.title.trim() && !s.url.trim()) continue;
    try {
      const u = new URL(s.url.trim());
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("protocol");
      sources.push({ title: s.title.trim() || u.hostname, publisher: s.publisher.trim(), url: u.toString() });
    } catch {
      return actionError(`Source "${s.title || s.url}" needs a valid web address (https://...).`);
    }
  }

  const tags = input.tags
    .split(",")
    .map((t) => t.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 8);

  let articleId = input.id;
  const isNew = !articleId;

  try {
    const supabase = await createSupabaseServerClient();

    const { data: catRow } = await supabase.from("categories").select("id").eq("key", cat.dbKey).maybeSingle();
    const categoryId = (catRow as { id: string } | null)?.id;
    if (!categoryId) return actionError("Category not found. Run the Data Governance database migration first.");

    const nowIso = new Date().toISOString();

    if (!articleId) {
      const { data: author } = await supabase
        .from("authors")
        .select("id")
        .eq("display_name", "Dr. Abeer Alshammari")
        .maybeSingle();
      const authorId = (author as { id: string } | null)?.id;
      if (!authorId) return actionError("Author record not found.");
      const { data: created, error } = await supabase
        .from("articles")
        .insert({
          author_id: authorId,
          category_id: categoryId,
          status: input.status,
          schema_type: "Article",
          difficulty: "intermediate",
          audience: ["professionals"],
          published_at: nowIso,
        })
        .select("id")
        .single();
      if (error) throw error;
      articleId = (created as { id: string }).id;
    } else {
      const { data: prev } = await supabase.from("articles").select("status").eq("id", articleId).maybeSingle();
      const wasPublished = (prev as { status: string } | null)?.status === "published";
      const patch: Record<string, unknown> = { category_id: categoryId, status: input.status };
      if (input.status === "published" && !wasPublished) patch.published_at = nowIso;
      const { error } = await supabase.from("articles").update(patch).eq("id", articleId);
      if (error) throw error;
    }

    for (const l of locales) {
      const row = {
        title: l.data.title.trim(),
        slug: normalizeSlug(l.data.slug || l.data.title),
        excerpt: l.data.excerpt.trim() || null,
        body: cleanBody(l.data.body),
        meta_title: l.data.metaTitle.trim() || null,
        meta_description: l.data.metaDescription.trim() || null,
        reading_time_minutes: readingMinutes(l.data),
      };
      const { data: existing } = await supabase
        .from("article_translations")
        .select("id")
        .eq("article_id", articleId)
        .eq("locale", l.code)
        .maybeSingle();
      const existingId = (existing as { id: string } | null)?.id;
      if (existingId) {
        const { error } = await supabase.from("article_translations").update(row).eq("id", existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("article_translations")
          .insert({ article_id: articleId, locale: l.code, ...row });
        if (error) throw error;
      }
    }

    const { error: metaErr } = await supabase.from("article_dg_meta").upsert(
      {
        article_id: articleId,
        resource_type: input.resourceType,
        is_featured: input.featured,
        topic_tags: tags,
      },
      { onConflict: "article_id" }
    );
    if (metaErr) throw metaErr;

    const { error: delErr } = await supabase.from("article_sources").delete().eq("article_id", articleId);
    if (delErr) throw delErr;
    if (sources.length > 0) {
      const today = nowIso.slice(0, 10);
      const { error: srcErr } = await supabase.from("article_sources").insert(
        sources.map((s, i) => ({
          article_id: articleId,
          title: s.title,
          publisher: s.publisher || null,
          url: s.url,
          accessed_date: today,
          sort_order: i + 1,
        }))
      );
      if (srcErr) throw srcErr;
    }

    revalidatePath(`/${locale}/founder/data-governance`);
    for (const loc of ["en", "ar"]) {
      revalidatePath(`/${loc}/data-governance`);
      revalidatePath(`/${loc}/data-governance/${cat.route}`);
    }
  } catch (err) {
    console.error("saveDgResource failed", err);
    const msg = err instanceof Error ? err.message : "";
    if (/duplicate key|unique/i.test(msg)) {
      return actionError("That slug is already used by another resource in the same language. Change the slug.");
    }
    return actionError("Could not save. Please check the fields and try again.");
  }

  if (isNew && articleId) {
    redirect(`/${locale}/founder/data-governance/${articleId}`);
  }
  return actionSuccess();
}
