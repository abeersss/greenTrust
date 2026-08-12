import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Public Books data access (CyberAbeer Platform). Every book has a
 * real English and a real Arabic edition -- separate title,
 * description, Amazon link, and gallery images per migration 032 --
 * so this reads the row once and returns only the fields for the
 * locale the caller asked for. RLS (migration 029) enforces the
 * is_active restriction server-side; this is just the typed,
 * locale-aware accessor the public /books page calls.
 */
export interface Book {
    id: string;
    title: string;
    description: string;
    amazonUrl: string;
    imageUrls: string[];
}

export async function getPublishedBooks(locale: AppLocale): Promise<Book[]> {
    try {
          const supabase = await createSupabaseServerClient();
          const { data, error } = await supabase
            .from("books")
            .select(
                      "id, title_en, title_ar, description_en, description_ar, amazon_url_en, amazon_url_ar, image_urls_en, image_urls_ar"
                    )
            .eq("is_active", true)
            .order("display_order", { ascending: true });

      if (error) throw error;

      const isAr = locale === "ar";
          return (data ?? []).map((row) => ({
                  id: row.id as string,
                  title: (isAr ? row.title_ar : row.title_en) as string,
                  description: (isAr ? row.description_ar : row.description_en) as string,
                  amazonUrl: (isAr ? row.amazon_url_ar : row.amazon_url_en) as string,
                  imageUrls: ((isAr ? row.image_urls_ar : row.image_urls_en) as string[] | null) ?? [],
          }));
    } catch (err) {
          console.error("getPublishedBooks failed", err);
          return [];
    }
}
