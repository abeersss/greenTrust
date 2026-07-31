"use server";

import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { orgToolSubmissionSchema, type OrgToolSubmissionInput } from "@/lib/validation/schemas";
import { scoreCyberPosture, type CyberPostureResult } from "@/lib/organizational-tools/cybersecurity-posture";
import { upsertContactByEmail } from "./contacts";
import { actionError, actionSuccess, type ActionResult } from "./types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

export interface SubmitCyberPostureAssessmentData {
  submissionId: string;
  result: CyberPostureResult;
}

/**
 * Cybersecurity Posture Assessment submission. Migrated from the paid
 * "Cybersecurity Posture Assessment Tool" sold on abeergrc.netlify.app
 * ($47, Excel) to a free web tool per the founder's explicit decision
 * to make it free (see lib/organizational-tools/cybersecurity-posture.ts
 * for full provenance notes). Same trust pattern as
 * submitGreenTrustAssessment: the client only ever sends raw answers,
 * never a score -- this action always recomputes the score itself from
 * the raw answers via scoreCyberPosture, so a tampered request can only
 * ever change the caller's own persisted copy, never forge a result
 * that gets shown or saved as real.
 */
export async function submitCyberPostureAssessment(
  input: OrgToolSubmissionInput
): Promise<ActionResult<SubmitCyberPostureAssessmentData>> {
  const parsed = orgToolSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }
  if (parsed.data.toolKey !== "cyber_posture_assessment") {
    return actionError("Invalid input");
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`org-tool-assessment:${ip}`);
  if (!rateLimit.success) {
    return actionError("Too many attempts. Please try again in a minute.");
  }

  let result: CyberPostureResult;
  try {
    result = scoreCyberPosture(parsed.data.answers);
  } catch {
    return actionError("Invalid assessment answers.");
  }

  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  const admin = createSupabaseServiceRoleClient();

  try {
    const { data: inserted, error: insertError } = await admin
      .from("tool_submissions")
      .insert({
        tool_key: "cyber_posture_assessment",
        user_id: user?.id ?? null,
        locale: parsed.data.locale,
        inputs: { answers: parsed.data.answers },
        result,
        score: Math.round(result.overall.percent * 100),
      })
      .select("id")
      .single();
    if (insertError) throw insertError;
    const submissionId = inserted.id as string;

    if (parsed.data.email) {
      await upsertContactByEmail(admin, {
        email: parsed.data.email,
        locale: parsed.data.locale,
      });
    }

    return actionSuccess({ submissionId, result });
  } catch (err) {
    console.error("submitCyberPostureAssessment failed", err);
    return actionError("We could not save your assessment result. Please try again.");
  }
}
