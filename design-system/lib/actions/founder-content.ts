"use server";

import { revalidatePath } from "next/cache";
import { requireFounder } from "@/lib/auth/founder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";
import { actionError, actionSuccess, type ActionResult } from "./types";

const ALLOWED_STATUSES = ["draft", "in_review", "published", "archived"] as const;
type ArticleStatus = (typeof ALLOWED_STATUSES)[number];

/**
 * Founder-only content status change (CyberAbeer Platform Phase II,
 * Batch 1: Content admin). Gated twice: `requireFounder` redirects a
 * non-admin session away before this ever runs, and the underlying
 * `articles_admin_write` RLS policy (database/migrations/007_rls_
 * policies.sql) independently refuses the write at the database layer
 * even if this server action were somehow called directly. Uses the
 * regular cookie-bound client (not service-role) so the write is
 * attributed to, and gated by, the founder's own authenticated session.
 */
export async function setArticleStatus(
  locale: AppLocale,
  articleId: string,
  status: ArticleStatus
): Promise<ActionResult> {
  await requireFounder(locale);

  if (!ALLOWED_STATUSES.includes(status)) {
    return actionError("Invalid status");
  }

  try {
    const supabase = await createSupabaseServerClient();
    const patch: { status: ArticleStatus; published_at?: string | null } = { status };
    if (status === "published") {
      patch.published_at = new Date().toISOString();
    }

    const { error } = await supabase.from("articles").update(patch).eq("id", articleId);
    if (error) throw error;

    revalidatePath(`/${locale}/founder/content`);
    revalidatePath(`/${locale}/insights`);
    revalidatePath(`/${locale}/intelligence`);
    revalidatePath(`/${locale}/learn`);
    return actionSuccess();
  } catch (err) {
    console.error("setArticleStatus failed", err);
    return actionError("Could not update article status. Please try again.");
  }
}
