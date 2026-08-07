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
 * Speed: duration is *derived* from the measured rendered width of one
 * repeated block divided by a constant target px/sec, applied as an
 * inline style, so the felt speed is identical regardless of language,
 * text length, or future greeting edits from /founder/banner.
 *
 * RTL bug (root-caused this round): a first attempt put dir="ltr"
 * directly on .ticker-track, which didn't fix Arabic -- the bar stayed
 * blank. Reason: how a wide, overflowing block child is anchored
 * (left edge pinned vs. right edge pinned, which side clips) is
 * decided by its *parent's* direction, not the child's own dir
 * attribute. The parent here is this component's outer bar div, which
 * was dir="rtl" for Arabic, so the track (a block wider than its
 * container) was still right-anchored no matter what dir the track
 * itself carried -- the translateX(0)->translateX(-50%) keyframes,
 * written assuming left-anchoring, ended up pointing at empty space
 * outside the actual content for part of every cycle.
 *
 * Fix: the outer bar div is now unconditionally dir="ltr", so the
 * anchoring is always the left-pinned kind our transform math expects,
 * in both languages. This doesn't break Arabic: the individual text
 * spans still shape and read correctly right-to-left (that's resolved
 * per the Unicode Bidi Algorithm from the characters themselves, not
 * from an ancestor's dir), and the sitewide `[dir="rtl"] .ticker-track`
 * rule in globals.css still matches for Arabic because `<html dir="rtl">`
 * is set at the document root for the ar locale -- an ancestor further
 * up than this component, unaffected by what we do locally here -- so
 * the reversed, natural-feeling sweep direction is untouched.
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
      dir="ltr"
      className="overflow-hidden border-b border-border bg-primary py-2 text-text-on-primary"
    >
      <span className="sr-only" dir={locale === "ar" ? "rtl" : "ltr"}>
        {text}
      </span>
      <div
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
