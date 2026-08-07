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
 * separate accessibility branch is needed here. Content is rendered
 * twice back to back so the translateX(-50%) loop is seamless; the
 * second copy is aria-hidden since it's a visual duplicate, not new
 * information.
 */
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

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="overflow-hidden border-b border-border bg-primary py-2 text-text-on-primary"
    >
      <div className="ticker-track flex w-max whitespace-nowrap text-sm font-medium">
        <span className="flex items-center px-6">{text}</span>
        <span className="flex items-center px-6" aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  );
}
