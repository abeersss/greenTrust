"use server";

import { newsletterSchema, type NewsletterInput } from "@/lib/validation/schemas";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { upsertContactByEmail } from "./contacts";
import { actionError, actionSuccess, type ActionResult } from "./types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

/**
 * Newsletter signup (footer, on every page). Writes to
 * `newsletter_subscribers` via `contacts`, matching the Phase 3 model.
 * Uses the service-role client because an anonymous visitor has no
 * authenticated Supabase session and therefore no RLS-granted access
 * of their own to the `contacts`/`newsletter_subscribers` tables.
 */
export async function subscribeToNewsletter(input: NewsletterInput): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }
  if (parsed.data.website) {
    // Honeypot tripped. Report success to the caller so a bot doesn't
    // learn the field is being checked, but write nothing.
    return actionSuccess();
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`newsletter:${ip}`);
  if (!rateLimit.success) {
    return actionError("Too many attempts. Please try again in a minute.");
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const contactId = await upsertContactByEmail(supabase, {
      email: parsed.data.email,
      locale: parsed.data.locale,
    });

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { contact_id: contactId, segment: parsed.data.segment, status: "subscribed" },
        { onConflict: "contact_id,segment" }
      );

    if (error) throw error;
    return actionSuccess();
  } catch (err) {
    console.error("subscribeToNewsletter failed", err);
    return actionError("We could not process your subscription. Please try again.");
  }
}
