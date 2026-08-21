import { siteUrl } from "@/lib/seo/site";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Shared by every server action that calls `supabase.auth.signUp()`
 * (registerUser in auth.ts, registerAndClaimChallenge in
 * challenge.ts). A raw Supabase Auth error is not always safe to
 * show a visitor as-is: in production this was observed to sometimes
 * come back as the literal 2-character string "{}" (the SDK falling
 * back to a stringified, unparseable error body -- seen in practice
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
 * one call site could point at a different page than another, so
 * the link inside the confirmation email would land somewhere that
 * had no code to handle it.
 */
export function buildEmailRedirectTo(locale: AppLocale): string {
    return `${siteUrl}/${locale}/login`;
}

/**
 * Friendly, locale-aware copy for Supabase's own confirmation-email
 * resend cooldown (over_email_send_rate_limit), which fires when the
 * same address requests a confirmation email again too soon. In
 * practice this almost always means the visitor's first attempt
 * already succeeded and the email is already on its way, so this
 * deliberately does not read like a failure. Production bug found
 * 2026-08-21: a user who clicked "Create account" repeatedly saw
 * Supabase's raw "For security purposes, you can only request this
 * after N seconds" message every single time, with no indication
 * anything had changed or any path forward. registerUser (auth.ts)
 * detects this specific Supabase error and calls this instead,
 * passing the wait time back to the caller as `retryAfterSeconds` so
 * the form can disable the submit button and show a live countdown.
 */
export function rateLimitRetryMessage(locale: AppLocale, seconds: number): string {
    if (locale === "ar") {
          return `\u{645}\u{646} \u{627}\u{644}\u{645}\u{631}\u{62c}\u{651}\u{62d} \u{623}\u{646}\u{646}\u{627} \u{623}\u{631}\u{633}\u{644}\u{646}\u{627} \u{644}\u{643} \u{631}\u{633}\u{627}\u{644}\u{629} \u{62a}\u{623}\u{643}\u{64a}\u{62f} \u{628}\u{627}\u{644}\u{641}\u{639}\u{644}. \u{62a}\u{62d}\u{642}\u{642} \u{645}\u{646} \u{628}\u{631}\u{64a}\u{62f}\u{643} \u{627}\u{644}\u{648}\u{627}\u{631}\u{62f} (\u{648}\u{645}\u{62c}\u{644}\u{62f} \u{627}\u{644}\u{631}\u{633}\u{627}\u{626}\u{644} \u{63a}\u{64a}\u{631} \u{627}\u{644}\u{645}\u{631}\u{63a}\u{648}\u{628} \u{641}\u{64a}\u{647}\u{627}). \u{64a}\u{645}\u{643}\u{646}\u{643} \u{637}\u{644}\u{628} \u{631}\u{633}\u{627}\u{644}\u{629} \u{62c}\u{62f}\u{64a}\u{62f}\u{629} \u{62e}\u{644}\u{627}\u{644} ${seconds}\u{20}\u{62b}\u{627}\u{646}\u{64a}\u{629}.`;
    }
    return `We likely already sent a confirmation email to this address. Check your inbox (and spam folder) -- you can request another in ${seconds}s.`;
}
