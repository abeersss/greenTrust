"use client";

import * as React from "react";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Homepage scrolling banner (CyberAbeer Platform Phase II). Shows the
 * founder-editable greeting (homepage_banner_settings, migration 013)
 * plus the visitor's current date, always computed client-side on
 * mount so it's the real "today" for whoever is looking at the page,
 * never a stale server-render/cache timestamp. The marquee motion is
 * a plain CSS animation (.ticker-track, styles/globals.css) already
 * covered by the sitewide prefers-reduced-motion rule there, so no
 * separate accessibility branch is needed here.
 *
 * The text is short (a greeting plus a date), so two copies of it
 * side by side don't come close to filling a wide viewport -- the
 * combined track ends up narrower than the bar itself, and the loop
 * only circulates through that narrow strip while the rest of the
 * bar sits empty (reported as "half round motion, not full
 * circulation"). The fix is to repeat the phrase enough times per
 * half that a single half's width comfortably exceeds any realistic
 * viewport, so the marquee always spans the full bar edge-to-edge
 * with no gap, however wide the screen or short the greeting. Two
 * identical halves back to back + translateX(-50%) keeps the loop
 * seamless, same technique as before, just with a wide-enough half.
 * Repeated content is nonsensical for screen readers, so the whole
 * visual track is aria-hidden and a single sr-only span carries the
 * real text once for assistive tech.
 */
const REPEAT_COUNT = 16;

export function HomepageTicker({
  locale,
  greeting,
}: {
  locale: AppLocale;
  greeting: string;
}) {
  const [dateLabel, setDateLabel] = React.useState<string | null>(null);

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

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="overflow-hidden border-b border-border bg-primary py-2 text-text-on-primary"
    >
      <span className="sr-only">{text}</span>
      <div className="ticker-track flex w-max whitespace-nowrap text-sm font-medium" aria-hidden="true">
        <span className="flex shrink-0 items-center">
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
