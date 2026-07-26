/**
 * Centralized read of the Supabase environment variables so a missing
 * variable fails fast, with a clear message, the first time a client
 * is constructed, rather than as an obscure runtime error deep inside
 * a form submission. No live Supabase project is provisioned in this
 * build environment; these variables must be set in production
 * (Vercel project settings) before the site can read or write data.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in your deployment environment (see .env.example).`
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/** Service-role key. Server-only, never imported from a "use client" file. */
export function getSupabaseServiceRoleKey(): string {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}
