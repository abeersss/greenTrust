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
  confirmLabel: { en: "Your certificate will be issued to:", ar: "سيتم إصدار شهادتك باسم:" },
  confirmSubmit: { en: "Issue my certificate", ar: "أصدر شهادتي" },
  notYou: { en: "Not you? Enter a different name", ar: "ليس أنت؟ أدخل اسمًا مختلفًا" },
} as const;

/**
 * The name-confirmation / name-entry step of the CTF completion
 * certificate flow. Founder instruction (2026-08-04): "make sure
 * that the certificate has the name of the user account otherwise
 * he should enter the name before issuing the certificate."
 *
 * When the signed-in account already has a name on file
 * (profiles.full_name, set at registration -- passed in here as
 * `accountFullName`), this skips straight to a one-click confirm
 * using that name rather than making the learner retype it, since
 * issueCertificate (lib/actions/certificate.ts) always trusts the
 * account's own name over anything a client submits anyway. Only
 * when the account has no name on file (accountFullName is null),
 * or the learner explicitly says the account name isn't right for
 * this certificate, does the free-text form appear -- and whatever
 * they enter there also gets saved back to their profile
 * server-side, so the account itself has a name going forward, not
 * just this one certificate.
 *
 * Rendered by app/[locale]/labs/ctf/certificate/page.tsx once that
 * Server Component has already confirmed (server-side, via
 * getCtfCompletionStatus) that the signed-in visitor has earned all
 * six CTF badges and has no certificate yet -- this component itself
 * does not re-check eligibility, since issueCertificate re-verifies
 * it server-side anyway and is the actual source of truth.
 */
export function CertificateClaimForm({
  locale,
  accountFullName,
}: {
  locale: AppLocale;
  accountFullName: string | null;
}) {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [editing, setEditing] = React.useState(!accountFullName);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(nameOverride?: string) {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const result = await issueCertificate(nameOverride ? { fullName: nameOverride } : {});
    setSubmitting(false);
    if (result.status === "error") {
      setError(result.message);
      return;
    }
    if (result.data) {
      router.push(`/certificate/${result.data.referenceCode}`);
    }
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(fullName);
  }

  if (!editing && accountFullName) {
    return (
      <div className="mx-auto mt-6 max-w-md space-y-3 text-center">
        <p className="text-sm text-text-secondary">{pick(copy.confirmLabel, locale)}</p>
        <p className="font-display text-lg font-semibold text-text-primary">{accountFullName}</p>
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <Button type="button" className="w-full" loading={submitting} onClick={() => void submit()}>
          {submitting ? pick(copy.submitting, locale) : pick(copy.confirmSubmit, locale)}
        </Button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs font-medium text-text-muted underline-offset-2 hover:underline"
        >
          {pick(copy.notYou, locale)}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="mx-auto mt-6 max-w-md space-y-3">
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
