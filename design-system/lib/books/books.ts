import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Public Books data access (CyberAbeer Platform). Reads only active
 * rows -- RLS (migration 029) enforces the same restriction
 * server-side, this is just the typed accessor the public /books page
 * calls. `imageUrls` (migration 030) holds up to 4 founder-uploaded
 * gallery images, shown as a sliding carousel.
 */
export interface Book {
  id: string;
  title: string;
  description: string;
  amazonUrl: string;
  coverImageUrl: string | null;
  imageUrls: string[];
}

export async function getPublishedBooks(): Promise<Book[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("books")
      .select("id, title, description, amazon_url, cover_image_url, image_urls")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      amazonUrl: row.amazon_url as string,
      coverImageUrl: (row.cover_image_url as string | null) ?? null,
      imageUrls: (row.image_urls as string[] | null) ?? [],
    }));
  } catch (err) {
    console.error("getPublishedBooks failed", err);
    return [];
  }
}
