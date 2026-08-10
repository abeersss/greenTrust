import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Founder Tool Resources admin read (CyberAbeer Platform, migration
 * 030). Lists every row, active or not, so the founder can see hidden
 * tools before they go public -- same pattern as
 * lib/founder/books-admin.ts.
 */
export interface FounderToolResourceRow {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  fileUrl: string | null;
  fileName: string | null;
  imageUrls: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export async function getToolResourcesForFounder(): Promise<FounderToolResourceRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tool_resources")
      .select(
        "id, name_en, name_ar, description_en, description_ar, file_url, file_name, image_urls, display_order, is_active, created_at"
      )
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id as string,
      nameEn: row.name_en as string,
      nameAr: row.name_ar as string,
      descriptionEn: row.description_en as string,
      descriptionAr: row.description_ar as string,
      fileUrl: (row.file_url as string | null) ?? null,
      fileName: (row.file_name as string | null) ?? null,
      imageUrls: (row.image_urls as string[] | null) ?? [],
      displayOrder: row.display_order as number,
      isActive: row.is_active as boolean,
      createdAt: row.created_at as string,
    }));
  } catch (err) {
    console.error("getToolResourcesForFounder failed", err);
    return [];
  }
}
