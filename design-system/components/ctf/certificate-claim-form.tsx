"use client";

import * as React from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { issueCertificate } from "@/lib/actions/certificate";
import { pick } from "@/lib/challenges/bilingual";
import type { AppLocale } from "@/lib/i18n/config";

const copy = {
  label: {
    en: "Full name (as it should appear on your certificate)",
    ar: "الاسم الكامل (كما تريد ظهوره في الشهادة)",
  },
  placeholder: { en: "e.g. Sara Al-Qahtani", ar: "مثال: سارة القحطاني" },
  submit: { en: "Claim my certificate", ar: "احصل على شهادتي" },
  submitting: { en: "Issuing certificate…", ar: "جاري إصدار الشهادة…" },
} as const;

/**
 * The name-entry step of the CTF completion certificate flow
 * (2026-08-03, founder instruction). Only rendered by
 * app/[locale]/labs/ctf/certificate/page.tsx once that Server
 * Component has already confirmed (server-side, via
 * getCtfCompletionStatus) that the signed-in visitor has earned all
 * six CTF badges and has no certificate yet -- this component itself
 * does not re-check eligibility, since issueCertificate re-verifies it
 * server-side anyway and is the actual source of truth.
 */
export function CertificateClaimForm({ locale }: { locale: AppLocale }) {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const result = await issueCertificate({ fullName });
    setSubmitting(false);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    if (result.data) {
      router.push(`/certificate/${result.data.referenceCode}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-md space-y-3">
      <div className="space-y-1.5 text-start">
        <label htmlFor="certificate-full-name" className="text-sm font-medium text-text-primary">
          {pick(copy.label, locale)}
        </label>
        <Input
          id="certificate-full-name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder={pick(copy.placeholder, locale)}
          minLength={2}
          maxLength={120}
          required
        />
      </div>
      {error && <p className="text-sm text-danger-600">{error}</p>}
      <Button type="submit" className="w-full" loading={submitting} disabled={fullName.trim().length < 2}>
        {submitting ? pick(copy.submitting, locale) : pick(copy.submit, locale)}
      </Button>
    </form>
  );
}
