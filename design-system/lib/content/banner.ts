import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";

export interface HomepageBanner {
  enabled: boolean;
  greeting: string;
}

const FALLBACK: Record<AppLocale, string> = {
  en: "Hello! Welcome to CyberAbeer.",
  ar: "أهلاً بك في سايبر أبير!",
};

/**
 * Public read of the founder-editable homepage banner
 * (database/migrations/013_homepage_banner.sql). RLS allows select to
 * everyone, so this uses the regular cookie-bound server client --
 * safe for anonymous visitors, same pattern as getPublishedArticles()
 * in lib/content/articles.ts. Fails soft to a sane default rather
 * than throwing, since a homepage banner should never break the page.
 */
export async function getHomepageBanner(locale: AppLocale): Promise<HomepageBanner> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("homepage_banner_settings")
      .select("enabled, greeting_en, greeting_ar")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) throw error ?? new Error("no banner row");

    const greeting =
      locale === "ar" ? (data.greeting_ar as string | null) : (data.greeting_en as string | null);

    return {
      enabled: data.enabled as boolean,
      greeting: greeting || FALLBACK[locale],
    };
  } catch (err) {
    console.error("getHomepageBanner failed, using fallback", err);
    return { enabled: true, greeting: FALLBACK[locale] };
  }
}
