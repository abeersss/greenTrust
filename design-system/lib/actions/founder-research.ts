"use server";

import { revalidatePath } from "next/cache";
import { requireFounder } from "@/lib/auth/founder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";
import { actionError, actionSuccess, type ActionResult } from "./types";

/**
 * Founder CRUD for Research page content (CyberAbeer Platform Phase
 * II, migration 031): the bilingual intro paragraph (singleton,
 * mirrors founder-banner.ts), and two ordered lists -- research areas
 * and publications -- with the same hide/delete row actions as
 * founder-books.ts. RLS's admin-all policies let the founder's own
 * session write; requireFounder() mirrors that at the application
 * layer first.
 */

export interface ResearchSettingsForm {
  introEn: string;
  introAr: string;
}

export async function getResearchSettingsForFounder(locale: AppLocale): Promise<ResearchSettingsForm> {
  await requireFounder(locale);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("research_settings")
    .select("intro_en, intro_ar")
    .eq("id", 1)
    .maybeSingle();

  return {
    introEn: (data?.intro_en as string | undefined) ?? "",
    introAr: (data?.intro_ar as string | undefined) ?? "",
  };
}

export async function updateResearchSettings(
  locale: AppLocale,
  formData: FormData
): Promise<ActionResult<void>> {
  const { userId } = await requireFounder(locale);

  const introEn = String(formData.get("introEn") ?? "").trim();
  const introAr = String(formData.get("introAr") ?? "").trim();

  if (!introEn) return actionError("English intro is required.");
  if (!introAr) return actionError("Arabic intro is required.");

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("research_settings")
      .update({
        intro_en: introEn,
        intro_ar: introAr,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) throw error;
  } catch (err) {
    console.error("updateResearchSettings failed", err);
    return actionError("Could not save the intro. Please try again.");
  }

  revalidatePath("/en/research");
  revalidatePath("/ar/research");
  revalidatePath(`/${locale}/founder/research`);
  return actionSuccess();
}

// -- Research areas ---------------------------------------------------

export async function createResearchArea(locale: AppLocale, formData: FormData): Promise<ActionResult<void>> {
  await requireFounder(locale);

  const textEn = String(formData.get("textEn") ?? "").trim();
  const textAr = String(formData.get("textAr") ?? "").trim();
  if (!textEn) return actionError("English text is required.");
  if (!textAr) return actionError("Arabic text is required.");

  try {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase.from("research_areas").select("id", { count: "exact", head: true });
    const { error } = await supabase.from("research_areas").insert({
      text_en: textEn,
      text_ar: textAr,
      display_order: count ?? 0,
    });
    if (error) throw error;
  } catch (err) {
    console.error("createResearchArea failed", err);
    return actionError("Could not save the research area. Please try again.");
  }

  revalidatePath("/en/research");
  revalidatePath("/ar/research");
  revalidatePath(`/${locale}/founder/research`);
  return actionSuccess();
}

export async function toggleResearchAreaActive(
  locale: AppLocale,
  areaId: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  await requireFounder(locale);
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("research_areas").update({ is_active: isActive }).eq("id", areaId);
    if (error) throw error;
  } catch (err) {
    console.error("toggleResearchAreaActive failed", err);
    return actionError("Could not update the research area. Please try again.");
  }
  revalidatePath("/en/research");
  revalidatePath("/ar/research");
  revalidatePath(`/${locale}/founder/research`);
  return actionSuccess();
}

export async function deleteResearchArea(locale: AppLocale, areaId: string): Promise<ActionResult<void>> {
  await requireFounder(locale);
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("research_areas").delete().eq("id", areaId);
    if (error) throw error;
  } catch (err) {
    console.error("deleteResearchArea failed", err);
    return actionError("Could not delete the research area. Please try again.");
  }
  revalidatePath("/en/research");
  revalidatePath("/ar/research");
  revalidatePath(`/${locale}/founder/research`);
  return actionSuccess();
}

// -- Publications -------------------------------------------------------

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createResearchPublication(
  locale: AppLocale,
  formData: FormData
): Promise<ActionResult<void>> {
  await requireFounder(locale);

  const title = String(formData.get("title") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const doiUrl = String(formData.get("doiUrl") ?? "").trim();

  if (!title) return actionError("Title is required.");
  if (!venue) return actionError("Venue is required.");
  if (!year) return actionError("Year is required.");
  if (!doiUrl) return actionError("Link is required.");
  if (!isValidHttpUrl(doiUrl)) return actionError("Link must be a valid URL.");

  try {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase
      .from("research_publications")
      .select("id", { count: "exact", head: true });
    const { error } = await supabase.from("research_publications").insert({
      title,
      venue,
      year,
      doi_url: doiUrl,
      display_order: count ?? 0,
    });
    if (error) throw error;
  } catch (err) {
    console.error("createResearchPublication failed", err);
    return actionError("Could not save the publication. Please try again.");
  }

  revalidatePath("/en/research");
  revalidatePath("/ar/research");
  revalidatePath(`/${locale}/founder/research`);
  return actionSuccess();
}

export async function toggleResearchPublicationActive(
  locale: AppLocale,
  publicationId: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  await requireFounder(locale);
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("research_publications")
      .update({ is_active: isActive })
      .eq("id", publicationId);
    if (error) throw error;
  } catch (err) {
    console.error("toggleResearchPublicationActive failed", err);
    return actionError("Could not update the publication. Please try again.");
  }
  revalidatePath("/en/research");
  revalidatePath("/ar/research");
  revalidatePath(`/${locale}/founder/research`);
  return actionSuccess();
}

export async function deleteResearchPublication(
  locale: AppLocale,
  publicationId: string
): Promise<ActionResult<void>> {
  await requireFounder(locale);
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("research_publications").delete().eq("id", publicationId);
    if (error) throw error;
  } catch (err) {
    console.error("deleteResearchPublication failed", err);
    return actionError("Could not delete the publication. Please try again.");
  }
  revalidatePath("/en/research");
  revalidatePath("/ar/research");
  revalidatePath(`/${locale}/founder/research`);
  return actionSuccess();
}
