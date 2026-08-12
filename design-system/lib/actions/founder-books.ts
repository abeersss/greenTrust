"use server";

import { revalidatePath } from "next/cache";
import { requireFounder } from "@/lib/auth/founder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadMediaFile } from "@/lib/storage/upload-media";
import type { AppLocale } from "@/lib/i18n/config";
import { actionError, actionSuccess, type ActionResult } from "./types";

/**
 * Founder CRUD for the books table (CyberAbeer Platform Phase II).
 * Every book needs a complete English edition AND a complete Arabic
 * edition -- title, description, and Amazon link each required
 * (migration 032) -- plus an optional gallery of up to 4 images per
 * edition. RLS's admin-all policy (migration 029) lets the founder's
 * own session write; requireFounder() mirrors that at the
 * application layer first, same pattern as founder-banner.ts and
 * founder-settings.ts.
 */
const MAX_IMAGES = 4;

function isValidHttpUrl(value: string): boolean {
    try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
    } catch {
          return false;
    }
}

function revalidateBooks(locale: AppLocale) {
    revalidatePath(`/${locale}/founder/books`);
    revalidatePath("/en/books");
    revalidatePath("/ar/books");
}

export async function createBook(locale: AppLocale, formData: FormData): Promise<ActionResult<void>> {
    await requireFounder(locale);

  const titleEn = String(formData.get("titleEn") ?? "").trim();
    const titleAr = String(formData.get("titleAr") ?? "").trim();
    const descriptionEn = String(formData.get("descriptionEn") ?? "").trim();
    const descriptionAr = String(formData.get("descriptionAr") ?? "").trim();
    const amazonUrlEn = String(formData.get("amazonUrlEn") ?? "").trim();
    const amazonUrlAr = String(formData.get("amazonUrlAr") ?? "").trim();

  if (!titleEn) return actionError("English title is required.");
    if (!titleAr) return actionError("Arabic title is required.");
    if (!descriptionEn) return actionError("English description is required.");
    if (!descriptionAr) return actionError("Arabic description is required.");
    if (!amazonUrlEn) return actionError("English Amazon link is required.");
    if (!amazonUrlAr) return actionError("Arabic Amazon link is required.");
    if (!isValidHttpUrl(amazonUrlEn)) return actionError("English Amazon link must be a valid URL.");
    if (!isValidHttpUrl(amazonUrlAr)) return actionError("Arabic Amazon link must be a valid URL.");

  const imagesEnFiles = formData.getAll("imagesEn").filter((f): f is File => f instanceof File && f.size > 0);
    const imagesArFiles = formData.getAll("imagesAr").filter((f): f is File => f instanceof File && f.size > 0);
    if (imagesEnFiles.length > MAX_IMAGES) return actionError(`You can upload at most ${MAX_IMAGES} English images.`);
    if (imagesArFiles.length > MAX_IMAGES) return actionError(`You can upload at most ${MAX_IMAGES} Arabic images.`);

  try {
        const supabase = await createSupabaseServerClient();

      const imageUrlsEn: string[] = [];
        for (const img of imagesEnFiles) {
                imageUrlsEn.push(await uploadMediaFile(supabase, "books", img));
        }
        const imageUrlsAr: string[] = [];
        for (const img of imagesArFiles) {
                imageUrlsAr.push(await uploadMediaFile(supabase, "books", img));
        }

      const { count } = await supabase.from("books").select("id", { count: "exact", head: true });
        const { error } = await supabase.from("books").insert({
                title_en: titleEn,
                title_ar: titleAr,
                description_en: descriptionEn,
                description_ar: descriptionAr,
                amazon_url_en: amazonUrlEn,
                amazon_url_ar: amazonUrlAr,
                image_urls_en: imageUrlsEn,
                image_urls_ar: imageUrlsAr,
                display_order: count ?? 0,
        });
        if (error) throw error;
  } catch (err) {
        console.error("createBook failed", err);
        return actionError("Could not save the book. Please try again.");
  }

  revalidateBooks(locale);
    return actionSuccess();
}

export async function toggleBookActive(
    locale: AppLocale,
    bookId: string,
    isActive: boolean
  ): Promise<ActionResult<void>> {
    await requireFounder(locale);

  try {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.from("books").update({ is_active: isActive }).eq("id", bookId);
        if (error) throw error;
  } catch (err) {
        console.error("toggleBookActive failed", err);
        return actionError("Could not update the book. Please try again.");
  }

  revalidateBooks(locale);
    return actionSuccess();
}

export async function deleteBook(locale: AppLocale, bookId: string): Promise<ActionResult<void>> {
    await requireFounder(locale);

  try {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.from("books").delete().eq("id", bookId);
        if (error) throw error;
  } catch (err) {
        console.error("deleteBook failed", err);
        return actionError("Could not delete the book. Please try again.");
  }

  revalidateBooks(locale);
    return actionSuccess();
}
