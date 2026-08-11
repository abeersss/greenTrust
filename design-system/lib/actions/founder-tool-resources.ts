"use server";

import { revalidatePath } from "next/cache";
import { requireFounder } from "@/lib/auth/founder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadMediaFile } from "@/lib/storage/upload-media";
import type { AppLocale } from "@/lib/i18n/config";
import { actionError, actionSuccess, type ActionResult } from "./types";

/**
 * Founder CRUD for tool_resources (CyberAbeer Platform, migration
 * 030). Bilingual name + description, plus up to 4 gallery images
 * (shown as a sliding carousel on /free-tools) AND/OR one
 * downloadable file (PDF/xlsx/zip) -- a tool can have both a gallery
 * and a download at once, so adding one never wipes out the other.
 * Same requireFounder() + cookie-session Supabase client pattern as
 * founder-books.ts.
 */
const MAX_IMAGES = 4;

function extractImageFiles(formData: FormData): File[] {
  return formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
}

function extractSingleFile(formData: FormData, key: string): File | null {
  const f = formData.get(key);
  return f instanceof File && f.size > 0 ? f : null;
}

export async function createToolResource(locale: AppLocale, formData: FormData): Promise<ActionResult<void>> {
  await requireFounder(locale);

  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const descriptionEn = String(formData.get("descriptionEn") ?? "").trim();
  const descriptionAr = String(formData.get("descriptionAr") ?? "").trim();

  if (!nameEn) return actionError("Name (English) is required.");
  if (!nameAr) return actionError("Name (Arabic) is required.");
  if (!descriptionEn) return actionError("Description (English) is required.");
  if (!descriptionAr) return actionError("Description (Arabic) is required.");

  const imageFiles = extractImageFiles(formData);
  const fileEntry = extractSingleFile(formData, "file");

  if (imageFiles.length > MAX_IMAGES) return actionError(`You can upload at most ${MAX_IMAGES} images.`);

  try {
    const supabase = await createSupabaseServerClient();

    const imageUrls: string[] = [];
    for (const img of imageFiles) {
      imageUrls.push(await uploadMediaFile(supabase, "tool-resources", img));
    }

    let fileUrl: string | null = null;
    let fileName: string | null = null;
    if (fileEntry) {
      fileUrl = await uploadMediaFile(supabase, "tool-resources", fileEntry);
      fileName = fileEntry.name;
    }

    const { count } = await supabase.from("tool_resources").select("id", { count: "exact", head: true });
    const { error } = await supabase.from("tool_resources").insert({
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      file_url: fileUrl,
      file_name: fileName,
      image_urls: imageUrls,
      display_order: count ?? 0,
    });
    if (error) throw error;
  } catch (err) {
    console.error("createToolResource failed", err);
    return actionError("Could not save the tool. Please try again.");
  }

  revalidatePath(`/${locale}/founder/tool-resources`);
  revalidatePath(`/${locale}/free-tools`);
  return actionSuccess();
}

/**
 * Edits an existing tool_resources row in place. Name/description are
 * always updated; images and file are each only replaced if the
 * founder attaches a new one in this submission -- leaving a picker
 * empty means "keep what's already there" for THAT media type only,
 * so uploading a new image gallery never deletes an existing file
 * (and vice versa). To remove a media type entirely, delete the tool
 * and re-add it, or add an explicit "remove" control later.
 */
export async function updateToolResource(
  locale: AppLocale,
  id: string,
  formData: FormData
): Promise<ActionResult<void>> {
  await requireFounder(locale);

  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const descriptionEn = String(formData.get("descriptionEn") ?? "").trim();
  const descriptionAr = String(formData.get("descriptionAr") ?? "").trim();

  if (!nameEn) return actionError("Name (English) is required.");
  if (!nameAr) return actionError("Name (Arabic) is required.");
  if (!descriptionEn) return actionError("Description (English) is required.");
  if (!descriptionAr) return actionError("Description (Arabic) is required.");

  const imageFiles = extractImageFiles(formData);
  const fileEntry = extractSingleFile(formData, "file");

  if (imageFiles.length > MAX_IMAGES) return actionError(`You can upload at most ${MAX_IMAGES} images.`);

  try {
    const supabase = await createSupabaseServerClient();

    const update: {
      name_en: string;
      name_ar: string;
      description_en: string;
      description_ar: string;
      image_urls?: string[];
      file_url?: string;
      file_name?: string;
    } = {
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descriptionEn,
      description_ar: descriptionAr,
    };

    if (imageFiles.length > 0) {
      const imageUrls: string[] = [];
      for (const img of imageFiles) {
        imageUrls.push(await uploadMediaFile(supabase, "tool-resources", img));
      }
      update.image_urls = imageUrls;
    }

    if (fileEntry) {
      update.file_url = await uploadMediaFile(supabase, "tool-resources", fileEntry);
      update.file_name = fileEntry.name;
    }

    const { error } = await supabase.from("tool_resources").update(update).eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.error("updateToolResource failed", err);
    return actionError("Could not update the tool. Please try again.");
  }

  revalidatePath(`/${locale}/founder/tool-resources`);
  revalidatePath(`/${locale}/free-tools`);
  return actionSuccess();
}

export async function toggleToolResourceActive(
  locale: AppLocale,
  id: string,
  isActive: boolean
): Promise<ActionResult<void>> {
  await requireFounder(locale);

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tool_resources").update({ is_active: isActive }).eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.error("toggleToolResourceActive failed", err);
    return actionError("Could not update the tool. Please try again.");
  }

  revalidatePath(`/${locale}/founder/tool-resources`);
  revalidatePath(`/${locale}/free-tools`);
  return actionSuccess();
}

export async function deleteToolResource(locale: AppLocale, id: string): Promise<ActionResult<void>> {
  await requireFounder(locale);

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("tool_resources").delete().eq("id", id);
    if (error) throw error;
  } catch (err) {
    console.error("deleteToolResource failed", err);
    return actionError("Could not delete the tool. Please try again.");
  }

  revalidatePath(`/${locale}/founder/tool-resources`);
  revalidatePath(`/${locale}/free-tools`);
  return actionSuccess();
}
