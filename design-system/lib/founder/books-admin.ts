import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Founder Books admin read (CyberAbeer Platform Phase II). Lists
 * every book row, active or not, so the founder can see drafts before
 * they go public -- RLS's admin-all policy (migration 029) allows
 * this for her own session.
 */
export interface FounderBookRow {
  id: string;
  title: string;
  description: string;
  amazonUrl: string;
  coverImageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export async function getBooksForFounder(): Promise<FounderBookRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("books")
      .select("id, title, description, amazon_url, cover_image_url, display_order, is_active, created_at")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      amazonUrl: row.amazon_url as string,
      coverImageUrl: (row.cover_image_url as string | null) ?? null,
      displayOrder: row.display_order as number,
      isActive: row.is_active as boolean,
      createdAt: row.created_at as string,
    }));
  } catch (err) {
    console.error("getBooksForFounder failed", err);
    return [];
  }
}
