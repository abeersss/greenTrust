import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Playfair_Display, Dancing_Script } from "next/font/google";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { Link } from "@/lib/i18n/navigation";
import { pick } from "@/lib/challenges/bilingual";
import { verifyCertificate } from "@/lib/actions/certificate";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/seo/site";
import CertificateShareButton from "@/components/certificate/certificate-share-button";
import { ShieldCheck, ShieldX } from "lucide-react";

// Decorative fonts for the certificate artwork only (English name /
// title styling). Arabic keeps the site's existing font-display
// family, which already has proper Arabic glyph coverage.
const displayFont = Playfair_Display({ subsets: ["latin"], weight: ["700", "800", "900"] });
const scriptFont = Dancing_Script({ subsets: ["latin"], weight: ["600", "700"] });

const copy = {
  title: { en: "CTF Completion Certificate", ar: "شهادة إتمام تحديات CTF" },
  validBadge: { en: "Verified certificate", ar: "شهادة موثّقة" },
  certificateWord: { en: "Certificate", ar: "شهادة" },
  ofAchievement: { en: "of Achievement", ar: "إنجاز" },
  issuedTo: { en: "This certificate is proudly presented to", ar: "تُمنح هذه الشهادة بكل فخر إلى" },
  bodyText: {
    en: "for successfully completing all six CyberAbeer Capture-the-Flag challenges, each cleared at 80% or higher.",
    ar: "لإتمامه/إتمامها بنجاح جميع تحديات CyberAbeer الستة من نوع Capture the Flag، بنسبة 80% أو أكثر لكل تحدٍ.",
  },
  issuedOn: { en: "Issued on", ar: "تاريخ الإصدار" },
  reference: { en: "Reference code", ar: "رمز المرجع" },
  signature: { en: "Dr. Abeer Alshammari", ar: "د. عبير الشمري" },
  signatureTitle: { en: "Founder, CyberAbeer", ar: "المؤسِّسة، CyberAbeer" },
  verifyNote: {
    en: "Authenticated on cyberabeer.com. Visit this page directly at any time to re-verify.",
    ar: "تم التحقق عبر موقع cyberabeer.com. زر هذه الصفحة مباشرة في أي وقت لإعادة التحقق.",
  },
  shareLabel: { en: "Share", ar: "مشاركة" },
  notFoundTitle: { en: "Certificate not found", ar: "الشهادة غير موجودة" },
  notFoundBody: {
    en: "We could not verify a certificate with this reference code. Double-check the link, or contact support if you believe this is an error.",
    ar: "تعذّر التحقق من وجود شهادة بهذا الرمز المرجعي. تحقق من الرابط، أو تواصل مع الدعم إذا كنت تعتقد أن هذا خطأ.",
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
  const result = await verifyCertificate(referenceCode);

  // Founder instruction (2026-08-04): "make sharing for certificate
  // as an image post with link to site." Only wire a real OG/Twitter
  // image once the certificate actually verified -- an unresolved
  // reference code has no name or issue date to render, and this
  // page's own notFound branch below already handles that case with
  // plain text, no image needed. buildMetadata's own `ogImagePath`
  // param already builds correctly-shaped openGraph/twitter blocks,
  // so passing the certificate image straight through here is safer
  // than manually re-assembling those objects.
  let ogImagePath: string | undefined;
  if (result.found) {
    const issuedDate = result.issuedAt
      ? new Date(result.issuedAt).toLocaleDateString(l === "ar" ? "ar" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
    ogImagePath = `${siteUrl}/api/certificate-image/${encodeURIComponent(referenceCode)}?${new URLSearchParams({
      name: result.fullName ?? "",
      locale,
      issued: issuedDate,
    }).toString()}`;
  }

  return buildMetadata({
    locale,
    path: `certificate/${referenceCode}`,
    title: copy.title[l],
    description: pick(copy.bodyText, l),
    noIndex: true,
    ogImagePath,
  });
}

/**
 * Public CTF Completion Certificate + verification page (2026-08-03,
 * founder instruction: "should show ref or QR to authenticate across
 * cyberabeer.com with my sign Dr. Abeer Alshammari"; restyled
 * 2026-08-03 to match the founder-provided certificate reference
 * design -- a framed, ribbon-sealed certificate rather than a plain
 * status card). Deliberately one page for both purposes -- the
 * certificate a learner shares IS the verification page -- reached
 * either by the link itself or by scanning the QR code printed on
 * it, which points back to this exact URL. No login required to
 * view: verifyCertificate (lib/actions/certificate.ts) only ever
 * returns the display-safe fields (name, reference code, issue
 * date), never the owning account's user_id or email, so this is
 * safe to expose to anyone who has the link.
 *
 * 2026-08-04 revision (founder feedback on the live page): the
 * signature block used to sit in the last of three equal-width grid
 * columns, too narrow for "Dr. Abeer Alshammari" in the cursive
 * signature font, so it wrapped onto two lines. The grid now gives
 * that column more room and the name itself no longer wraps. The
 * founder also asked for the CTF ribbon seal to be adjusted rather
 * than removed, so it's sized and spaced a little more generously
 * than the original reference-image proportions. A Share button was
 * also added (previously this page had no share affordance at all),
 * wired the same way as the badge Share buttons on /account: native
 * Web Share with the certificate image attached where supported,
 * falling back to X/LinkedIn/Facebook links that carry this page's
 * new Open Graph image (see app/api/certificate-image/[referenceCode]/route.ts).
 *
 * 2026-08-04 (later, founder feedback: circled the QR code on a live
 * screenshot -- it was rendering as a broken-image icon instead of an
 * actual code, most likely api.qrserver.com being unreachable or
 * blocked from the server). Rather than depend on a third-party QR
 * service for something this decorative, the QR image is removed
 * entirely; the reference code + Share button (which already carries
 * the verification link) are enough to re-verify a certificate. The
 * founder's original "should show ref or QR" instruction is still
 * satisfied via the printed reference code shown in this same strip.
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
  const issuedDate = result.issuedAt
    ? new Date(result.issuedAt).toLocaleDateString(l === "ar" ? "ar" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const nameFontClass = l === "en" ? scriptFont.className : "font-display italic";
  const titleFontClass = l === "en" ? displayFont.className : "font-display";
  const imageUrl = result.found
    ? `${siteUrl}/api/certificate-image/${encodeURIComponent(referenceCode)}?${new URLSearchParams({
        name: result.fullName ?? "",
        locale,
        issued: issuedDate,
      }).toString()}`
    : "";
  const shareText =
    l === "ar"
      ? `حصلت على شهادة إتمام تحديات CyberAbeer CTF!`
      : `I just earned my CyberAbeer CTF Completion Certificate!`;

  return (
    <div data-brand="labs" className="mx-auto max-w-3xl px-4 py-16 tablet:px-6">
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
        <div>
          <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {pick(copy.validBadge, l)}
          </div>

          {/* Certificate artwork: green outer frame, gold inner
              rule, dotted texture background -- matches the
              founder-provided reference design. */}
          <div className="rounded-xl bg-gradient-to-br from-green-800 via-green-700 to-green-800 p-[6px] shadow-xl">
            <div className="rounded-[10px] border-2 border-yellow-500/80 p-[3px]">
              <div
                className="relative overflow-hidden rounded-lg bg-surface px-6 py-10 text-center tablet:px-14 tablet:py-14"
                style={{
                  backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                  color: "rgba(0,0,0,0.05)",
                }}
              >
                {/* content wrapper resets text color since the dot
                    pattern above uses `color` as its dot color */}
                <div className="relative text-text-primary">
                  {/* Ribbon medal seal removed (2026-08-04 founder
                      feedback: after seeing it adjusted/enlarged,
                      founder asked to just remove it from the
                      certificate). */}

                  <p className={`${titleFontClass} text-3xl font-extrabold uppercase tracking-wide text-text-primary tablet:text-4xl`}>
                    {pick(copy.certificateWord, l)}
                  </p>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                    {pick(copy.ofAchievement, l)}
                  </p>

                  <p className="mx-auto mt-8 max-w-md text-xs font-medium uppercase tracking-wide text-text-muted">
                    {pick(copy.issuedTo, l)}
                  </p>

                  <h1
                    className={`${nameFontClass} mx-auto mt-3 max-w-lg text-4xl font-bold leading-tight text-green-700 tablet:text-5xl`}
                  >
                    {result.fullName}
                  </h1>
                  <div className="mx-auto mt-3 h-px w-64 bg-text-primary/30" />

                  <p className="mx-auto mt-4 max-w-md text-sm text-text-secondary">{pick(copy.bodyText, l)}</p>

                  {/* Fix (2026-08-04, founder feedback: "my signature
                      i want it in one line"): the bottom strip used
                      to be three equal grid columns, and "Dr. Abeer
                      Alshammari" in the cursive signature font didn't
                      fit the narrow third column, so it wrapped.
                      Giving that column noticeably more of the row
                      (and the QR column only as much as its own
                      fixed pixel size needs) plus whitespace-nowrap
                      on the name itself keeps it on one line. */}
                  <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 items-end gap-4 border-t border-dashed border-border pt-6 text-start">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                        {pick(copy.issuedOn, l)}
                      </p>
                      <p className="text-xs font-semibold text-text-primary">{issuedDate}</p>
                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                        {pick(copy.reference, l)}
                      </p>
                      <p className="font-mono text-[11px] text-text-primary">{result.referenceCode}</p>
                    </div>

                    <div className="min-w-0 text-end">
                      <p className={`${nameFontClass} whitespace-nowrap text-base tablet:text-lg text-text-primary`}>
                        {pick(copy.signature, l)}
                      </p>
                      <div className="mt-1 border-t border-text-primary/40 pt-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                          {pick(copy.signatureTitle, l)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {imageUrl && (
            <CertificateShareButton
              referenceCode={referenceCode}
              shareUrl={verifyUrl}
              shareImageUrl={imageUrl}
              shareText={shareText}
              shareLabel={pick(copy.shareLabel, l)}
              locale={l === "ar" ? "ar" : "en"}
            />
          )}

          <p className="mx-auto mt-6 max-w-sm text-center text-xs text-text-muted">{pick(copy.verifyNote, l)}</p>
        </div>
      )}
    </div>
  );
}
