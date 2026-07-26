"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { subscribeToNewsletter } from "@/lib/actions/newsletter";
import { newsletterSegments } from "@/lib/validation/schemas";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Newsletter signup, used in the footer on every page. Asks which
 * segment the visitor is interested in because
 * `newsletter_subscribers.segment` has a NOT NULL check constraint in
 * the database (see database/migrations/002_schema_content_leads.sql)
 * with no generic/default option, so the form has to collect it
 * rather than silently guessing.
 */
export function NewsletterForm({
  locale,
  segment = "enterprise_ai_governance",
  submitLabel,
}: {
  locale: AppLocale;
  segment?: (typeof newsletterSegments)[number];
  /** Overrides the default "Subscribe" label, e.g. for a waitlist form. */
  submitLabel?: string;
}) {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMessage(null);

    const result = await subscribeToNewsletter({
      email: String(formData.get("email") ?? ""),
      segment,
      locale,
      website: String(formData.get("website") ?? ""),
    });

    if (result.status === "success") {
      setStatus("success");
      trackEvent("newsletter_subscribed", { locale });
    } else {
      setStatus("error");
      setErrorMessage(result.message);
    }
  }

  if (status === "success") {
    return <p className="text-sm text-success-600">{t("newsletterSuccess")}</p>;
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-2">
      <Label htmlFor="newsletter-email" className="sr-only">
        {tCommon("email")}
      </Label>
      {/* Honeypot: hidden from real visitors via CSS, left in the tab
          order removed via tabIndex so screen reader users never land
          on it either. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 opacity-0 [inset-inline-start:-9999px]"
      />
      <div className="flex gap-2">
        <Input
          id="newsletter-email"
          type="email"
          name="email"
          required
          placeholder={t("newsletterPlaceholder")}
          className="max-w-[240px]"
        />
        <Button type="submit" variant="secondary" size="sm" loading={status === "loading"}>
          {submitLabel ?? t("newsletterSubmit")}
        </Button>
      </div>
      {status === "error" && <p className="text-xs text-danger-600">{errorMessage}</p>}
    </form>
  );
}
