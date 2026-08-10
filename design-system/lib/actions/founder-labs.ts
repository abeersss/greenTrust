"use server";

import { revalidatePath } from "next/cache";
import { requireFounder } from "@/lib/auth/founder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";
import { actionError, actionSuccess, type ActionResult } from "./types";

const ALLOWED_STATUSES = ["draft", "in_review", "published", "archived"] as const;
type ChallengeStatus = (typeof ALLOWED_STATUSES)[number];

/**
 * Founder-only lab/challenge status change (CyberAbeer Platform Phase
 * II, Batch 1: Labs admin). Same shape as setArticleStatus: gated by
 * requireFounder plus whatever RLS write policy already covers the
 * challenges table, using the regular cookie-bound client so the
 * write is attributed to the founder's own session. If no admin
 * write policy exists yet for challenges, this fails closed -- the
 * update comes back as a Supabase error, which is caught and
 * surfaced as an actionError rather than throwing.
 */
export async function setChallengeStatus(
  locale: AppLocale,
  challengeId: string,
  status: ChallengeStatus
): Promise<ActionResult> {
  await requireFounder(locale);

  if (!ALLOWED_STATUSES.includes(status)) {
    return actionError("Invalid status");
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("challenges")
      .update({ status })
      .eq("id", challengeId);
    if (error) throw error;

    revalidatePath(`/${locale}/founder/labs`);
    revalidatePath(`/${locale}/labs`);
    return actionSuccess();
  } catch (err) {
    console.error("setChallengeStatus failed", err);
    return actionError("Could not update lab status. Please try again.");
  }
}
