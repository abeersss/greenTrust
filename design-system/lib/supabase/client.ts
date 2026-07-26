"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseAnonKey } from "./env";

/**
 * Browser Supabase client, for Client Components that need auth state
 * directly (e.g. reacting to sign-out). Public forms on the marketing
 * site submit through Server Actions instead of this client, so their
 * inserts are validated server-side rather than trusting the browser.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
