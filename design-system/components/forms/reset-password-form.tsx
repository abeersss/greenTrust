"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { updatePassword } from "@/lib/actions/auth";
import type { AppLocale } from "@/lib/i18n/config";

export function ResetPasswordForm({ locale }: { locale: AppLocale }) {
  const t = useTranslations("auth.resetPassword");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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

    const result = await updatePassword({ password, confirmPassword, locale });
    if (result.status === "success") {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.status === "error" ? result.message : t("error"));
    }
  }

  if (status === "success") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-success-600">{t("success")}</p>
        <Link href="/login" className="text-sm text-primary hover:underline">
          {t("loginLink")}
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <FormField id="reset-password-password" label={t("passwordLabel")} required>
        <Input type="password" name="password" required minLength={8} autoComplete="new-password" />
      </FormField>
      <FormField id="reset-password-confirm" label={t("confirmPasswordLabel")} required>
        <Input type="password" name="confirmPassword" required minLength={8} autoComplete="new-password" />
      </FormField>
      <Button type="submit" loading={status === "loading"} className="w-full">
        {t("submit")}
      </Button>
      {status === "error" && <p className="text-sm text-danger-600">{errorMessage}</p>}
    </form>
  );
}
