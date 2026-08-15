import "server-only";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";

/**
 * Founder Accounts admin (CyberAbeer Platform Phase II). The source
 * of truth for "who has an account" is Supabase Auth (auth.users),
 * not the `profiles` table -- a row lands in auth.users the moment
 * someone registers, whether or not they ever finish a profile. The
 * Auth Admin API (auth.admin.listUsers()) is the only way to read
 * that table, and it requires the service-role client since RLS
 * does not apply to auth.users at all. Results are joined to
 * `profiles` for the display name, locale, and platform_role that
 * the rest of the founder dashboard already shows.
 */

export interface FounderAccountRow {
  id: string;
  email: string;
  fullName: string | null;
  platformRole: string | null;
  locale: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  locale: string | null;
  platform_role: string | null;
}

export async function getAccountsForFounder(): Promise<FounderAccountRow[]> {
  try {
    const admin = createSupabaseServiceRoleClient();

    const users: {
      id: string;
      email: string | undefined;
      created_at: string;
      last_sign_in_at: string | null;
      email_confirmed_at: string | null;
    }[] = [];

    let page = 1;
    const perPage = 1000;
    // Auth Admin API paginates; loop until a short page tells us
    // we've read everyone (in practice this is one iteration for the
    // foreseeable future, but it stays correct past 1000 accounts).
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      users.push(
        ...data.users.map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          email_confirmed_at: u.email_confirmed_at ?? null,
        }))
      );
      if (data.users.length < perPage) break;
      page += 1;
    }

    const supabase = await createSupabaseServerClient();
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, locale, platform_role");
    if (profilesError) throw profilesError;

    const profileById = new Map<string, ProfileRow>(
      ((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p])
    );

    return users
      .map((u) => {
        const profile = profileById.get(u.id);
        return {
          id: u.id,
          email: u.email ?? "(no email)",
          fullName: profile?.full_name ?? null,
          platformRole: profile?.platform_role ?? null,
          locale: profile?.locale ?? null,
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at,
          emailConfirmed: Boolean(u.email_confirmed_at),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("getAccountsForFounder failed, returning empty list", err);
    return [];
  }
}
