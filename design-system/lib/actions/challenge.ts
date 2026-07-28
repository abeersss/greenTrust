"use server";

import { z } from "zod";
import { createSupabaseServiceRoleClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { splitFullName } from "./contacts";
import { registerSchema } from "@/lib/validation/schemas";
import { actionError, actionSuccess, type ActionResult } from "./types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { CHALLENGE_KEYS, CHALLENGE_BADGE_KEYS, type ChallengeKey } from "@/lib/challenges/keys";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";
import type { SupabaseClient } from "@supabase/supabase-js";

const saveProgressSchema = z.object({
  anonId: z.string().uuid(),
  challengeKey: z.enum(CHALLENGE_KEYS),
  status: z.enum(["in_progress", "completed"]),
  currentStep: z.number().int().min(0).max(50),
  score: z.number().int().min(0).max(100),
  xpEarned: z.number().int().min(0).max(500),
  hintsUsed: z.number().int().min(0).max(20),
  stepsState: z.record(z.any()),
  locale: z.enum(["en", "ar"]),
});
export type SaveProgressInput = z.infer<typeof saveProgressSchema>;

/**
 * Durable, best-effort backup of an anonymous run. The primary source
 * of truth while playing is localStorage (lib/challenges/anon-session.ts);
 * this upsert exists so a completed-but-unregistered result survives a
 * cleared browser, and so "challenge started/completed" has a
 * server-side row for basic reporting. Never requires an account, and
 * never blocks play if it fails: the caller ignores a failed save here
 * rather than surfacing an error, since local progress is still intact.
 *
 * onConflict is the composite (anon_id, challenge_key) unique
 * constraint, not anon_id alone: a single visitor plays multiple labs
 * from the same anon_id, so a single-column conflict target would
 * either overwrite one lab's progress with another's or throw on every
 * save once more than one challenge exists (production bug fixed
 * 2026-07-27).
 */
export async function saveAnonymousChallengeProgress(input: SaveProgressInput): Promise<ActionResult> {
  const parsed = saveProgressSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`challenge-progress:${ip}`);
  if (!rateLimit.success) {
    return actionError("Too many attempts. Please try again in a minute.");
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase.from("anonymous_challenge_sessions").upsert(
      {
        anon_id: parsed.data.anonId,
        challenge_key: parsed.data.challengeKey,
        status: parsed.data.status,
        current_step: parsed.data.currentStep,
        score: parsed.data.score,
        xp_earned: parsed.data.xpEarned,
        hints_used: parsed.data.hintsUsed,
        steps_state: parsed.data.stepsState,
        locale: parsed.data.locale,
        completed_at: parsed.data.status === "completed" ? new Date().toISOString() : null,
      },
      { onConflict: "anon_id,challenge_key" }
    );
    if (error) throw error;
    return actionSuccess();
  } catch (err) {
    console.error("saveAnonymousChallengeProgress failed", err);
    return actionError("Could not sync progress, but your local progress is safe.");
  }
}

/**
 * Shared by registerAndClaimChallenge and claimChallengeForCurrentUser
 * below. Trusts `userId` because every caller derives it from either a
 * just-completed `supabase.auth.signUp` response or an authenticated
 * `supabase.auth.getUser()` call, never from client-supplied input, so
 * there is no path for a visitor to claim a result onto an account
 * that is not their own. Idempotent: if `anon_id` is already claimed,
 * this is a no-op success rather than an error, so a retried request
 * can never double-award XP or the badge.
 *
 * The badge to award is looked up per challengeKey via
 * CHALLENGE_BADGE_KEYS rather than a single hardcoded badge key, so
 * completing Network Guardian (or any future lab) correctly awards
 * that lab's own badge instead of always awarding First Defender's.
 */
async function claimForUser(
  admin: SupabaseClient,
  userId: string,
  anonId: string,
  challengeKey: ChallengeKey
): Promise<{ xpAwarded: number; badgeAwarded: boolean }> {
  const { data: session, error: sessionError } = await admin
    .from("anonymous_challenge_sessions")
    .select("id, status, score, xp_earned, claimed_by")
    .eq("anon_id", anonId)
    .eq("challenge_key", challengeKey)
    .maybeSingle();
  if (sessionError) throw sessionError;
  if (!session || session.status !== "completed" || session.claimed_by) {
    return { xpAwarded: 0, badgeAwarded: false };
  }

  const { data: challenge, error: challengeError } = await admin
    .from("challenges")
    .select("id")
    .eq("key", challengeKey)
    .single();
  if (challengeError) throw challengeError;

  const { data: badge, error: badgeError } = await admin
    .from("badges")
    .select("id, xp_bonus")
    .eq("key", CHALLENGE_BADGE_KEYS[challengeKey])
    .single();
  if (badgeError) throw badgeError;

  const { error: attemptError } = await admin.from("attempts").insert({
    user_id: userId,
    challenge_id: challenge.id,
    status: "completed",
    score: session.score,
    completed_at: new Date().toISOString(),
  });
  if (attemptError) throw attemptError;

  const { error: xpError } = await admin.from("xp_events").insert({
    user_id: userId,
    event_type: "challenge_completed",
    points: session.xp_earned,
    related_entity_type: "challenge",
    related_entity_id: challenge.id,
  });
  if (xpError) throw xpError;

  const { data: badgeInsertData, error: badgeInsertError } = await admin
    .from("user_badges")
    .upsert({ user_id: userId, badge_id: badge.id }, { onConflict: "user_id,badge_id", ignoreDuplicates: true })
    .select("id");
  if (badgeInsertError) throw badgeInsertError;

  const badgeNewlyAwarded = (badgeInsertData?.length ?? 0) > 0;
  if (badgeNewlyAwarded && badge.xp_bonus > 0) {
    const { error: bonusError } = await admin.from("xp_events").insert({
      user_id: userId,
      event_type: "badge_awarded",
      points: badge.xp_bonus,
      related_entity_type: "badge",
      related_entity_id: badge.id,
    });
    if (bonusError) throw bonusError;
  }

  const { error: claimError } = await admin
    .from("anonymous_challenge_sessions")
    .update({ claimed_by: userId, claimed_at: new Date().toISOString() })
    .eq("id", session.id);
  if (claimError) throw claimError;

  return {
    xpAwarded: session.xp_earned + (badgeNewlyAwarded ? badge.xp_bonus : 0),
    badgeAwarded: badgeNewlyAwarded,
  };
}

const registerAndClaimSchema = registerSchema.and(
  z.object({
    anonId: z.string().uuid(),
    challengeKey: z.enum(CHALLENGE_KEYS),
  })
);
export type RegisterAndClaimInput = z.infer<typeof registerAndClaimSchema>;

export interface RegisterAndClaimData {
  xpAwarded: number;
  badgeAwarded: boolean;
}

/**
 * A raw Supabase Auth error message is not always safe to show a
 * visitor as-is. In production this was observed to sometimes come
 * back as the literal 2-character string "{}" (the SDK falling back
 * to a stringified, unparseable error body — seen in practice when
 * the project's outbound-email rate limit for the built-in auth email
 * sender is exhausted, which surfaces as a malformed AuthApiError
 * rather than a normal "email rate limit exceeded" message). Rather
 * than trusting `error.message` unconditionally, anything empty,
 * whitespace-only, or that looks like raw JSON is replaced with a
 * generic, human-readable fallback so the completion screen never
 * renders a bare "{}" to the visitor (production bug found and fixed
 * 2026-07-28 during Phishing Hunter QA).
 */
function safeAuthErrorMessage(message: string | undefined, fallback: string): string {
  const trimmed = message?.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return fallback;
  return trimmed;
}

/**
 * The inline registration path used only from the challenge completion
 * screen (components/challenge/inline-register-form.tsx), never from
 * the general /register page. It is deliberately a full copy of
 * registerUser's account-creation steps rather than a thin wrapper
 * around it, because the claim step needs the trusted
 * `signUpData.user.id` from the same signUp call: this project's
 * Supabase project requires email confirmation before a session
 * cookie exists (see auth.register.success copy: "check your email to
 * confirm"), so `supabase.auth.getUser()` cannot be relied on
 * immediately after signUp to identify who to credit.
 *
 * Do not destroy progress during registration: this action never
 * touches localStorage, and the caller only clears the local copy
 * after this action reports success, so a failed or interrupted
 * registration always leaves the visitor able to try again or keep
 * playing as a guest.
 */
export async function registerAndClaimChallenge(
  input: RegisterAndClaimInput
): Promise<ActionResult<RegisterAndClaimData>> {
  const parsed = registerAndClaimSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }
  if (parsed.data.website) return actionSuccess({ xpAwarded: 0, badgeAwarded: false });

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`register:${ip}`);
  if (!rateLimit.success) {
    return actionError("Too many attempts. Please try again in a minute.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
    },
  });

  if (signUpError || !signUpData.user) {
    console.error("registerAndClaimChallenge signUp failed", signUpError);
    return actionError(
      safeAuthErrorMessage(
        signUpError?.message,
        "We could not create your account right now. Please try again in a few minutes."
      )
    );
  }

  try {
    const admin = createSupabaseServiceRoleClient();
    const { firstName, lastName } = splitFullName(parsed.data.name);

    const { error: profileError } = await admin.from("profiles").insert({
      id: signUpData.user.id,
      full_name: `${firstName}${lastName ? " " + lastName : ""}`,
      locale: parsed.data.locale,
    });
    if (profileError) throw profileError;

    if (parsed.data.organization) {
      const slug = parsed.data.organization
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .concat("-", signUpData.user.id.slice(0, 8));

      const { data: org, error: orgError } = await admin
        .from("organizations")
        .insert({
          name: parsed.data.organization,
          slug,
          org_type: "business",
          default_locale: parsed.data.locale,
        })
        .select("id")
        .single();
      if (orgError) throw orgError;

      const { data: role, error: roleError } = await admin
        .from("roles")
        .select("id")
        .eq("key", "org_owner")
        .single();
      if (roleError) throw roleError;

      const { error: memberError } = await admin.from("organization_members").insert({
        organization_id: org.id,
        user_id: signUpData.user.id,
        role_id: role.id,
        status: "active",
        joined_at: new Date().toISOString(),
      });
      if (memberError) throw memberError;
    }

    const claim = await claimForUser(admin, signUpData.user.id, parsed.data.anonId, parsed.data.challengeKey);

    // Best-effort: never fails the request the badge/XP claim already succeeded.
    await sendEmail({ to: parsed.data.email, ...welcomeEmail(parsed.data.locale, parsed.data.name) });

    return actionSuccess(claim);
  } catch (err) {
    // The auth user was created; profile/org/claim setup failed. Same
    // framing as registerUser: never tell the visitor registration
    // failed outright once auth.users already has their account.
    console.error("registerAndClaimChallenge post-signup setup failed", err);
    return actionError(
      "Your account was created, but we could not finish saving your challenge result. Your progress is still on this device; please try again from the completion screen, or contact support."
    );
  }
}

const claimChallengeForCurrentUserSchema = z.object({
  anonId: z.string().uuid(),
  challengeKey: z.enum(CHALLENGE_KEYS),
});

/**
 * QA/production fix (2026-07-26): the challenge completion screen was
 * built anonymous-first and only ever claims a result during a brand
 * new registerAndClaimChallenge signup. A visitor who is already
 * logged in while playing (a real, common case, not just a test
 * artifact) had no code path that attached their finished run to their
 * existing account: the account page kept showing 0 XP and no badges
 * after a completed, scored run. This reuses the same claimForUser
 * helper registerAndClaimChallenge already relies on, so idempotency
 * and RLS-safe service-role writes behave identically; it only adds
 * the missing "I already have an account" branch.
 */
export async function claimChallengeForCurrentUser(
  input: z.infer<typeof claimChallengeForCurrentUserSchema>
): Promise<ActionResult<RegisterAndClaimData>> {
  const parsed = claimChallengeForCurrentUserSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return actionError("You must be logged in to save this result to your account.");
  }

  try {
    const admin = createSupabaseServiceRoleClient();
    const claim = await claimForUser(admin, user.id, parsed.data.anonId, parsed.data.challengeKey);
    return actionSuccess(claim);
  } catch (err) {
    console.error("claimChallengeForCurrentUser failed", err);
    return actionError("We could not save this result to your account. Please try again.");
  }
}
