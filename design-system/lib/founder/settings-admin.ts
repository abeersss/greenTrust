import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Founder Settings admin (CyberAbeer Platform Phase II, Batch 4). This
 * screen is scoped to what genuinely exists: the founder's own account
 * (profiles.full_name is the display name used on certificates and
 * badge shares -- lib/actions/certificate.ts, task #414) and a live
 * read of which optional integrations are actually configured in this
 * environment. There is no site-wide "settings" table beyond the
 * homepage banner, which already has its own dedicated founder page
 * (/founder/banner) -- this page does not duplicate it.
 */

export interface FounderAccountInfo {
  email: string | null;
  fullName: string | null;
  memberSince: string | null;
}

export interface IntegrationStatus {
  name: string;
  configured: boolean;
  detail: string;
}

export interface FounderSettingsOverview {
  account: FounderAccountInfo;
  integrations: IntegrationStatus[];
}

export async function getFounderSettingsOverview(userId: string): Promise<FounderSettingsOverview> {
  let account: FounderAccountInfo = { email: null, fullName: null, memberSince: null };

  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: userData }, { data: profile }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("profiles").select("full_name, created_at").eq("id", userId).maybeSingle(),
    ]);

    account = {
      email: userData?.user?.email ?? null,
      fullName: (profile?.full_name as string | null | undefined) ?? null,
      memberSince: (profile?.created_at as string | null | undefined) ?? null,
    };
  } catch (err) {
    console.error("getFounderSettingsOverview account lookup failed", err);
  }

  // Reading process.env directly here (server-only file, never bundled
  // to the client) mirrors the exact fail-open check lib/email/send.ts
  // already makes before sending -- this just surfaces that same real
  // boolean in the UI instead of only finding out when a send fails.
  const integrations: IntegrationStatus[] = [
    {
      name: "Email delivery (Resend)",
      configured: Boolean(process.env.RESEND_API_KEY),
      detail: process.env.RESEND_API_KEY
        ? "RESEND_API_KEY is set. Newsletter sends and transactional email are live."
        : "RESEND_API_KEY is not set. Newsletter sends and transactional email are skipped (logged, not sent).",
    },
    {
      name: "Database (Supabase)",
      configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      detail: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "Connected."
        : "NEXT_PUBLIC_SUPABASE_URL is not set.",
    },
  ];

  return { account, integrations };
}
