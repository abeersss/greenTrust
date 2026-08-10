"use server";

import { revalidatePath } from "next/cache";
import { requireFounder } from "@/lib/auth/founder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadMediaFile } from "@/lib/storage/upload-media";
import type { AppLocale } from "@/lib/i18n/config";
import { actionError, actionSuccess, type ActionResult } from "./types";

/**
 * Founder CRUD for the books table (CyberAbeer Platform Phase II).
 * Title, description, and the Amazon purchase link stay required;
 * migration 030 added an optional gallery of up to 4 founder-uploaded
 * images, shown as a sliding carousel on the public /books page.
 * RLS's admin-all policy (migration 029) lets the founder's own
 * session write; requireFounder() mirrors that at the application
 * layer first, same pattern as founder-banner.ts and
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

export async function createBook(locale: AppLocale, formData: FormData): Promise<ActionResult<void>> {
  await requireFounder(locale);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const amazonUrl = String(formData.get("amazonUrl") ?? "").trim();

  if (!title) return actionError("Title is required.");
  if (!description) return actionError("Description is required.");
  if (!amazonUrl) return actionError("Amazon link is required.");
  if (!isValidHttpUrl(amazonUrl)) return actionError("Amazon link must be a valid URL.");

  const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (imageFiles.length > MAX_IMAGES) return actionError(`You can upload at most ${MAX_IMAGES} images.`);

  try {
    const supabase = await createSupabaseServerClient();

    const imageUrls: string[] = [];
    for (const img of imageFiles) {
      imageUrls.push(await uploadMediaFile(supabase, "books", img));
    }

    const { count } = await supabase.from("books").select("id", { count: "exact", head: true });
    const { error } = await supabase.from("books").insert({
      title,
      description,
      amazon_url: amazonUrl,
      image_urls: imageUrls,
      display_order: count ?? 0,
    });
    if (error) throw error;
  } catch (err) {
    console.error("createBook failed", err);
    return actionError("Could not save the book. Please try again.");
  }

  revalidatePath(`/${locale}/founder/books`);
  revalidatePath(`/${locale}/books`);
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

  revalidatePath(`/${locale}/founder/books`);
  revalidatePath(`/${locale}/books`);
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

  revalidatePath(`/${locale}/founder/books`);
  revalidatePath(`/${locale}/books`);
  return actionSuccess();
}
