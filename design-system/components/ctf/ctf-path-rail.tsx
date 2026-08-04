import { Check, Lock, Award, Globe, FileSearch, KeyRound } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { pick } from "@/lib/challenges/bilingual";
import type { AppLocale } from "@/lib/i18n/config";
import type { CtfCategory, CtfChallenge } from "@/lib/ctf/types";

const CATEGORY_ICON: Record<CtfCategory, typeof Globe> = {
  web: Globe,
  forensics: FileSearch,
  crypto: KeyRound,
};

const copy = {
  heading: { en: "Your CTF Path", ar: "مسارك في CTF" },
  subheading: {
    en: "Six flags, one certificate. Play them in any order -- the path fills in as you go.",
    ar: "ستة أعلام، شهادة واحدة. العب بأي ترتيب تريد — يمتلئ المسار كلما تقدمت.",
  },
  certificateNode: { en: "Certificate", ar: "الشهادة" },
  certificateLockedHint: {
    en: "Unlocks once all six flags are captured",
    ar: "يُفتح بعد جمع الأعلام الستة",
  },
  claimCta: { en: "Claim your certificate →", ar: "احصل على شهادتك ←" },
  viewCta: { en: "View your certificate →", ar: "عرض شهادتك ←" },
  completedLabel: { en: "Captured", ar: "تم جمعه" },
} as const;

interface CtfPathRailProps {
  locale: AppLocale;
  /** All 6 challenges in fixed display order (web, forensics, crypto). */
  challenges: CtfChallenge[];
  completedBadgeKeys: string[];
  allComplete: boolean;
  certificateReference: string | null;
  signedIn: boolean;
}

/**
 * "CTF Path" progress rail (CTF 2.0 Phase 2, founder reference image:
 * a connected node rail showing progression through the CTF track
 * ending in a certificate). Replaces the old single-line text banner
 * on /labs/ctf with a real visual path: one node per challenge plus a
 * 7th node for the certificate itself, connected by a line that fills
 * in as flags are captured.
 *
 * Deliberately does NOT gate challenge nodes as locked -- all 6 flags
 * are playable in any order (matches the existing category-grid page
 * below, which has never gated challenges by prior completion). Only
 * the certificate node has a real locked/unlocked state, since a
 * certificate genuinely requires all six badges server-side
 * (issueCertificate, lib/actions/certificate.ts).
 *
 * Hidden entirely for a signed-out visitor (same policy as the banner
 * it replaces) -- an anonymous visitor browsing challenge cards has
 * nothing to track yet.
 */
export function CtfPathRail({
  locale,
  challenges,
  completedBadgeKeys,
  allComplete,
  certificateReference,
  signedIn,
}: CtfPathRailProps) {
  if (!signedIn) return null;

  const completedSet = new Set(completedBadgeKeys);
  const nodes = challenges.map((challenge) => ({
    key: challenge.badge.key,
    slug: challenge.slug,
    title: pick(challenge.title, locale),
    category: challenge.category,
    complete: completedSet.has(challenge.badge.key),
  }));

  return (
    <section className="mx-auto mb-12 max-w-4xl rounded-xl border border-border bg-surface p-6 shadow-sm tablet:p-8">
      <h2 className="text-center font-display text-lg font-bold text-text-primary">{pick(copy.heading, locale)}</h2>
      <p className="mx-auto mt-1 max-w-md text-center text-sm text-text-secondary">{pick(copy.subheading, locale)}</p>

      <ol className="mt-8 flex flex-col gap-0 tablet:flex-row tablet:items-start tablet:justify-between">
        {nodes.map((node, i) => {
          const CategoryIcon = CATEGORY_ICON[node.category];
          const isLastChallenge = i === nodes.length - 1;
          return (
            <li key={node.key} className="flex flex-1 tablet:flex-col tablet:items-center">
              <div className="flex flex-col items-center tablet:contents">
                <Link
                  href={`/labs/ctf/${node.slug}`}
                  className="group flex flex-col items-center gap-1.5 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  title={node.title}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      node.complete
                        ? "border-success-500 bg-success-500 text-white"
                        : "border-border-strong bg-surface text-text-secondary group-hover:border-primary group-hover:text-primary"
                    }`}
                  >
                    {node.complete ? (
                      <Check className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <CategoryIcon className="h-4 w-4" aria-hidden="true" />
                    )}
                  </span>
                  <span className="max-w-[5.5rem] text-center text-[11px] font-medium leading-tight text-text-secondary group-hover:text-primary">
                    {node.title}
                  </span>
                </Link>
              </div>
              {/* Connector line: a 2px-wide vertical stroke on mobile
                  (stacked layout), a 2px-tall horizontal stroke that
                  grows to fill the gap between nodes on tablet+ (row
                  layout). Pure Tailwind, deliberately no inline style:
                  an earlier version set width/height via inline style,
                  which always wins the cascade over the tablet:h-0.5/
                  tablet:flex-1 utilities below and silently broke the
                  horizontal line at desktop widths. */}
              <div
                className={`mx-auto my-1 h-6 w-0.5 shrink-0 tablet:mx-0 tablet:mb-6 tablet:mt-5 tablet:h-0.5 tablet:w-auto tablet:flex-1 ${
                  node.complete ? "bg-success-500" : "bg-border"
                }`}
                aria-hidden="true"
              />
            </li>
          );
        })}

        {/* Certificate node -- the 7th stop on the path */}
        <li className="flex flex-col items-center">
          {allComplete && certificateReference ? (
            <Link
              href={`/certificate/${certificateReference}`}
              className="group flex flex-col items-center gap-1.5 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-yellow-500 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 text-yellow-900 shadow-sm">
                <Award className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="max-w-[6rem] text-center text-[11px] font-semibold leading-tight text-primary">
                {pick(copy.certificateNode, locale)}
              </span>
            </Link>
          ) : allComplete ? (
            <Link
              href="/labs/ctf/certificate"
              className="group flex flex-col items-center gap-1.5 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="flex h-11 w-11 shrink-0 animate-pulse items-center justify-center rounded-full border-2 border-yellow-500 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 text-yellow-900 shadow-sm">
                <Award className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="max-w-[6rem] text-center text-[11px] font-semibold leading-tight text-primary">
                {pick(copy.certificateNode, locale)}
              </span>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-1.5 p-1" title={pick(copy.certificateLockedHint, locale)}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border-strong bg-surface text-text-muted">
                <Lock className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="max-w-[6rem] text-center text-[11px] font-medium leading-tight text-text-muted">
                {pick(copy.certificateNode, locale)}
              </span>
            </div>
          )}
        </li>
      </ol>

      {allComplete && (
        <p className="mt-6 text-center">
          <Link
            href={certificateReference ? `/certificate/${certificateReference}` : "/labs/ctf/certificate"}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {certificateReference ? pick(copy.viewCta, locale) : pick(copy.claimCta, locale)}
          </Link>
        </p>
      )}
    </section>
  );
}
