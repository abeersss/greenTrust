"use server";

import { z } from "zod";
import {
    greentrustAssessmentSchema,
    registerSchema,
    type GreenTrustAssessmentInput,
} from "@/lib/validation/schemas";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { scoreGreenTrustAssessment, GREENTRUST_FREE_ASSESSMENT_TOOL_KEY } from "@/lib/assessments/greentrust-free";
import type { GreenTrustAssessmentResult } from "@/lib/assessments/greentrust-free";
import { upsertContactByEmail, splitFullName } from "./contacts";
import { actionError, actionSuccess, type ActionResult } from "./types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { sendEmail } from "@/lib/email/send";
import { enterpriseEnquiryConfirmationEmail, greentrustResultEmail, welcomeEmail } from "@/lib/email/templates";
import type { AppLocale } from "@/lib/i18n/config";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface SubmitGreenTrustAssessmentData {
    submissionId: string;
    result: GreenTrustAssessmentResult;
}

/**
 * Single entry point for the whole GreenTrust Free Assessment
 * lifecycle: scoring, initial silent persistence, and the two
 * optional follow-ups ("email me my results", "request an enterprise
 * review"). All three share one action so a second call
 * (`existingSubmissionId` set) updates the same row instead of
 * creating a duplicate — the assessment is completed once; only what
 * happens with that one result changes.
 *
 * The score is always recomputed here from the raw answers
 * (`scoreGreenTrustAssessment`), never accepted from the client, so a
 * tampered request can only affect the caller's own result, never
 * produce a fake score that gets emailed or saved as real.
 */
export async function submitGreenTrustAssessment(
    input: GreenTrustAssessmentInput & { existingSubmissionId?: string }
  ): Promise<ActionResult<SubmitGreenTrustAssessmentData>> {
    const parsed = greentrustAssessmentSchema.safeParse(input);
    if (!parsed.success) {
          return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }
    if (parsed.data.website) {
          // Honeypot tripped: report success-shaped output so a bot can't
      // tell the field is being checked, but never touch the database.
      return actionSuccess({
              submissionId: "",
              result: scoreGreenTrustAssessment(parsed.data.answers),
      });
    }

  const ip = await getClientIp();
    const rateLimit = await checkRateLimit(`greentrust-assessment:${ip}`);
    if (!rateLimit.success) {
          return actionError("Too many attempts. Please try again in a minute.");
    }

  let result: GreenTrustAssessmentResult;
    try {
          result = scoreGreenTrustAssessment(parsed.data.answers);
    } catch {
          return actionError("Invalid assessment answers.");
    }

  const supabaseAuth = await createSupabaseServerClient();
    const {
          data: { user },
    } = await supabaseAuth.auth.getUser();

  const admin = createSupabaseServiceRoleClient();

  try {
        let submissionId = input.existingSubmissionId;

      const resultPayload = {
              domainScores: result.domainScores,
              overallScore: result.overallScore,
              riskClassification: result.riskClassification,
              topRecommendationDomains: result.topRecommendationDomains,
              answers: parsed.data.answers,
      };

      if (submissionId) {
              const { error: updateError } = await admin
                .from("tool_submissions")
                .update({ result: resultPayload, score: result.overallScore })
                .eq("id", submissionId)
                .eq("tool_key", GREENTRUST_FREE_ASSESSMENT_TOOL_KEY);
              if (updateError) throw updateError;
      } else {
              const { data: inserted, error: insertError } = await admin
                .from("tool_submissions")
                .insert({
                            tool_key: GREENTRUST_FREE_ASSESSMENT_TOOL_KEY,
                            user_id: user?.id ?? null,
                            locale: parsed.data.locale,
                            inputs: { answers: parsed.data.answers },
                            result: resultPayload,
                            score: result.overallScore,
                })
                .select("id")
                .single();
              if (insertError) throw insertError;
              submissionId = inserted.id as string;
      }

      if (parsed.data.email) {
              const contactId = await upsertContactByEmail(admin, {
                        email: parsed.data.email,
                        locale: parsed.data.locale,
                        company: parsed.data.organization || undefined,
              });

          const { data: lead, error: leadError } = await admin
                .from("leads")
                .insert({
                            contact_id: contactId,
                            page_path: "/greentrust/assessment",
                            locale: parsed.data.locale,
                            segment: "greentrust_free_assessment",
                            consent_at: new Date().toISOString(),
                })
                .select("id")
                .single();
              if (leadError) throw leadError;

          const { error: linkError } = await admin.from("assessment_leads").insert({
                    lead_id: lead.id,
                    tool_submission_id: submissionId,
          });
              if (linkError) throw linkError;

          // Best-effort: a failed email send never fails the request, since
          // the result is already durably saved and, per the UI copy, "email"
          // is presented as a delivery convenience on top of that save.
          await sendEmail({
                    to: parsed.data.email,
                    ...greentrustResultEmail(parsed.data.locale as AppLocale, result),
          });

          if (parsed.data.requestEnterpriseReview) {
                    const { error: enquiryError } = await admin.from("enterprise_enquiries").insert({
                                contact_id: contactId,
                                organization_name: parsed.data.organization || null,
                                use_case: "greentrust_free_assessment_followup",
                                message:
                                              parsed.data.locale === "ar"
                                    ? `طلب مراجعة مؤسسية بعد إتمام تقييم GreenTrust المجاني (النتيجة: ${result.overallScore}/100).`
                                                : `Enterprise review requested after completing the GreenTrust Free Assessment (score: ${result.overallScore}/100).`,
                    });
                    if (enquiryError) throw enquiryError;

                await sendEmail({
                            to: parsed.data.email,
                            ...enterpriseEnquiryConfirmationEmail(
                                          parsed.data.locale as AppLocale,
                                          parsed.data.organization || parsed.data.email
                                        ),
                });
          }
      }

      return actionSuccess({ submissionId, result });
  } catch (err) {
        console.error("submitGreenTrustAssessment failed", err);
        return actionError("We could not save your assessment result. Please try again.");
  }
}

const claimGreenTrustSchema = registerSchema.and(
    z.object({ submissionId: z.string().uuid() })
  );
export type ClaimGreenTrustAssessmentInput = z.infer<typeof claimGreenTrustSchema>;

/**
 * "Save my assessment" for a visitor who completed the assessment
 * anonymously: creates the account (same signUp-then-service-role-
 * setup steps as registerAndClaimChallenge, duplicated rather than
 * shared for the same reason documented there — the claim step needs
 * the trusted `signUpData.user.id` from this exact signUp call), then
 * re-points the already-saved `tool_submissions` row at the new user.
 * Only claims a row that is still unowned (`user_id is null`), so a
 * replayed request can't reassign someone else's saved result.
 */
export async function registerAndClaimGreenTrustAssessment(
    input: ClaimGreenTrustAssessmentInput
  ): Promise<ActionResult<{ submissionId: string }>> {
    const parsed = claimGreenTrustSchema.safeParse(input);
    if (!parsed.success) {
          return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }
    if (parsed.data.website) return actionError("Invalid input");

  const ip = await getClientIp();
    const rateLimit = await checkRateLimit(`register:${ip}`);
    if (!rateLimit.success) {
          return actionError("Too many attempts. Please try again in a minute.");
    }

  const supabase = await createSupabaseServerClient();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { data: { full_name: parsed.data.name } },
    });

  if (signUpError || !signUpData.user) {
        console.error("registerAndClaimGreenTrustAssessment signUp failed", signUpError);
        return actionError(signUpError?.message ?? "We could not create your account.");
  }

  try {
        const admin: SupabaseClient = createSupabaseServiceRoleClient();
        const { firstName, lastName } = splitFullName(parsed.data.name);

      const { error: profileError } = await admin.from("profiles").insert({
              id: signUpData.user.id,
              full_name: `${firstName}${lastName ? " " + lastName : ""}`,
              locale: parsed.data.locale,
      });
        if (profileError) throw profileError;

      const { error: claimError } = await admin
          .from("tool_submissions")
          .update({ user_id: signUpData.user.id })
          .eq("id", parsed.data.submissionId)
          .eq("tool_key", GREENTRUST_FREE_ASSESSMENT_TOOL_KEY)
          .is("user_id", null);
        if (claimError) throw claimError;

      await sendEmail({ to: parsed.data.email, ...welcomeEmail(parsed.data.locale, parsed.data.name) });

      return actionSuccess({ submissionId: parsed.data.submissionId });
  } catch (err) {
        console.error("registerAndClaimGreenTrustAssessment post-signup setup failed", err);
        return actionError(
                "Your account was created, but we could not finish saving your assessment result. Please contact support."
              );
  }
}
