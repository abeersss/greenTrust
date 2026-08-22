"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { X } from "lucide-react";
import { usePathname } from "@/lib/i18n/navigation";
import { pick } from "@/lib/challenges/bilingual";
import { useMascotDisplayedHint } from "@/lib/mascot/mascot-context";
import { getRouteHint } from "@/lib/mascot/route-hints";
import { playMascotBubbleSound } from "@/lib/mascot/bubble-sound";
import type { AppLocale } from "@/lib/i18n/config";
import type { Book } from "@/lib/books/books";

const MASCOT_SRC = `/mascot/${encodeURIComponent(
  "A cute green agile character with robot-like features but more organic and playful, funny looking with cybersecurity theme, animated movement, friendly and approachable design, tech-inspired but not fully robotic.mp4"
)}`;

// Every route this recurring mascot should appear on: all Decision
// Labs and CTF challenge pages (both live under /labs and /challenge),
// plus the achievements and account pages, per the founder's explicit
// "small recurring mascot across all Labs/CTF screens" placement
// choice (2026-08-03).
const MASCOT_ROUTE_PREFIXES = ["/labs", "/challenge", "/achievements", "/account"];

// 2026-08-22 (founder request: "the mascot show the lab book first to
// direct user to buy"): localStorage guard so the auto-opening book
// promo bubble (below) only ever interrupts a given browser once. Every
// later visit, and every later tap in the same visit, falls straight
// through to the normal tap-to-explain hint behavior.
const BOOK_PROMO_SEEN_KEY = "cyberabeer_mascot_book_promo_seen_v1";

/**
 * CyberAbeer Labs mascot (2026-08-03, founder-supplied asset; original
 * creative work by Dr. Abeer Alshammari, founder of CyberAbeer).
 *
 * 2026-08-04 update (founder request): the mascot is now interactive.
 * Tapping it opens a small speech-bubble with a brief, plain-language
 * explanation of the concept behind whatever lab, CTF challenge, or
 * knowledge-check question is currently on screen. That explanation
 * comes from one of two sources:
 * 1. A "live" hint registered by the current page itself via
 *    useMascotHint() (see lib/mascot/mascot-context.tsx) -- used
 *    where a page wants the explanation to change as the learner
 *    moves through stages/questions within it.
 * 2. A static per-route fallback (lib/mascot/route-hints.ts) --
 *    used everywhere else, so every lab/CTF/knowledge-check page
 *    has *some* explanation available even before it's wired up
 *    for stage-by-stage hints.
 *
 * The mascot stays visible and tappable at all times on in-scope
 * routes (earlier revision faded it out and disabled pointer events
 * after 2.5s, which silently broke the whole point of this feature --
 * there was nothing left on screen to tap). The bubble auto-closes on
 * navigation so it doesn't carry a stale explanation into the next
 * page.
 *
 * 2026-08-04 (later, founder feedback: "have sound not picture"):
 * tapping the mascot now plays a small synthesized "bubble pop" sound
 * (playMascotBubbleSound, lib/mascot/bubble-sound.ts) the moment the
 * explanation bubble opens -- the character itself is unchanged
 * (still the founder-supplied video), but the *interaction* now has
 * an audible cue instead of being a purely visual tap. Only fires when
 * opening the bubble, not when dismissing it, and fails silently if
 * the browser blocks audio, so it never gets in the way of the
 * bubble's actual job of showing the hint.
 *
 * 2026-08-04 (later still, founder feedback: a screenshot showed
 * Chrome's built-in "hover to pop out" picture-in-picture icon
 * appearing over the mascot's video on hover): disablePictureInPicture
 * (plus a matching CSS fallback that hides the -webkit PiP button for
 * older engines) turns that off, since it's a browser chrome affordance
 * for pausable/seekable video, not something this always-looping,
 * silent, decorative avatar should ever expose.
 *
 * 2026-08-22 (founder request: "the mascot show the lab book first to
 * direct user to buy"): the mascot now takes a `book` prop (the
 * founder's lab book, fetched server-side in the root layout via
 * getPublishedBooks() so this stays a client component with no direct
 * Supabase access). The very first time a visitor lands on any
 * in-scope route, the mascot opens on its own after a short beat,
 * showing the book's cover, title, a one-line pitch, and a "Get the
 * book" link out to Amazon -- instead of waiting to be tapped. This
 * fires once per browser (BOOK_PROMO_SEEN_KEY) and never again;
 * everything below it (tap-to-explain hints) is unchanged.
 *
 * Rendered once in the root layout rather than per-page; new labs and
 * CTF challenges automatically get a working (if generic) explanation
 * the moment they're added to route-hints.ts, with zero per-page
 * wiring required.
 */
export function LabsMascot({ book }: { book: Book | null }) {
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const inScope = MASCOT_ROUTE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [showingPromo, setShowingPromo] = useState(false);
  const liveHint = useMascotDisplayedHint();

  useEffect(() => {
    setBubbleOpen(false);
    setShowingPromo(false);
  }, [pathname]);

  // Auto-open the book promo once per browser. Deliberately does not
  // depend on `pathname` beyond the initial in-scope check -- the
  // localStorage guard, not a route change, is what prevents repeats.
  useEffect(() => {
    if (!inScope || !book) return;
    let seen = true;
    try {
      seen = Boolean(window.localStorage.getItem(BOOK_PROMO_SEEN_KEY));
    } catch {
      return;
    }
    if (seen) return;

    const timer = window.setTimeout(() => {
      setShowingPromo(true);
      setBubbleOpen(true);
      playMascotBubbleSound();
      try {
        window.localStorage.setItem(BOOK_PROMO_SEEN_KEY, "1");
      } catch {
        // Private browsing / storage disabled -- fine, it just means
        // this can show again on a future visit in that session.
      }
    }, 1200);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inScope, book]);

  if (!inScope) return null;

  const hint = liveHint ?? getRouteHint(pathname ?? "");

  function handleToggle() {
    setBubbleOpen((open) => {
      const next = !open;
      if (next) {
        setShowingPromo(false);
        playMascotBubbleSound();
      }
      return next;
    });
  }

  function closeBubble() {
    setBubbleOpen(false);
    setShowingPromo(false);
  }

  return (
    <div className="fixed bottom-20 z-toast [inset-inline-end:1rem]">
      {bubbleOpen && showingPromo && book ? (
        <div
          role="dialog"
          aria-label={book.title}
          className="absolute bottom-full end-0 mb-3 w-64 rounded-xl border border-border bg-surface p-4 text-start shadow-xl tablet:w-72"
        >
          <button
            type="button"
            onClick={closeBubble}
            aria-label={locale === "ar" ? "إغلاق" : "Close"}
            className="absolute end-2 top-2 rounded-full p-1 text-text-muted transition-colors hover:bg-border/40 hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <p className="pe-6 text-[11px] font-semibold uppercase tracking-wide text-primary">
            {locale === "ar" ? "قبل أن تبدأ" : "Before you dive in"}
          </p>
          {book.imageUrls[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.imageUrls[0]}
              alt={book.title}
              className="mt-2 h-24 w-auto rounded-md border border-border object-cover shadow-sm"
            />
          ) : null}
          <p className="mt-2 text-sm font-semibold text-text-primary">{book.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            {locale === "ar"
              ? "رفيقك الورقي لمختبرات CyberAbeer، بتمارين عملية خطوة بخطوة."
              : "The hands-on companion to these labs — work the exercises on paper too."}
          </p>
          <a
            href={book.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold text-text-on-primary transition-colors hover:opacity-90"
          >
            {locale === "ar" ? "احصل على الكتاب" : "Get the book"}
          </a>
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 end-6 h-3 w-3 rotate-45 border-b border-e border-border bg-surface"
          />
        </div>
      ) : bubbleOpen ? (
        <div
          role="dialog"
          aria-label={pick(hint.title, locale)}
          className="absolute bottom-full end-0 mb-3 w-64 rounded-xl border border-border bg-surface p-4 text-start shadow-xl tablet:w-72"
        >
          <button
            type="button"
            onClick={closeBubble}
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
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
          title="CyberAbeer Labs mascot — created by Dr. Abeer Alshammari"
          aria-hidden="true"
          className="h-16 w-16 rounded-full border-2 border-border bg-surface object-cover shadow-lg tablet:h-20 tablet:w-20 [&::-webkit-media-controls-picture-in-picture-button]:hidden [&::-webkit-media-controls]:hidden"
        />
      </button>
    </div>
  );
}
