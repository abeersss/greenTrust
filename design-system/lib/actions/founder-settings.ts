"use server";

import { revalidatePath } from "next/cache";
import { requireFounder } from "@/lib/auth/founder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";
import { actionError, actionSuccess, type ActionResult } from "./types";

/**
 * Founder update for their own display name (CyberAbeer Platform
 * Phase II, Batch 4 Settings). Writes profiles.full_name, the same
 * column lib/actions/certificate.ts reads when generating a
 * certificate and components/founder-badge use for shares -- RLS
 * restricts the update to the row's own owner, requireFounder()
 * mirrors that at the application layer first, same pattern as
 * founder-banner.ts.
 */
export async function updateFounderDisplayName(
  locale: AppLocale,
  formData: FormData
): Promise<ActionResult<void>> {
  const { userId } = await requireFounder(locale);

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) {
    return actionError("Display name is required.");
  }
  if (fullName.length > 120) {
    return actionError("Display name is too long.");
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
    if (error) throw error;
  } catch (err) {
    console.error("updateFounderDisplayName failed", err);
    return actionError("Could not save your display name. Please try again.");
  }

  revalidatePath(`/${locale}/founder/settings`);
  return actionSuccess();
}
