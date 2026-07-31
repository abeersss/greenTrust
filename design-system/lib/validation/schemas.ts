import { z } from "zod";

/**
 * Shared field-level rules, so "what counts as a valid email" or
 * "how long can a message be" is defined once and reused across every
 * form schema below, rather than drifting between forms over time.
 */
const email = z.string().trim().min(1).max(254).email();
const name = z.string().trim().min(1).max(200);
const optionalOrg = z.string().trim().max(200).optional().or(z.literal(""));
const shortMessage = z.string().trim().min(1).max(4000);

/**
 * Every public form includes a `website` honeypot field, hidden from
 * real users with CSS but visible to naive bots that fill in every
 * input on a page. A non-empty honeypot means the submission is
 * silently accepted-looking but dropped, rather than told it failed
 * (which would teach the bot to find and skip the field).
 */
const honeypot = z.string().max(0).optional().or(z.literal(""));

/**
 * Matches the `newsletter_subscribers.segment` check constraint in the
 * database exactly (001/002 migrations) so a submission can never be
 * rejected at the database layer after already passing validation here.
 */
export const newsletterSegments = [
  "enterprise_ai_governance",
  "quantum",
  "students",
  "certification",
  "cyber_intelligence_brief",
] as const;

export const newsletterSchema = z.object({
  email,
  segment: z.enum(newsletterSegments),
  locale: z.enum(["en", "ar"]),
  website: honeypot,
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const contactSchema = z.object({
  name,
  email,
  organization: optionalOrg,
  message: shortMessage,
  locale: z.enum(["en", "ar"]),
  website: honeypot,
});
export type ContactInput = z.infer<typeof contactSchema>;

export const enterpriseEnquirySchema = z.object({
  name,
  email,
  organization: z.string().trim().min(1).max(200),
  companySize: z.enum(["1-50", "51-250", "251-1000", "1000+"]).optional(),
  interest: z.string().trim().max(200).optional().or(z.literal("")),
  message: shortMessage,
  locale: z.enum(["en", "ar"]),
  website: honeypot,
});
export type EnterpriseEnquiryInput = z.infer<typeof enterpriseEnquirySchema>;

export const registerSchema = z
  .object({
    name,
    email,
    organization: optionalOrg,
    password: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
    locale: z.enum(["en", "ar"]),
    website: honeypot,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(200),
  locale: z.enum(["en", "ar"]),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email,
  locale: z.enum(["en", "ar"]),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8).max(200),
    confirmPassword: z.string().min(8).max(200),
    locale: z.enum(["en", "ar"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * `toolKey` matches the `tool_submissions.tool_key` check constraint
 * exactly (greentrust_quick_assessment / quantum_quick_assessment).
 */
export const toolSubmissionSchema = z.object({
  toolKey: z.enum(["greentrust_quick_assessment", "quantum_quick_assessment"]),
  answers: z.array(z.number().int().min(0).max(2)).min(1).max(20),
  score: z.number().min(0).max(100),
  email: email.optional().or(z.literal("")),
  locale: z.enum(["en", "ar"]),
});
export type ToolSubmissionInput = z.infer<typeof toolSubmissionSchema>;

/**
 * GreenTrust Free Assessment (Phase 8): 16 raw answers only. The score
 * is never accepted from the client — `submitGreenTrustAssessment`
 * (lib/actions/greentrust-assessment.ts) recomputes it server-side
 * from these answers via `scoreGreenTrustAssessment`, so a tampered
 * client request can change nothing but its own outcome.
 */
export const greentrustAssessmentSchema = z.object({
  answers: z.array(z.number().int().min(0).max(2)).length(16),
  locale: z.enum(["en", "ar"]),
  email: email.optional().or(z.literal("")),
  requestEnterpriseReview: z.boolean().optional(),
  organization: optionalOrg,
  website: honeypot,
});
export type GreenTrustAssessmentInput = z.infer<typeof greentrustAssessmentSchema>;

/**
 * Organizational tool assessments (For Organizations section, migrated
 * from the paid AbeerGRC toolkits). Only raw answers are accepted — the
 * server action always recomputes the score itself, the same pattern as
 * the GreenTrust free assessment above, so a tampered client request
 * can't change anything but its own persisted copy.
 */
export const orgToolSubmissionSchema = z.object({
  toolKey: z.enum(["cyber_posture_assessment", "iso27001_gap_assessment"]),
  answers: z
    .record(z.string(), z.string())
    .refine((a) => Object.keys(a).length > 0, { message: "answersRequired" }),
  email: email.optional().or(z.literal("")),
  locale: z.enum(["en", "ar"]),
});
export type OrgToolSubmissionInput = z.infer<typeof orgToolSubmissionSchema>;
