import { siteUrl } from "@/lib/seo/site";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Shared by every server action that calls `supabase.auth.signUp()`
 * (registerUser in auth.ts, registerAndClaimChallenge in
 * challenge.ts). A raw Supabase Auth error is not always safe to
 * show a visitor as-is: in production this was observed to sometimes
 * come back as the literal 2-character string "{}" (the SDK falling
 * back to a stringified, unparseable error body — seen in practice
 * when the project's signUp call fails to send the confirmation
 * email, which surfaces as a malformed AuthApiError rather than a
 * normal "email rate limit exceeded" message). Rather than trusting
 * `error.message` unconditionally, anything empty, whitespace-only,
 * or that looks like raw JSON is replaced with a generic,
 * human-readable fallback so no completion or registration screen
 * ever renders a bare "{}"/"[object Object]" to the visitor
 * (production bug found and fixed 2026-07-28/29 during the
 * authentication recovery pass).
 */
export function safeAuthErrorMessage(message: string | undefined, fallback: string): string {
  const trimmed = message?.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return fallback;
  return trimmed;
}

/**
 * Every signUp() call site must send the visitor to the same
 * locale-aware confirmation destination. Before this helper existed,
 * `registerUser` set `emailRedirectTo` explicitly but
 * `registerAndClaimChallenge` (the Phishing Hunter inline flow) did
 * not set it at all, so an inline-registered visitor could be bounced
 * to a default/incorrect locale or environment after confirming their
 * email. Centralizing this in one place means every current and
 * future signUp() call site is consistent by construction rather than
 * by convention.
 */
export function buildEmailRedirectTo(locale: AppLocale): string {
  return `${siteUrl}/${locale}/login`;
}
