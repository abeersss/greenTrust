"use server";

import { z } from "zod";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { actionError, actionSuccess, type ActionResult } from "./types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { CTF_BADGE_KEYS } from "@/lib/challenges/keys";

/**
 * CTF Completion Certificate (2026-08-03, founder instruction):
 * "having 80% for each CTF and finishing it all the user gets a
 * certificate by his name ... which should show ref or QR to
 * authenticate across cyberabeer.com with my sign Dr. Abeer
 * Alshammari." A certificate is only issuable once a learner holds
 * all six CTF badges (CTF_BADGE_KEYS, lib/challenges/keys.ts), and a
 * badge only exists once claimForUser (lib/actions/challenge.ts) has
 * awarded it -- which itself only happens at score >= BADGE_PASS_SCORE
 * (80). So "all six badges present" is already the strict, server-side
 * "80%+ on every flag" check; there is nothing client-supplied to
 * trust here.
 *
 * The certificate itself lives at /certificate/[referenceCode], a
 * public route (no login required to *view* one): the whole point of
 * a shareable certificate is that anyone with the link or the printed
 * QR code can land on cyberabeer.com and see it confirmed as genuine.
 * Only *issuing* a new certificate requires being logged in as the
 * person who earned it -- verifyCertificate below deliberately returns
 * only the handful of fields safe to show a stranger (name, reference
 * code, issue date), never the owning user_id or any account details.
 */

const CTF_CERTIFICATE_TYPE = "ctf_completion";

export interface CtfCompletionStatus {
  totalChallenges: number;
  completedChallenges: number;
  allComplete: boolean;
  certificateReference: string | null;
  signedIn: boolean;
}

/**
 * Read-only progress check, safe to call from a Server Component on
 * every /labs/ctf page load (no rate limit needed -- it never writes).
 * Returns a "not signed in" shape rather than an error, since an
 * anonymous visitor browsing the CTF hub is the normal case, not a
 * failure.
 */
export async function getCtfCompletionStatus(): Promise<CtfCompletionStatus> {
  const totalChallenges = CTF_BADGE_KEYS.length;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { totalChallenges, completedChallenges: 0, allComplete: false, certificateReference: null, signedIn: false };
  }

  try {
    const admin = createSupabaseServiceRoleClient();
    const { completedChallenges, allComplete } = await countEarnedCtfBadges(admin, user.id);

    let certificateReference: string | null = null;
    if (allComplete) {
      const { data: existing } = await admin
        .from("ctf_certificates")
        .select("reference_code")
        .eq("user_id", user.id)
        .eq("certificate_type", CTF_CERTIFICATE_TYPE)
        .maybeSingle();
      certificateReference = existing?.reference_code ?? null;
    }

    return { totalChallenges, completedChallenges, allComplete, certificateReference, signedIn: true };
  } catch (err) {
    console.error("getCtfCompletionStatus failed", err);
    return { totalChallenges, completedChallenges: 0, allComplete: false, certificateReference: null, signedIn: true };
  }
}

/**
 * Shared by getCtfCompletionStatus and issueCertificate so the "how
 * many of the six flags has this user actually earned" logic -- the
 * one piece that must never drift between the progress display and
 * the server-side gate on issuing a certificate -- lives in exactly
 * one place.
 */
async function countEarnedCtfBadges(
  admin: ReturnType<typeof createSupabaseServiceRoleClient>,
  userId: string
): Promise<{ completedChallenges: number; allComplete: boolean }> {
  const { data: badgeDefs, error: badgeDefErr } = await admin.from("badges").select("id").in("key", CTF_BADGE_KEYS);
  if (badgeDefErr) throw badgeDefErr;

  const badgeIds = (badgeDefs ?? []).map((row) => row.id as string);
  if (badgeIds.length === 0) {
    return { completedChallenges: 0, allComplete: false };
  }

  const { data: earned, error: earnedErr } = await admin
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId)
    .in("badge_id", badgeIds);
  if (earnedErr) throw earnedErr;

  const completedChallenges = new Set((earned ?? []).map((row) => row.badge_id as string)).size;
  return { completedChallenges, allComplete: completedChallenges >= CTF_BADGE_KEYS.length };
}

const issueCertificateSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
});

export interface IssuedCertificate {
  referenceCode: string;
  fullName: string;
  issuedAt: string;
}

export async function issueCertificate(
  input: z.infer<typeof issueCertificateSchema>
): Promise<ActionResult<IssuedCertificate>> {
  const parsed = issueCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Please enter your full name as you'd like it to appear on the certificate.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return actionError("You must be logged in to claim your certificate.");
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`certificate-issue:${ip}`);
  if (!rateLimit.success) {
    return actionError("Too many attempts. Please try again in a minute.");
  }

  try {
    const admin = createSupabaseServiceRoleClient();

    // Re-verify completion server-side; the client's "all six done"
    // banner is a UI convenience, never the source of truth.
    const { allComplete } = await countEarnedCtfBadges(admin, user.id);
    if (!allComplete) {
      return actionError("You need to capture all six CTF flags (80%+ on each) before claiming a certificate.");
    }

    // Idempotent: a learner who already has a certificate gets the
    // existing one back rather than a duplicate, and rather than being
    // able to silently rename it after the fact (which would undercut
    // the verification page's whole purpose).
    const { data: existing, error: existingErr } = await admin
      .from("ctf_certificates")
      .select("reference_code, full_name, issued_at")
      .eq("user_id", user.id)
      .eq("certificate_type", CTF_CERTIFICATE_TYPE)
      .maybeSingle();
    if (existingErr) throw existingErr;
    if (existing) {
      return actionSuccess({
        referenceCode: existing.reference_code as string,
        fullName: existing.full_name as string,
        issuedAt: existing.issued_at as string,
      });
    }

    // 36^8 (~2.8 trillion) possible codes; a handful of retries on the
    // vanishingly unlikely event of a collision against the unique
    // constraint is far simpler than a separate sequence/lookup table.
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const referenceCode = generateReferenceCode();
      const { data: inserted, error: insertErr } = await admin
        .from("ctf_certificates")
        .insert({
          user_id: user.id,
          certificate_type: CTF_CERTIFICATE_TYPE,
          full_name: parsed.data.fullName,
          reference_code: referenceCode,
        })
        .select("reference_code, full_name, issued_at")
        .single();
      if (!insertErr && inserted) {
        return actionSuccess({
          referenceCode: inserted.reference_code as string,
          fullName: inserted.full_name as string,
          issuedAt: inserted.issued_at as string,
        });
      }
      lastError = insertErr;
    }
    throw lastError ?? new Error("Could not generate a unique certificate reference code.");
  } catch (err) {
    console.error("issueCertificate failed", err);
    return actionError("Could not issue your certificate. Please try again.");
  }
}

function generateReferenceCode(): string {
  // e.g. "CA-7F3A9C21" -- an 8-character uppercase hex code derived
  // from crypto.randomUUID(), which is available in the Next.js server
  // runtime with no extra npm dependency (a deliberate choice after
  // this session's build failures: nothing here is worth risking
  // another dependency-related production break over).
  const raw = crypto.randomUUID().replace(/-/g, "").toUpperCase();
  return `CA-${raw.slice(0, 8)}`;
}

export interface CertificateVerification {
  found: boolean;
  fullName: string | null;
  issuedAt: string | null;
  referenceCode: string | null;
}

/**
 * The public verification lookup behind /certificate/[referenceCode].
 * Deliberately returns only display-safe fields -- never the owning
 * user_id, email, or any other account detail -- since this is reached
 * by anyone with the link or the printed QR code, not just the
 * certificate holder.
 */
export async function verifyCertificate(referenceCode: string): Promise<CertificateVerification> {
  const normalized = referenceCode.trim().toUpperCase();
  if (!/^CA-[A-F0-9]{8}$/.test(normalized)) {
    return { found: false, fullName: null, issuedAt: null, referenceCode: null };
  }

  try {
    const admin = createSupabaseServiceRoleClient();
    const { data, error } = await admin
      .from("ctf_certificates")
      .select("full_name, issued_at, reference_code")
      .eq("reference_code", normalized)
      .eq("certificate_type", CTF_CERTIFICATE_TYPE)
      .maybeSingle();
    if (error || !data) {
      return { found: false, fullName: null, issuedAt: null, referenceCode: null };
    }
    return {
      found: true,
      fullName: data.full_name as string,
      issuedAt: data.issued_at as string,
      referenceCode: data.reference_code as string,
    };
  } catch (err) {
    console.error("verifyCertificate failed", err);
    return { found: false, fullName: null, issuedAt: null, referenceCode: null };
  }
}
