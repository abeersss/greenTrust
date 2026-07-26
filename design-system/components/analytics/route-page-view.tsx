"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics/track";

/**
 * Fires a generic "page_view" event on every route change, including
 * client-side navigations Plausible's own automatic pageview script
 * would otherwise miss under the App Router's soft navigation. Mounted
 * once in the root locale layout (app/[locale]/layout.tsx) so it
 * covers every route without each page adding its own tracker; the
 * two page-specific PageViewTracker instances (challenge_viewed,
 * greentrust_viewed) fire alongside this, not instead of it.
 */
export function RoutePageView() {
  const pathname = usePathname();
  const lastPath = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackEvent("page_view", { path: pathname });
  }, [pathname]);

  return null;
}
