"use server";

import { contactSchema, type ContactInput } from "@/lib/validation/schemas";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { upsertContactByEmail, splitFullName } from "./contacts";
import { actionError, actionSuccess, type ActionResult } from "./types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

/**
 * General contact form (Contact page). Writes a `leads` row (so the
 * submission shows up in the same funnel as free-tool usage) and a
 * `contact_messages` row (so the free-text message itself is stored
 * somewhere, since `leads` is metadata-only by design in the Phase 3
 * model).
 */
export async function submitContactForm(input: ContactInput, pagePath: string): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }
  if (parsed.data.website) return actionSuccess();

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`contact:${ip}`);
  if (!rateLimit.success) {
    return actionError("Too many attempts. Please try again in a minute.");
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { firstName, lastName } = splitFullName(parsed.data.name);
    const contactId = await upsertContactByEmail(supabase, {
      email: parsed.data.email,
      locale: parsed.data.locale,
      firstName,
      lastName,
      company: parsed.data.organization || undefined,
    });

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        contact_id: contactId,
        page_path: pagePath,
        locale: parsed.data.locale,
        segment: "general_contact",
        consent_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (leadError) throw leadError;

    const { error: messageError } = await supabase.from("contact_messages").insert({
      contact_id: contactId,
      page_path: pagePath,
      locale: parsed.data.locale,
      message: parsed.data.message,
    });
    if (messageError) throw messageError;

    void lead; // kept for potential future assessment_leads-style linking
    return actionSuccess();
  } catch (err) {
    console.error("submitContactForm failed", err);
    return actionError("We could not send your message. Please try again.");
  }
}
