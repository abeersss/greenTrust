import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Public Tool Resources data access (CyberAbeer Platform, migration
 * 030). Replaces the hardcoded "Downloads" array that used to live in
 * free-tools/page.tsx -- the founder now manages name, description,
 * up to 4 gallery images, and an optional downloadable file (PDF/
 * xlsx/zip) from /founder/tool-resources. RLS reads only is_active
 * rows server-side; this is the typed, locale-aware accessor the
 * public /free-tools page calls.
 */
export interface ToolResource {
  id: string;
  name: string;
  description: string;
  fileUrl: string | null;
  fileName: string | null;
  imageUrls: string[];
}

export async function getPublishedToolResources(locale: AppLocale): Promise<ToolResource[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tool_resources")
      .select("id, name_en, name_ar, description_en, description_ar, file_url, file_name, image_urls")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    const isAr = locale === "ar";
    return (data ?? []).map((row) => ({
      id: row.id as string,
      name: (isAr ? row.name_ar : row.name_en) as string,
      description: (isAr ? row.description_ar : row.description_en) as string,
      fileUrl: (row.file_url as string | null) ?? null,
      fileName: (row.file_name as string | null) ?? null,
      imageUrls: (row.image_urls as string[] | null) ?? [],
    }));
  } catch (err) {
    console.error("getPublishedToolResources failed", err);
    return [];
  }
}


  export async function getToolResourceById(locale: AppLocale, id: string): Promise<ToolResource | null> {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
      .from("tool_resources")
      .select("id, name_en, name_ar, description_en, description_ar, file_url, file_name, image_urls")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
      if (!data) return null;

    const isAr = locale === "ar";
      return {
        id: data.id as string,
        name: (isAr ? data.name_ar : data.name_en) as string,
        description: (isAr ? data.description_ar : data.description_en) as string,
        fileUrl: (data.file_url as string | null) ?? null,
        fileName: (data.file_name as string | null) ?? null,
        imageUrls: (data.image_urls as string[] | null) ?? [],
      };
    } catch (err) {
      console.error("getToolResourceById failed", err);
      return null;
    }
  }
