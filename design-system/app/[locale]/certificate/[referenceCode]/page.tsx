import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { Link } from "@/lib/i18n/navigation";
import { pick } from "@/lib/challenges/bilingual";
import { verifyCertificate } from "@/lib/actions/certificate";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/seo/site";
import { ShieldCheck, ShieldX } from "lucide-react";

const copy = {
  title: { en: "CTF Completion Certificate", ar: "شهادة إتمام تحديات CTF" },
  validBadge: { en: "Verified certificate", ar: "شهادة موثّقة" },
  issuedTo: { en: "This certifies that", ar: "تشهد هذه الوثيقة بأن" },
  bodyText: {
    en: "has successfully completed all six CyberAbeer Capture-the-Flag challenges, each cleared at 80% or higher.",
    ar: "قد أتمّ/أتمّت بنجاح جميع تحديات CyberAbeer الستة من نوع Capture the Flag، بنسبة 80% أو أكثر لكل تحدٍ.",
  },
  issuedOn: { en: "Issued on", ar: "تاريخ الإصدار" },
  reference: { en: "Reference code", ar: "رمز المرجع" },
  signature: { en: "Dr. Abeer Alshammari", ar: "د. عبير الشمري" },
  signatureTitle: { en: "Founder, CyberAbeer", ar: "المؤسِّسة، CyberAbeer" },
  verifyNote: {
    en: "Authenticated on cyberabeer.com. Scan the QR code or visit this page directly to re-verify at any time.",
    ar: "تم التحقق عبر موقع cyberabeer.com. امسح رمز QR أو زر هذه الصفحة مباشرة لإعادة التحقق في أي وقت.",
  },
  notFoundTitle: { en: "Certificate not found", ar: "الشهادة غير موجودة" },
  notFoundBody: {
    en: "We could not verify a certificate with this reference code. Double-check the link or QR code, or contact support if you believe this is an error.",
    ar: "تعذّر التحقق من وجود شهادة بهذا الرمز المرجعي. تحقق من الرابط أو رمز QR، أو تواصل مع الدعم إذا كنت تعتقد أن هذا خطأ.",
  },
  backHome: { en: "← Back to CyberAbeer", ar: "← العودة إلى CyberAbeer" },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; referenceCode: string }>;
}): Promise<Metadata> {
  const { locale, referenceCode } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  return buildMetadata({
    locale,
    path: `certificate/${referenceCode}`,
    title: copy.title[l],
    description: pick(copy.bodyText, l),
    noIndex: true,
  });
}

/**
 * Public CTF Completion Certificate + verification page (2026-08-03,
 * founder instruction: "should show ref or QR to authenticate across
 * cyberabeer.com with my sign Dr. Abeer Alshammari"). Deliberately one
 * page for both purposes -- the certificate a learner shares IS the
 * verification page -- reached either by the link itself or by
 * scanning the QR code printed on it, which points back to this exact
 * URL. No login required to view: verifyCertificate
 * (lib/actions/certificate.ts) only ever returns the display-safe
 * fields (name, reference code, issue date), never the owning
 * account's user_id or email, so this is safe to expose to anyone who
 * has the link.
 */
export default async function CertificatePage({
  params,
}: {
  params: Promise<{ locale: string; referenceCode: string }>;
}) {
  const { locale, referenceCode } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const result = await verifyCertificate(referenceCode);
  const verifyUrl = `${siteUrl}/${l}/certificate/${referenceCode}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`;
  const issuedDate = result.issuedAt
    ? new Date(result.issuedAt).toLocaleDateString(l === "ar" ? "ar" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div data-brand="labs" className="mx-auto max-w-2xl px-4 py-16 tablet:px-6">
      {!result.found ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
          <ShieldX className="mx-auto h-10 w-10 text-danger-500" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">{pick(copy.notFoundTitle, l)}</h1>
          <p className="mt-3 text-text-secondary">{pick(copy.notFoundBody, l)}</p>
          <Link href="/" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">
            {pick(copy.backHome, l)}
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-accent/30 bg-surface p-10 text-center shadow-md">
          <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {pick(copy.validBadge, l)}
          </div>

          <p className="font-display text-lg text-text-secondary">{pick(copy.title, l)}</p>
          <p className="mt-6 text-sm uppercase tracking-wide text-text-muted">{pick(copy.issuedTo, l)}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-text-primary tablet:text-4xl">{result.fullName}</h1>
          <p className="mx-auto mt-4 max-w-md text-text-secondary">{pick(copy.bodyText, l)}</p>

          <div className="mx-auto mt-8 flex max-w-xs items-center justify-between gap-6 border-t border-border pt-6 text-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{pick(copy.issuedOn, l)}</p>
              <p className="text-sm font-semibold text-text-primary">{issuedDate}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- a
                plain <img> avoids registering api.qrserver.com as a
                next/image remote pattern for one small, non-critical
                decorative code image. */}
            <img src={qrSrc} alt="" width={80} height={80} className="shrink-0 rounded" />
          </div>

          <div className="mx-auto mt-6 max-w-xs border-t border-border pt-4 text-start">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{pick(copy.reference, l)}</p>
            <p className="font-mono text-sm text-text-primary">{result.referenceCode}</p>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="font-display text-lg italic text-text-primary">{pick(copy.signature, l)}</p>
            <p className="text-sm text-text-secondary">{pick(copy.signatureTitle, l)}</p>
          </div>

          <p className="mx-auto mt-6 max-w-sm text-xs text-text-muted">{pick(copy.verifyNote, l)}</p>
        </div>
      )}
    </div>
  );
}
