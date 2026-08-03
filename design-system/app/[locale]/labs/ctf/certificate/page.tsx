import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { Link } from "@/lib/i18n/navigation";
import { pick } from "@/lib/challenges/bilingual";
import { getCtfCompletionStatus } from "@/lib/actions/certificate";
import { CertificateClaimForm } from "@/components/ctf/certificate-claim-form";
import { Award, CheckCircle2, Lock } from "lucide-react";

const copy = {
  title: { en: "Your CTF Completion Certificate", ar: "شهادة إتمام تحديات CTF" },
  description: {
    en: "Capture all six CyberAbeer CTF flags at 80%+ each to claim a signed completion certificate.",
    ar: "اجمع كل الأعلام الستة في تحديات CyberAbeer CTF بنسبة 80% فأكثر لكل منها للحصول على شهادة إتمام موقّعة.",
  },
  breadcrumb: { en: "Certificate", ar: "الشهادة" },
  ctfBreadcrumb: { en: "CTF Challenges", ar: "تحديات CTF" },
  progress: { en: "flags captured", ar: "أعلام تم جمعها" },
  needLogin: {
    en: "Log in or create a free account to track your CTF progress and claim your certificate.",
    ar: "سجّل الدخول أو أنشئ حسابًا مجانيًا لتتبّع تقدّمك في تحديات CTF والحصول على شهادتك.",
  },
  logIn: { en: "Log in", ar: "تسجيل الدخول" },
  keepGoing: {
    en: "Keep going — capture every flag at 80% or higher to unlock your certificate.",
    ar: "واصل التقدم — اجمع كل علم بنسبة 80% أو أكثر لفتح شهادتك.",
  },
  browseCtf: { en: "Browse CTF Challenges", ar: "تصفح تحديات CTF" },
  allDone: {
    en: "All six flags captured. Enter your name to generate your certificate.",
    ar: "تم جمع الأعلام الستة كلها. أدخل اسمك لإصدار شهادتك.",
  },
  alreadyIssued: { en: "Your certificate has already been issued.", ar: "تم إصدار شهادتك بالفعل." },
  viewCertificate: { en: "View your certificate →", ar: "عرض شهادتك ←" },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  return buildMetadata({
    locale,
    path: "labs/ctf/certificate",
    title: copy.title[l],
    description: copy.description[l],
    noIndex: true,
  });
}

/**
 * CTF Completion Certificate claim flow (2026-08-03, founder
 * instruction). Reads completion status server-side on every load
 * (getCtfCompletionStatus, lib/actions/certificate.ts) rather than
 * fetching client-side, so the "X/6 flags captured" progress and the
 * gated name-entry form are always correct on first paint, including
 * a hard refresh, with no client-side loading flash.
 */
export default async function CtfCertificatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const status = await getCtfCompletionStatus();
  const progressPct = status.totalChallenges > 0 ? (status.completedChallenges / status.totalChallenges) * 100 : 0;

  return (
    <div data-brand="labs">
      <JsonLd
        data={breadcrumbSchema(l, [
          { name: tNav("labs"), path: "labs" },
          { name: copy.ctfBreadcrumb[l], path: "labs/ctf" },
          { name: copy.breadcrumb[l], path: "labs/ctf/certificate" },
        ])}
      />
      <div className="mx-auto max-w-6xl px-4 pt-8 tablet:px-6">
        <SiteBreadcrumb
          items={[
            { label: tNav("home"), href: "/" },
            { label: tNav("labs"), href: "/labs" },
            { label: copy.ctfBreadcrumb[l], href: "/labs/ctf" },
            { label: copy.breadcrumb[l] },
          ]}
        />
      </div>

      <section className="mx-auto max-w-2xl px-4 py-12 text-center tablet:py-16">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Award className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl font-bold text-text-primary tablet:text-4xl">{pick(copy.title, l)}</h1>
        <p className="mx-auto mt-4 text-lg text-text-secondary">{pick(copy.description, l)}</p>

        <div className="mt-8 rounded-lg border border-border bg-surface p-8 shadow-sm">
          {!status.signedIn ? (
            <div className="space-y-4">
              <Lock className="mx-auto h-8 w-8 text-text-muted" aria-hidden="true" />
              <p className="text-text-secondary">{pick(copy.needLogin, l)}</p>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-control bg-primary px-4 text-sm font-medium text-text-on-primary hover:bg-primary-hover"
              >
                {pick(copy.logIn, l)}
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-text-primary">
                {status.completedChallenges} / {status.totalChallenges} {pick(copy.progress, l)}
              </p>
              <div className="mx-auto mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progressPct}%` }} />
              </div>

              {!status.allComplete && (
                <div className="mt-6 space-y-4">
                  <p className="text-text-secondary">{pick(copy.keepGoing, l)}</p>
                  <Link
                    href="/labs/ctf"
                    className="inline-flex h-10 items-center justify-center rounded-control border border-border-strong px-4 text-sm font-medium text-text-primary hover:bg-neutral-100"
                  >
                    {pick(copy.browseCtf, l)}
                  </Link>
                </div>
              )}

              {status.allComplete && status.certificateReference && (
                <div className="mt-6 space-y-4">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-success-600" aria-hidden="true" />
                  <p className="text-text-secondary">{pick(copy.alreadyIssued, l)}</p>
                  <Link
                    href={`/certificate/${status.certificateReference}`}
                    className="inline-flex h-10 items-center justify-center rounded-control bg-primary px-4 text-sm font-medium text-text-on-primary hover:bg-primary-hover"
                  >
                    {pick(copy.viewCertificate, l)}
                  </Link>
                </div>
              )}

              {status.allComplete && !status.certificateReference && (
                <div className="mt-6">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-success-600" aria-hidden="true" />
                  <p className="mt-2 text-text-secondary">{pick(copy.allDone, l)}</p>
                  <CertificateClaimForm locale={l} />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
