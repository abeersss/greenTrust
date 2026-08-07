"use server";

import { revalidatePath } from "next/cache";
import { requireFounder } from "@/lib/auth/founder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";
import { actionError, actionSuccess, type ActionResult } from "./types";

export interface HomepageBannerSettings {
  enabled: boolean;
  greetingEn: string;
  greetingAr: string;
}

/**
 * Founder read/update for the homepage banner (CyberAbeer Platform
 * Phase II). Writes the single settings row (migration 013); RLS
 * restricts the update to is_platform_admin(), requireFounder()
 * mirrors that at the application layer first -- same pattern as
 * founder-newsletter.ts.
 */
export async function getHomepageBannerForFounder(locale: AppLocale): Promise<HomepageBannerSettings> {
  await requireFounder(locale);
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("homepage_banner_settings")
    .select("enabled, greeting_en, greeting_ar")
    .eq("id", 1)
    .maybeSingle();

  return {
    enabled: (data?.enabled as boolean | undefined) ?? true,
    greetingEn: (data?.greeting_en as string | undefined) ?? "Hello! Welcome to CyberAbeer.",
    greetingAr: (data?.greeting_ar as string | undefined) ?? "أهلاً بك في سايبر أبير!",
  };
}

export async function updateHomepageBanner(
  locale: AppLocale,
  formData: FormData
): Promise<ActionResult<void>> {
  const { userId } = await requireFounder(locale);

  const enabled = formData.get("enabled") === "on";
  const greetingEn = String(formData.get("greetingEn") ?? "").trim();
  const greetingAr = String(formData.get("greetingAr") ?? "").trim();

  if (!greetingEn) {
    return actionError("English greeting is required.");
  }
  if (!greetingAr) {
    return actionError("Arabic greeting is required.");
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("homepage_banner_settings")
      .update({
        enabled,
        greeting_en: greetingEn,
        greeting_ar: greetingAr,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) throw error;

    revalidatePath("/en");
    revalidatePath("/ar");
    revalidatePath(`/${locale}/founder/banner`);

    return actionSuccess();
  } catch (err) {
    console.error("updateHomepageBanner failed", err);
    return actionError("Could not save the banner. Please try again.");
  }
}
