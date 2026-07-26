"use client";

import * as React from "react";
import { trackEvent } from "@/lib/analytics/track";

export interface PageViewTrackerProps {
  event: string;
  props?: Record<string, string | number | boolean>;
}

/**
 * Fires a single Plausible view event on mount for a server-rendered
 * page that has no other client component to hang analytics off of
 * (e.g. the GreenTrust and First Defender landing pages). A ref guard
 * keeps this to exactly one fire per mount even under React 18 Strict
 * Mode's dev-time double-invoke. Renders nothing.
 */
export function PageViewTracker({ event, props }: PageViewTrackerProps) {
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
