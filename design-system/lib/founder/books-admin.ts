import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Founder Books admin read (CyberAbeer Platform Phase II). Lists
 * every book row, active or not, with both the English and Arabic
 * edition fields (migration 032) so the admin table can show what's
 * filled in for each language at a glance -- RLS's admin-all policy
 * (migration 029) allows this for her own session.
 */
export interface FounderBookRow {
    id: string;
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    amazonUrlEn: string;
    amazonUrlAr: string;
    imageUrlsEn: string[];
    imageUrlsAr: string[];
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
}

export async function getBooksForFounder(): Promise<FounderBookRow[]> {
    try {
          const supabase = await createSupabaseServerClient();
          const { data, error } = await supabase
            .from("books")
            .select(
                      "id, title_en, title_ar, description_en, description_ar, amazon_url_en, amazon_url_ar, image_urls_en, image_urls_ar, display_order, is_active, created_at"
                    )
            .order("display_order", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((row) => ({
              id: row.id as string,
              titleEn: row.title_en as string,
              titleAr: row.title_ar as string,
              descriptionEn: row.description_en as string,
              descriptionAr: row.description_ar as string,
              amazonUrlEn: row.amazon_url_en as string,
              amazonUrlAr: row.amazon_url_ar as string,
              imageUrlsEn: (row.image_urls_en as string[] | null) ?? [],
              imageUrlsAr: (row.image_urls_ar as string[] | null) ?? [],
              displayOrder: row.display_order as number,
              isActive: row.is_active as boolean,
              createdAt: row.created_at as string,
      }));
    } catch (err) {
          console.error("getBooksForFounder failed", err);
          return [];
    }
}
