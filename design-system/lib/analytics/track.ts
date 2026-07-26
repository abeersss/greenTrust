"use client";

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

/**
 * Fires a Plausible custom event, per the Phase 2 analytics decision.
 * A no-op if the Plausible script hasn't loaded (analytics domain not
 * configured, ad blocker, or the script hasn't finished loading yet),
 * so callers never need to guard this themselves.
 *
 * Canonical event list (Phase 8): "page_view" (fired on every route
 * change by components/analytics/route-page-view.tsx),
 * "language_selected" (components/site/locale-switcher.tsx),
 * "newsletter_subscribed" (components/forms/newsletter-form.tsx),
 * "contact_submit", "tool_start", "register_submit", "login_submit".
 *
 * First Defender challenge funnel: "challenge_viewed",
 * "challenge_started", "challenge_step_completed", "hint_used",
 * "challenge_completed", "registration_started",
 * "registration_completed", "badge_earned", "challenge_result_shared",
 * plus the non-required but useful "challenge_hotspot_inspected".
 * Fired from app/[locale]/challenge/first-defender/page.tsx,
 * components/challenge/first-defender-challenge.tsx,
 * components/challenge/challenge-completion-screen.tsx, and
 * components/challenge/inline-register-form.tsx.
 *
 * GreenTrust Free Assessment funnel: "greentrust_viewed",
 * "assessment_started", "assessment_completed",
 * "greentrust_lead_created", "enterprise_enquiry_submitted", plus
 * "registration_started"/"registration_completed" shared with the
 * challenge funnel (props disambiguate via `source`). Fired from
 * app/[locale]/free-tools/ai-governance-quick-check/page.tsx,
 * components/greentrust/free-assessment.tsx,
 * components/greentrust/free-assessment-results.tsx,
 * components/greentrust/greentrust-inline-register-form.tsx, and
 * components/forms/enterprise-enquiry-form.tsx. The older, generic
 * components/free-tools/quick-assessment.tsx (shared by the Quantum
 * Readiness tool) keeps its own "assessment_started" /
 * "assessment_question_completed" / "lead_created" names, since it is
 * a separate, still-generic tool rather than this dedicated engine.
 */
export function trackEvent(event: string, props?: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined" || !window.plausible) return;
  window.plausible(event, props ? { props } : undefined);
}
