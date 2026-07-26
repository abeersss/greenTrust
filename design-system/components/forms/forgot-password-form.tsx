"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { requestPasswordReset } from "@/lib/actions/auth";
import type { AppLocale } from "@/lib/i18n/config";

export function ForgotPasswordForm({ locale }: { locale: AppLocale }) {
  const t = useTranslations("auth.forgotPassword");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    const result = await requestPasswordReset({
      email: String(formData.get("email") ?? ""),
      locale,
    });
    setStatus(result.status === "success" ? "success" : "error");
  }

  if (status === "success") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-text-secondary">{t("success")}</p>
        <Link href="/login" className="text-sm text-primary hover:underline">
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <FormField id="forgot-password-email" label={t("emailLabel")} required>
        <Input type="email" name="email" required autoComplete="email" />
      </FormField>
      <Button type="submit" loading={status === "loading"} className="w-full">
        {t("submit")}
      </Button>
      {status === "error" && <p className="text-sm text-danger-600">{t("error")}</p>}
      <p className="text-center text-sm text-text-secondary">
        <Link href="/login" className="text-primary hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
