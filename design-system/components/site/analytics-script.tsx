import Script from "next/script";

/**
 * Loads Plausible only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set, so
 * local development and this build environment (no analytics account
 * configured) don't send events anywhere. `strategy="afterInteractive"`
 * keeps it off the critical rendering path for the Lighthouse
 * performance budget.
 */
export function AnalyticsScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <Script
      strategy="afterInteractive"
      data-domain={domain}
      src="https://plausible.io/js/script.tagged-events.js"
    />
  );
}
