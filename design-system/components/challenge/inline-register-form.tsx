"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerAndClaimChallenge } from "@/lib/actions/challenge";
import { trackEvent } from "@/lib/analytics/track";
import type { ChallengeKey } from "@/lib/challenges/keys";
import type { AppLocale } from "@/lib/i18n/config";

export interface InlineRegisterFormProps {
  locale: AppLocale;
  anonId: string;
  challengeKey: ChallengeKey;
  registerCta: string;
  onRegistered: (result: { xpAwarded: number; badgeAwarded: boolean }) => void;
}

/**
 * A compact registration form embedded directly in a challenge
 * completion screen, never a redirect to /register: navigating away
 * would risk losing the completion screen's state, and the whole point
 * of this milestone is that registering must never destroy progress.
 * On success it calls `registerAndClaimChallenge` (not the general
 * `registerUser` action), which both creates the account and claims
 * the already-completed anonymous result in one trip.
 *
 * Genericized (2026-07-27) so Phishing Hunter's Mission Complete screen
 * can reuse this exact form instead of forking it: `challengeKey` and
 * `registerCta` are now caller-supplied props instead of hardcoded to
 * First Defender's constant and translation key, since new lab copy is
 * authored as inline bilingual objects rather than routed through the
 * shared messages/en.json and messages/ar.json catalogs.
 */
export function InlineRegisterForm({ locale, anonId, challengeKey, registerCta, onRegistered }: InlineRegisterFormProps) {
  const t = useTranslations("auth.register");
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);

  function handleFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("registration_started", { locale, challengeKey });
  }

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMessage(null);

    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage(t("passwordMismatch"));
      return;
    }

    const result = await registerAndClaimChallenge({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      organization: "",
      password,
      confirmPassword,
      locale,
      website: String(formData.get("website") ?? ""),
      anonId,
      challengeKey,
    });

    if (result.status === "success" && result.data) {
      trackEvent("registration_completed", { locale, challengeKey });
      if (result.data.badgeAwarded) {
        trackEvent("badge_earned", { locale, challengeKey });
      }
      onRegistered(result.data);
    } else {
      setStatus("error");
      setErrorMessage(result.status === "error" ? result.message : t("error"));
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3" onFocus={handleFocus}>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0 [inset-inline-start:-9999px]"
      />
      <FormField id="challenge-register-name" label={t("nameLabel")} required>
        <Input name="name" required autoComplete="name" />
      </FormField>
      <FormField id="challenge-register-email" label={t("emailLabel")} required>
        <Input type="email" name="email" required autoComplete="email" />
      </FormField>
      <FormField id="challenge-register-password" label={t("passwordLabel")} required>
        <Input type="password" name="password" required minLength={8} autoComplete="new-password" />
      </FormField>
      <FormField id="challenge-register-confirm-password" label={t("confirmPasswordLabel")} required>
        <Input type="password" name="confirmPassword" required minLength={8} autoComplete="new-password" />
      </FormField>
      <Button type="submit" loading={status === "loading"} className="w-full">
        {registerCta}
      </Button>
      {status === "error" && <p className="text-sm text-danger-600">{errorMessage}</p>}
    </form>
  );
}
