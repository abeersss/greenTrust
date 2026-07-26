import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Every public form (newsletter, contact, enterprise enquiry, tool
 * submission with an email) resolves to a `contacts` row keyed by
 * email before writing its own table, per the Phase 3 data model:
 * `contacts` is the pre-account identity, and `user_id` gets
 * backfilled later if the same email registers. Upserting here means
 * a visitor who signs up for the newsletter and later submits the
 * contact form is recognized as the same person rather than creating
 * a duplicate row per form.
 */
export async function upsertContactByEmail(
  supabase: SupabaseClient,
  params: { email: string; locale: "en" | "ar"; firstName?: string; lastName?: string; company?: string }
): Promise<string> {
  const { email, locale, firstName, lastName, company } = params;

  const { data: existing, error: selectError } = await supabase
    .from("contacts")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing.id as string;

  const { data: created, error: insertError } = await supabase
    .from("contacts")
    .insert({
      email,
      locale,
      first_name: firstName ?? null,
      last_name: lastName ?? null,
      company: company ?? null,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return created.id as string;
}

/** Splits a single "Full Name" form field into first/last for storage. */
export function splitFullName(fullName: string): { firstName: string; lastName?: string } {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed };
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1),
  };
}
