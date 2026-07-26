"use server";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validation/schemas";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { splitFullName } from "./contacts";
import { actionError, actionSuccess, type ActionResult } from "./types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { siteUrl } from "@/lib/seo/site";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";

/**
 * Registration creates the Supabase Auth user, a matching `profiles`
 * row (Phase 3: profiles is a 1:1 extension of auth.users, never
 * duplicating anything Supabase Auth already stores), and, if an
 * organization name was given, an `organizations` row with the new
 * user as `org_owner`. Individual learners who leave the organization
 * field blank get a profile only, matching the Phase 3 "organizations
 * are business accounts, individuals are not forced into one" intent.
 *
 * There is no dashboard to send a newly registered user to yet
 * (GreenTrust AI and CyberAbeer Labs applications are later
 * milestones), so both register and login redirect back to the
 * locale home page on success; the caller decides what to do with
 * that.
 */
export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }
  if (parsed.data.website) return actionSuccess();

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
    console.error("registerUser signUp failed", signUpError);
    return actionError(signUpError?.message ?? "We could not create your account.");
  }

  try {
    // Profile creation and org bootstrap use the service-role client:
    // signUp() may not yet have an active session (email confirmation
    // pending), so the anon-key client's RLS context has no
    // authenticated uid() to satisfy the profiles insert policy.
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

    // Best-effort: a failed welcome email never fails registration
    // itself, since the account and profile are already committed.
    await sendEmail({ to: parsed.data.email, ...welcomeEmail(parsed.data.locale, parsed.data.name) });

    return actionSuccess();
  } catch (err) {
    // The auth user was created but the profile/org bootstrap failed.
    // Surface this clearly rather than telling the person their
    // registration failed when auth.users already has their account,
    // which would leave them unable to register again with that email.
    console.error("registerUser post-signup setup failed", err);
    return actionError(
      "Your account was created, but we could not finish setting it up. Please contact support."
    );
  }
}

export async function loginUser(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`login:${ip}`);
  if (!rateLimit.success) {
    return actionError("Too many attempts. Please try again in a minute.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return actionError("We couldn't log you in with those details.");
  }

  return actionSuccess();
}

export async function logoutUser(): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) return actionError("We could not log you out. Please try again.");
  return actionSuccess();
}

/**
 * Sends a Supabase Auth password-reset email. Always returns success
 * to the caller regardless of whether the email is registered: this
 * is a deliberate account-enumeration defense (Phase 7 security
 * hardening) so a visitor can never use this form to test which
 * emails have a CyberAbeer account. The redirect target,
 * `/[locale]/reset-password`, exchanges the recovery token for a
 * session via `supabase.auth.exchangeCodeForSession` on load (see
 * that page), then `updatePassword` below sets the new password on
 * that recovered session.
 */
export async function requestPasswordReset(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`forgot-password:${ip}`);
  if (!rateLimit.success) {
    return actionError("Too many attempts. Please try again in a minute.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/${parsed.data.locale}/reset-password`,
  });
  if (error) {
    console.error("requestPasswordReset failed", error);
  }

  return actionSuccess();
}

/**
 * Sets a new password for the session established by the recovery
 * link (`/reset-password` exchanges the URL's code for a session
 * before this is ever called). Requires an active recovery session,
 * so a stale or reused link fails here with a clear error rather than
 * silently doing nothing.
 */
export async function updatePassword(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return actionError("This reset link is invalid or has expired. Please request a new one.");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return actionError("We could not update your password. Please request a new reset link.");
  }

  return actionSuccess();
}
