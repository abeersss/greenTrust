"use server";

import { enterpriseEnquirySchema, type EnterpriseEnquiryInput } from "@/lib/validation/schemas";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { upsertContactByEmail, splitFullName } from "./contacts";
import { actionError, actionSuccess, type ActionResult } from "./types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { sendEmail } from "@/lib/email/send";
import { enterpriseEnquiryConfirmationEmail } from "@/lib/email/templates";

/**
 * GreenTrust AI "request early access" / enterprise enquiry form.
 * Writes directly to `enterprise_enquiries` (Phase 3 LEADS domain),
 * status defaults to 'new' at the database level so this never needs
 * to set it explicitly.
 */
export async function submitEnterpriseEnquiry(input: EnterpriseEnquiryInput): Promise<ActionResult> {
  const parsed = enterpriseEnquirySchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }
  if (parsed.data.website) return actionSuccess();

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`enterprise:${ip}`);
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
      company: parsed.data.organization,
    });

    // `enterprise_enquiries` has no dedicated company-size column; fold
    // it into the free-text message rather than dropping the field the
    // form collected, so the person reviewing the enquiry still sees it.
    const message = parsed.data.companySize
      ? `Organization size: ${parsed.data.companySize}\n\n${parsed.data.message}`
      : parsed.data.message;

    const { error } = await supabase.from("enterprise_enquiries").insert({
      contact_id: contactId,
      organization_name: parsed.data.organization,
      use_case: parsed.data.interest || null,
      message,
    });
    if (error) throw error;

    // Best-effort: the enquiry is already saved; a failed confirmation
    // email never turns a successful submission into a reported error.
    await sendEmail({
      to: parsed.data.email,
      ...enterpriseEnquiryConfirmationEmail(parsed.data.locale, parsed.data.name),
    });

    return actionSuccess();
  } catch (err) {
    console.error("submitEnterpriseEnquiry failed", err);
    return actionError("We could not send your enquiry. Please try again.");
  }
}
