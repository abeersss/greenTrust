"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { loginUser } from "@/lib/actions/auth";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";

export function LoginForm({ locale }: { locale: AppLocale }) {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Using a plain onSubmit handler (rather than React 19's <form
  // action={fn}> shorthand) is deliberate: action={fn} wraps the whole
  // submission -- including the setStatus("loading") call below -- in a
  // low-priority transition, which can delay the loading spinner long
  // enough after a click that the button feels heavy/unresponsive. A
  // regular onSubmit handler runs setStatus in the normal, high-priority
  // render lane, so the spinner appears immediately. The status ===
  // "loading" guard also stops a second submission firing while the
  // first is still in flight, e.g. from an impatient double-click.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await loginUser({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        locale,
      });

      if (result.status === "success") {
        trackEvent("login_submit", { locale });
        // Phase 8: a real account page now exists (XP, badges, challenge
        // history, saved GreenTrust results), so a signed-in visitor lands
        // there instead of the marketing home page.
        router.push("/account");
        router.refresh();
      } else {
        setStatus("error");
        setErrorMessage(t("error"));
      }
    } catch (err) {
      // 2026-08-21 fix: previously an unhandled throw here (from loginUser
      // itself, or from router.push/router.refresh after a successful
      // login) left status stuck at "loading" forever -- the submit
      // button stayed disabled with no visible error, matching student
      // reports of a "frozen" login button. Catching it restores the
      // button and shows a real error instead of hanging silently.
      console.error("Login failed unexpectedly", err);
      setStatus("error");
      setErrorMessage(t("error"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField id="login-email" label={t("emailLabel")} required>
        <Input type="email" name="email" required autoComplete="email" />
      </FormField>
      <FormField id="login-password" label={t("passwordLabel")} required>
        <Input type="password" name="password" required autoComplete="current-password" />
      </FormField>

      <Button type="submit" loading={status === "loading"} className="w-full">
        {t("submit")}
      </Button>
      {status === "error" && <p className="text-sm text-danger-600">{errorMessage}</p>}

      <p className="text-center text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          {t("forgotPasswordLink")}
        </Link>
      </p>

      <p className="text-center text-sm text-text-secondary">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-primary hover:underline">
          {t("registerLink")}
        </Link>
      </p>
    </form>
  );
}
