import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Public Research page reads (CyberAbeer Platform Phase II, migration
 * 031). Replaces the old next-intl-only intro paragraph and the
 * static lib/research/publications.ts constant -- the founder can now
 * edit the intro, research areas, and publications from
 * /founder/research without a code deploy. RLS's public-read policies
 * (is_active = true for the two lists, unconditional for the settings
 * singleton) do the filtering; getResearchIntro() returns null on any
 * read failure so the page can fall back to the last-known static
 * translation string rather than rendering an empty intro.
 */
export async function getResearchIntro(locale: AppLocale): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("research_settings")
      .select("intro_en, intro_ar")
      .eq("id", 1)
      .maybeSingle();
    if (!data) return null;
    return (locale === "ar" ? data.intro_ar : data.intro_en) as string;
  } catch (err) {
    console.error("getResearchIntro failed", err);
    return null;
  }
}

export interface ResearchArea {
  id: string;
  text: string;
}

export async function getResearchAreas(locale: AppLocale): Promise<ResearchArea[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("research_areas")
      .select("id, text_en, text_ar")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id as string,
      text: (locale === "ar" ? row.text_ar : row.text_en) as string,
    }));
  } catch (err) {
    console.error("getResearchAreas failed", err);
    return [];
  }
}

export interface ResearchPublication {
  id: string;
  title: string;
  venue: string;
  year: string;
  doiUrl: string;
}

export async function getResearchPublications(): Promise<ResearchPublication[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("research_publications")
      .select("id, title, venue, year, doi_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      venue: row.venue as string,
      year: row.year as string,
      doiUrl: row.doi_url as string,
    }));
  } catch (err) {
    console.error("getResearchPublications failed", err);
    return [];
  }
}
