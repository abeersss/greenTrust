"use server";

import { z } from "zod";
import { createSupabaseServiceRoleClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { splitFullName } from "./contacts";
import { registerSchema } from "@/lib/validation/schemas";
import { actionError, actionSuccess, type ActionResult } from "./types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { FIRST_DEFENDER_CHALLENGE_KEY, FIRST_DEFENDER_BADGE_KEY } from "@/lib/challenges/first-defender";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";
import type { SupabaseClient } from "@supabase/supabase-js";

const saveProgressSchema = z.object({
  anonId: z.string().uuid(),
  challengeKey: z.literal(FIRST_DEFENDER_CHALLENGE_KEY),
  status: z.enum(["in_progress", "completed"]),
  currentStep: z.number().int().min(0).max(5),
  score: z.number().int().min(0).max(100),
  xpEarned: z.number().int().min(0).max(150),
  hintsUsed: z.number().int().min(0).max(5),
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
      { onConflict: "anon_id" }
    );
    if (error) throw error;
    return actionSuccess();
  } catch (err) {
    console.error("saveAnonymousChallengeProgress failed", err);
    return actionError("Could not sync progress, but your local progress is safe.");
  }
}

/**
 * Shared by registerAndClaimChallenge below. Trusts `userId` because
 * every caller derives it from a just-completed `supabase.auth.signUp`
 * response, never from client-supplied input, so there is no path for
 * a visitor to claim a result onto an account that is not the one they
 * just created. Idempotent: if `anon_id` is already claimed, this is a
 * no-op success rather than an error, so a retried request can never
 * double-award XP or the badge.
 */
async function claimForUser(
  admin: SupabaseClient,
  userId: string,
  anonId: string,
  challengeKey: string
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
    .eq("key", FIRST_DEFENDER_BADGE_KEY)
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
    challengeKey: z.literal(FIRST_DEFENDER_CHALLENGE_KEY),
  })
);
export type RegisterAndClaimInput = z.infer<typeof registerAndClaimSchema>;

export interface RegisterAndClaimData {
  xpAwarded: number;
  badgeAwarded: boolean;
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
    return actionError(signUpError?.message ?? "We could not create your account.");
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
