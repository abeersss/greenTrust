"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/lib/i18n/navigation";

const MASCOT_SRC = `/mascot/${encodeURIComponent(
  "A cute green agile character with robot-like features but more organic and playful, funny looking with cybersecurity theme, animated movement, friendly and approachable design, tech-inspired but not fully robotic.mp4"
)}`;

// Every route this recurring mascot should appear on: all Decision
// Labs and CTF challenge pages (both live under /labs and /challenge),
// plus the achievements and account pages, per the founder's explicit
// "small recurring mascot across all Labs/CTF screens" placement
// choice (2026-08-03).
const MASCOT_ROUTE_PREFIXES = ["/labs", "/challenge", "/achievements", "/account"];

// How long the mascot stays visible after each navigation into/within
// these routes, in milliseconds, before fading back out. Per the
// founder's follow-up instruction (2026-08-03): the mascot should only
// appear during transitions between labs/CTF challenges/knowledge
// questions -- i.e. briefly on each route change -- not persist on
// screen for the entire time someone is reading a briefing or working
// a challenge. 2.5s is enough to register as a deliberate appearance
// without lingering over actual gameplay.
const VISIBLE_DURATION_MS = 2500;

/**
 * CyberAbeer Labs mascot (2026-08-03, founder-supplied asset; original
 * creative work by Dr. Abeer Alshammari, founder of CyberAbeer). A
 * small looping video badge fixed to the corner of the screen,
 * rendered once here in the root layout rather than wired into every
 * individual lab/challenge page -- it shows itself briefly on each
 * route change within Labs/CTF/achievements/account and then fades
 * out, rather than staying pinned on screen the whole time (fixed
 * 2026-08-03 per founder feedback that it should only appear during
 * transitions, not persist throughout). New labs and CTF challenges
 * automatically pick up this behavior with zero per-page changes,
 * since it keys off the shared route-level pathname rather than any
 * per-lab screen state.
 *
 * The uploaded filename is kept verbatim (not renamed) for the same
 * traceability reason as the site identity song and the Labs/CTF win
 * sound; it has spaces, so it's referenced through
 * encodeURIComponent rather than a literal path.
 */
export function LabsMascot() {
  const pathname = usePathname();
  const inScope = MASCOT_ROUTE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!inScope) {
      setVisible(false);
      return;
    }
    setVisible(true);
    hideTimer.current = setTimeout(() => setVisible(false), VISIBLE_DURATION_MS);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // Re-run on every pathname change so navigating between labs, CTF
    // challenges, or knowledge-check questions re-triggers a fresh
    // transition appearance instead of only firing once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, inScope]);

  if (!inScope) return null;

  return (
    <video
      src={MASCOT_SRC}
      autoPlay
      muted
      loop
      playsInline
      title="CyberAbeer Labs mascot — created by Dr. Abeer Alshammari"
      aria-hidden="true"
      className={`fixed bottom-20 z-toast h-16 w-16 rounded-full border-2 border-border bg-surface object-cover shadow-lg transition-opacity duration-500 [inset-inline-end:1rem] tablet:h-20 tablet:w-20 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    />
  );
}
