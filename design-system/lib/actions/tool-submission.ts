"use server";

import { toolSubmissionSchema, type ToolSubmissionInput } from "@/lib/validation/schemas";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { upsertContactByEmail } from "./contacts";
import { actionError, actionSuccess, type ActionResult } from "./types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

/**
 * Records a Free Tools self-assessment result to `tool_submissions`
 * (Phase 3 LEADS domain). The email is optional: the assessment
 * itself always works anonymously in the browser (see
 * components/free-tools/quick-assessment.tsx), this action only runs
 * when the visitor chooses to email themselves the result, at which
 * point a `leads` + `assessment_leads` row is also written so the
 * submission is linked to a contact.
 */
export async function submitToolResult(input: ToolSubmissionInput, pagePath: string): Promise<ActionResult> {
  const parsed = toolSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`tool:${ip}`);
  if (!rateLimit.success) {
    return actionError("Too many attempts. Please try again in a minute.");
  }

  try {
    const supabase = createSupabaseServiceRoleClient();

    const { data: submission, error: submissionError } = await supabase
      .from("tool_submissions")
      .insert({
        tool_key: parsed.data.toolKey,
        locale: parsed.data.locale,
        inputs: { answers: parsed.data.answers },
        result: { score: parsed.data.score },
        score: parsed.data.score,
      })
      .select("id")
      .single();
    if (submissionError) throw submissionError;

    if (parsed.data.email) {
      const contactId = await upsertContactByEmail(supabase, {
        email: parsed.data.email,
        locale: parsed.data.locale,
      });

      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          contact_id: contactId,
          page_path: pagePath,
          locale: parsed.data.locale,
          segment: parsed.data.toolKey,
          consent_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (leadError) throw leadError;

      const { error: linkError } = await supabase.from("assessment_leads").insert({
        lead_id: lead.id,
        tool_submission_id: submission.id,
      });
      if (linkError) throw linkError;
    }

    return actionSuccess();
  } catch (err) {
    console.error("submitToolResult failed", err);
    return actionError("We could not save your result. Please try again.");
  }
}
