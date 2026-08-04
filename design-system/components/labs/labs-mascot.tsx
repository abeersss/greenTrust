"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { X } from "lucide-react";
import { usePathname } from "@/lib/i18n/navigation";
import { pick } from "@/lib/challenges/bilingual";
import { useMascotDisplayedHint } from "@/lib/mascot/mascot-context";
import { getRouteHint } from "@/lib/mascot/route-hints";
import type { AppLocale } from "@/lib/i18n/config";

const MASCOT_SRC = `/mascot/${encodeURIComponent(
  "A cute green agile character with robot-like features but more organic and playful, funny looking with cybersecurity theme, animated movement, friendly and approachable design, tech-inspired but not fully robotic.mp4"
)}`;

// Every route this recurring mascot should appear on: all Decision
// Labs and CTF challenge pages (both live under /labs and /challenge),
// plus the achievements and account pages, per the founder's explicit
// "small recurring mascot across all Labs/CTF screens" placement
// choice (2026-08-03).
const MASCOT_ROUTE_PREFIXES = ["/labs", "/challenge", "/achievements", "/account"];

/**
 * CyberAbeer Labs mascot (2026-08-03, founder-supplied asset; original
 * creative work by Dr. Abeer Alshammari, founder of CyberAbeer).
 *
 * 2026-08-04 update (founder request): the mascot is now interactive.
 * Tapping it opens a small speech-bubble with a brief, plain-language
 * explanation of the concept behind whatever lab, CTF challenge, or
 * knowledge-check question is currently on screen. That explanation
 * comes from one of two sources:
 *   1. A "live" hint registered by the current page itself via
 *      useMascotHint() (see lib/mascot/mascot-context.tsx) -- used
 *      where a page wants the explanation to change as the learner
 *      moves through stages/questions within it.
 *   2. A static per-route fallback (lib/mascot/route-hints.ts) --
 *      used everywhere else, so every lab/CTF/knowledge-check page
 *      has *some* explanation available even before it's wired up
 *      for stage-by-stage hints.
 *
 * The mascot stays visible and tappable at all times on in-scope
 * routes (earlier revision faded it out and disabled pointer events
 * after 2.5s, which silently broke the whole point of this feature --
 * there was nothing left on screen to tap). The bubble auto-closes on
 * navigation so it doesn't carry a stale explanation into the next
 * page.
 *
 * Rendered once in the root layout rather than per-page; new labs and
 * CTF challenges automatically get a working (if generic) explanation
 * the moment they're added to route-hints.ts, with zero per-page
 * wiring required.
 */
export function LabsMascot() {
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const inScope = MASCOT_ROUTE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const liveHint = useMascotDisplayedHint();

  useEffect(() => {
    setBubbleOpen(false);
  }, [pathname]);

  if (!inScope) return null;

  const hint = liveHint ?? getRouteHint(pathname ?? "");

  function handleToggle() {
    setBubbleOpen((open) => !open);
  }

  return (
    <div className="fixed bottom-20 z-toast [inset-inline-end:1rem]">
      {bubbleOpen ? (
        <div
          role="dialog"
          aria-label={pick(hint.title, locale)}
          className="absolute bottom-full end-0 mb-3 w-64 rounded-xl border border-border bg-surface p-4 text-start shadow-xl tablet:w-72"
        >
          <button
            type="button"
            onClick={() => setBubbleOpen(false)}
            aria-label={locale === "ar" ? "إغلاق" : "Close"}
            className="absolute end-2 top-2 rounded-full p-1 text-text-muted transition-colors hover:bg-border/40 hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <p className="pe-6 text-sm font-semibold text-text-primary">{pick(hint.title, locale)}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{pick(hint.body, locale)}</p>
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 end-6 h-3 w-3 rotate-45 border-b border-e border-border bg-surface"
          />
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleToggle}
        aria-label={locale === "ar" ? "اسأل مرشد المختبرات" : "Ask the Labs guide"}
        aria-expanded={bubbleOpen}
        className="block rounded-full shadow-lg transition-transform hover:scale-105"
      >
        <video
          src={MASCOT_SRC}
          autoPlay
          muted
          loop
          playsInline
          title="CyberAbeer Labs mascot — created by Dr. Abeer Alshammari"
          aria-hidden="true"
          className="h-16 w-16 rounded-full border-2 border-border bg-surface object-cover shadow-lg tablet:h-20 tablet:w-20"
        />
      </button>
    </div>
  );
}
