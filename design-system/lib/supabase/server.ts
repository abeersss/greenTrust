import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceRoleKey } from "./env";

/**
 * Server Component / Server Action Supabase client. Reads and writes
 * the auth cookie so a logged-in user's session is available in
 * Server Components and Server Actions alike. This is the client
 * every public-site Server Action (newsletter, contact, enterprise
 * enquiry, login, register) should use, since it respects Row Level
 * Security as the calling user, rather than bypassing it.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component render rather than a Server
          // Action or Route Handler. Safe to ignore: middleware
          // refreshes the session cookie on the next navigation.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses Row Level Security entirely, so it is
 * used only for a small, explicit allowlist of trusted server-side
 * operations, for example inserting a lead or newsletter subscriber
 * from an anonymous visitor who by definition has no authenticated
 * session and therefore no RLS-granted access of their own. Never
 * import this from a Client Component or expose the key to the
 * browser.
 */
export function createSupabaseServiceRoleClient() {
  return createSupabaseJsClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { persistSession: false },
  });
}
