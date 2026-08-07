"use client";

import * as React from "react";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Homepage scrolling banner (CyberAbeer Platform Phase II). Shows the
 * founder-editable greeting (homepage_banner_settings, migration 013)
 * plus the visitor's current date, always computed client-side on
 * mount so it's the real "today" for whoever is looking at the page,
 * never a stale server-render/cache timestamp.
 *
 * Two things fixed here after live feedback:
 *
 * 1. Speed was a fixed CSS animation-duration shared by both locales.
 *    Because Arabic and English text (and repeat count x16) measure to
 *    different pixel widths, the same duration produced very different
 *    apparent speeds -- and once the greeting text got longer, the
 *    combined width made the sweep feel too fast no matter what fixed
 *    number we picked. Fixed duration now is *derived* from the
 *    measured rendered width of one repeated block divided by a
 *    constant target speed (px/sec), applied as an inline style. This
 *    keeps the felt speed identical regardless of language, text
 *    length, or future greeting edits from /founder/banner.
 *
 * 2. Arabic showed nothing at all. Root cause: the outer wrapper has
 *    dir="rtl" for Arabic, and .ticker-track is a wide (w-max) block
 *    box with no explicit position. In RTL, a block box wider than its
 *    container is anchored to its *right* edge with overflow clipped
 *    on the left, whereas the translateX(0) -> translateX(-50%)
 *    keyframes were written assuming the usual LTR anchoring (box
 *    pinned to the left, local x=0 at the visible start). Under RTL
 *    anchoring those same transform values shift the visible window
 *    past the end of the actual content for part of every cycle,
 *    which is why the bar sometimes rendered completely blank. Fix:
 *    force dir="ltr" on .ticker-track itself so its box is always
 *    left-anchored and the transform math is consistent, while the
 *    individual Arabic text spans still shape and read correctly
 *    right-to-left -- that's resolved per the Unicode Bidi Algorithm
 *    from the characters themselves, not from the container's dir.
 *    The wrapper keeps its real dir for semantics, and the sitewide
 *    `[dir="rtl"] .ticker-track` rule in globals.css still matches
 *    (it's an ancestor selector) so Arabic still sweeps in the
 *    reversed, natural-feeling direction.
 */
const REPEAT_COUNT = 16;
const TICKER_SPEED_PX_PER_SEC = 45;
const FALLBACK_DURATION_S = 60;

export function HomepageTicker({
  locale,
  greeting,
}: {
  locale: AppLocale;
  greeting: string;
}) {
  const [dateLabel, setDateLabel] = React.useState<string | null>(null);
  const [durationS, setDurationS] = React.useState(FALLBACK_DURATION_S);
  const groupRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const formatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setDateLabel(formatter.format(new Date()));
  }, [locale]);

  const text = dateLabel ? `${greeting}   •   ${dateLabel}` : greeting;
  const repeats = Array.from({ length: REPEAT_COUNT });

  React.useEffect(() => {
    const width = groupRef.current?.getBoundingClientRect().width;
    if (width && width > 0) {
      setDurationS(width / TICKER_SPEED_PX_PER_SEC);
    }
  }, [text]);

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="overflow-hidden border-b border-border bg-primary py-2 text-text-on-primary"
    >
      <span className="sr-only">{text}</span>
      <div
        dir="ltr"
        className="ticker-track flex w-max whitespace-nowrap text-sm font-medium"
        style={{ animationDuration: `${durationS}s` }}
        aria-hidden="true"
      >
        <span ref={groupRef} className="flex shrink-0 items-center">
          {repeats.map((_, i) => (
            <span key={`a-${i}`} className="px-6">
              {text}
            </span>
          ))}
        </span>
        <span className="flex shrink-0 items-center">
          {repeats.map((_, i) => (
            <span key={`b-${i}`} className="px-6">
              {text}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
