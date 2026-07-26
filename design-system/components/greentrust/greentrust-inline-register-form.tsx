"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerAndClaimGreenTrustAssessment } from "@/lib/actions/greentrust-assessment";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";

export interface GreenTrustInlineRegisterFormProps {
  locale: AppLocale;
  submissionId: string;
  onRegistered: () => void;
}

/**
 * "Save my assessment" for a visitor who has not registered yet.
 * Mirrors components/challenge/inline-register-form.tsx: embedded
 * directly in the results screen rather than a redirect, and the
 * already-computed, already-persisted (anonymous) result is claimed
 * onto the new account in the same request that creates it
 * (registerAndClaimGreenTrustAssessment), never lost.
 */
export function GreenTrustInlineRegisterForm({ locale, submissionId, onRegistered }: GreenTrustInlineRegisterFormProps) {
  const t = useTranslations("auth.register");
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);

  function handleFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("registration_started", { locale, source: "greentrust_assessment" });
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

    const result = await registerAndClaimGreenTrustAssessment({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      organization: "",
      password,
      confirmPassword,
      locale,
      website: String(formData.get("website") ?? ""),
      submissionId,
    });

    if (result.status === "success") {
      trackEvent("registration_completed", { locale, source: "greentrust_assessment" });
      onRegistered();
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
      <FormField id="greentrust-register-name" label={t("nameLabel")} required>
        <Input name="name" required autoComplete="name" />
      </FormField>
      <FormField id="greentrust-register-email" label={t("emailLabel")} required>
        <Input type="email" name="email" required autoComplete="email" />
      </FormField>
      <FormField id="greentrust-register-password" label={t("passwordLabel")} required>
        <Input type="password" name="password" required minLength={8} autoComplete="new-password" />
      </FormField>
      <FormField id="greentrust-register-confirm-password" label={t("confirmPasswordLabel")} required>
        <Input type="password" name="confirmPassword" required minLength={8} autoComplete="new-password" />
      </FormField>
      <Button type="submit" loading={status === "loading"} className="w-full">
        {t("submit")}
      </Button>
      {status === "error" && <p className="text-sm text-danger-600">{errorMessage}</p>}
    </form>
  );
}
