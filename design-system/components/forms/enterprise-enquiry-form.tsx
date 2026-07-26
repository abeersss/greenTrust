"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { submitEnterpriseEnquiry } from "@/lib/actions/enterprise-enquiry";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";

const companySizes = ["1-50", "51-250", "251-1000", "1000+"] as const;

export function EnterpriseEnquiryForm({ locale }: { locale: AppLocale }) {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [companySize, setCompanySize] = React.useState<string>("");
  const startedRef = React.useRef(false);

  function handleFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("enterprise_contact_started", { locale });
  }

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMessage(null);

    const result = await submitEnterpriseEnquiry({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      organization: String(formData.get("organization") ?? ""),
      companySize: (companySize || undefined) as (typeof companySizes)[number] | undefined,
      interest: String(formData.get("interest") ?? ""),
      message: String(formData.get("message") ?? ""),
      locale,
      website: String(formData.get("website") ?? ""),
    });

    if (result.status === "success") {
      setStatus("success");
      trackEvent("enterprise_enquiry_submitted", { locale });
    } else {
      setStatus("error");
      setErrorMessage(result.message);
    }
  }

  if (status === "success") {
    return <p className="text-success-600">{t("enterpriseSuccess")}</p>;
  }

  return (
    <form action={handleSubmit} className="space-y-4" onFocus={handleFocus}>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0 [inset-inline-start:-9999px]"
      />

      <FormField id="ee-name" label={t("fields.name")} required>
        <Input name="name" required autoComplete="name" />
      </FormField>

      <FormField id="ee-email" label={t("fields.email")} required>
        <Input type="email" name="email" required autoComplete="email" />
      </FormField>

      <FormField id="ee-organization" label={t("fields.organization")} required>
        <Input name="organization" required autoComplete="organization" />
      </FormField>

      <div className="space-y-1.5">
        <Label htmlFor="ee-company-size">{t("fields.companySize")}</Label>
        <Select value={companySize} onValueChange={setCompanySize}>
          <SelectTrigger id="ee-company-size">
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            {companySizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FormField id="ee-message" label={t("fields.message")} required>
        <Textarea name="message" required rows={4} />
      </FormField>

      <Button type="submit" loading={status === "loading"} className="w-full">
        {tCommon("submit")}
      </Button>
      {status === "error" && <p className="text-sm text-danger-600">{errorMessage}</p>}
    </form>
  );
}
