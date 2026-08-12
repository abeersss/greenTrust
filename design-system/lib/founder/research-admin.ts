import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Founder Research admin reads (CyberAbeer Platform Phase II,
 * migration 031). Lists every area/publication row, active or not, so
 * the founder can see hidden ones before they go public -- RLS's
 * admin-all policy allows this for her own session, same split as
 * getBooksForFounder().
 */
export interface FounderResearchAreaRow {
  id: string;
  textEn: string;
  textAr: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FounderResearchPublicationRow {
  id: string;
  title: string;
  venue: string;
  year: string;
  doiUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export async function getResearchAreasForFounder(): Promise<FounderResearchAreaRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("research_areas")
      .select("id, text_en, text_ar, display_order, is_active")
      .order("display_order", { ascending: true });
    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id as string,
      textEn: row.text_en as string,
      textAr: row.text_ar as string,
      displayOrder: row.display_order as number,
      isActive: row.is_active as boolean,
    }));
  } catch (err) {
    console.error("getResearchAreasForFounder failed", err);
    return [];
  }
}

export async function getResearchPublicationsForFounder(): Promise<FounderResearchPublicationRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("research_publications")
      .select("id, title, venue, year, doi_url, display_order, is_active")
      .order("display_order", { ascending: true });
    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      venue: row.venue as string,
      year: row.year as string,
      doiUrl: row.doi_url as string,
      displayOrder: row.display_order as number,
      isActive: row.is_active as boolean,
    }));
  } catch (err) {
    console.error("getResearchPublicationsForFounder failed", err);
    return [];
  }
}
