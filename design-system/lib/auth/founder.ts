import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder-only route gate (CyberAbeer Platform Phase II, Phase 1:
 * Founder Dashboard). Mirrors the RLS-level is_platform_admin() check
 * (database/migrations/007_rls_policies.sql) at the application
 * layer: every /founder page calls this first, and it redirects away
 * anyone who isn't signed in as the account with
 * profiles.platform_role = 'admin', before any founder-only data is
 * ever queried. There is currently exactly one such account
 * (Dr. Abeer's own), but the check is role-based rather than
 * hardcoded to one user id so it keeps working if that ever changes.
 */
export async function requireFounder(locale: AppLocale): Promise<{ userId: string }> {
    const supabase = await createSupabaseServerClient();
    const {
          data: { user },
    } = await supabase.auth.getUser();

  if (!user) {
        redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
      .from("profiles")
      .select("platform_role")
      .eq("id", user.id)
      .maybeSingle();

  if (profile?.platform_role !== "admin") {
        redirect(`/${locale}`);
  }

  return { userId: user.id };
}
