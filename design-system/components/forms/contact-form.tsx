"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitContactForm } from "@/lib/actions/contact";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";

export function ContactForm({ locale }: { locale: AppLocale }) {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMessage(null);

    const result = await submitContactForm(
      {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        organization: String(formData.get("organization") ?? ""),
        message: String(formData.get("message") ?? ""),
        locale,
        website: String(formData.get("website") ?? ""),
      },
      pathname
    );

    if (result.status === "success") {
      setStatus("success");
      trackEvent("contact_submit", { locale });
    } else {
      setStatus("error");
      setErrorMessage(result.message);
    }
  }

  if (status === "success") {
    return <p className="text-success-600">{t("generalSuccess")}</p>;
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0 [inset-inline-start:-9999px]"
      />

      <FormField id="contact-name" label={t("fields.name")} required>
        <Input name="name" required autoComplete="name" />
      </FormField>

      <FormField id="contact-email" label={t("fields.email")} required>
        <Input type="email" name="email" required autoComplete="email" />
      </FormField>

      <FormField id="contact-organization" label={t("fields.organization")}>
        <Input name="organization" autoComplete="organization" />
      </FormField>

      <FormField id="contact-message" label={t("fields.message")} required>
        <Textarea name="message" required rows={5} />
      </FormField>

      <Button type="submit" loading={status === "loading"} className="w-full">
        {tCommon("submit")}
      </Button>
      {status === "error" && <p className="text-sm text-danger-600">{errorMessage}</p>}
    </form>
  );
}
