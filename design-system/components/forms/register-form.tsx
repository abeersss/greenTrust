"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { registerUser } from "@/lib/actions/auth";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";

export function RegisterForm({ locale }: { locale: AppLocale }) {
  const t = useTranslations("auth.register");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [retryAfter, setRetryAfter] = React.useState(0);

  // Counts a rate-limit cooldown down to 0 once a second, so the submit
  // button re-enables itself automatically instead of staying disabled
  // forever or leaving the visitor to guess when they can try again.
  React.useEffect(() => {
    if (retryAfter <= 0) return;
    const id = setInterval(() => {
      setRetryAfter((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [retryAfter]);

  // Using a plain onSubmit handler (rather than React 19's <form
  // action={fn}> shorthand) is deliberate: action={fn} wraps the whole
  // submission -- including the setStatus("loading") call below -- in a
  // low-priority transition, which can delay the loading spinner long
  // enough that a click feels unresponsive ("heavy"). A regular onSubmit
  // handler runs setStatus in the normal, high-priority render lane, so
  // the spinner appears immediately. The status === "loading" guard below
  // also stops a second submission firing while the first is still in
  // flight, e.g. from an impatient double-click.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading" || retryAfter > 0) return;

    setStatus("loading");
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage(t("passwordMismatch"));
      return;
    }

    try {
      const result = await registerUser({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        organization: String(formData.get("organization") ?? ""),
        password,
        confirmPassword,
        locale,
        website: String(formData.get("website") ?? ""),
      });

      if (result.status === "success") {
        setStatus("success");
        trackEvent("register_submit", { locale });
      } else {
        setStatus("error");
        setErrorMessage(result.message || t("error"));
        if (result.retryAfterSeconds) setRetryAfter(result.retryAfterSeconds);
      }
    } catch (err) {
      // Never leave the button stuck on "loading" forever if registerUser
      // throws instead of returning an ActionResult (e.g. a network drop).
      console.error("registerUser threw", err);
      setStatus("error");
      setErrorMessage(t("error"));
    }
  }

  if (status === "success") {
    return <p className="text-success-600">{t("success")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0 [inset-inline-start:-9999px]"
      />

      <FormField id="register-name" label={t("nameLabel")} required>
        <Input name="name" required autoComplete="name" />
      </FormField>
      <FormField id="register-email" label={t("emailLabel")} required>
        <Input type="email" name="email" required autoComplete="email" />
      </FormField>
      <FormField id="register-organization" label={t("organizationLabel")}>
        <Input name="organization" autoComplete="organization" />
      </FormField>
      <FormField id="register-password" label={t("passwordLabel")} required>
        <Input type="password" name="password" required minLength={8} autoComplete="new-password" />
      </FormField>
      <FormField id="register-confirm-password" label={t("confirmPasswordLabel")} required>
        <Input type="password" name="confirmPassword" required minLength={8} autoComplete="new-password" />
      </FormField>

      <Button type="submit" loading={status === "loading"} disabled={retryAfter > 0} className="w-full">
        {retryAfter > 0 ? `${t("submit")} (${retryAfter}s)` : t("submit")}
      </Button>
      {status === "error" && retryAfter === 0 && <p className="text-sm text-danger-600">{errorMessage}</p>}
      {status === "error" && retryAfter > 0 && <p className="text-sm text-success-600">{errorMessage}</p>}

      <p className="text-center text-sm text-text-secondary">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}
