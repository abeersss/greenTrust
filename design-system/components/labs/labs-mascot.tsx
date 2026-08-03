"use client";

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

/**
 * CyberAbeer Labs mascot (2026-08-03, founder-supplied asset; original
 * creative work by Dr. Abeer Alshammari, founder of CyberAbeer). A
 * small looping video badge fixed to the corner of the screen,
 * rendered once here in the root layout rather than wired into every
 * individual lab/challenge page -- it shows or hides itself based on
 * the current route, so new labs and CTF challenges automatically
 * pick it up with zero per-page changes.
 *
 * The uploaded filename is kept verbatim (not renamed) for the same
 * traceability reason as the site identity song and the Labs/CTF win
 * sound; it has spaces, so it's referenced through
 * encodeURIComponent rather than a literal path.
 */
export function LabsMascot() {
  const pathname = usePathname();
  const shouldShow = MASCOT_ROUTE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  if (!shouldShow) return null;

  return (
    <video
      src={MASCOT_SRC}
      autoPlay
      muted
      loop
      playsInline
      title="CyberAbeer Labs mascot — created by Dr. Abeer Alshammari"
      aria-hidden="true"
      className="fixed bottom-20 z-toast h-16 w-16 rounded-full border-2 border-border bg-surface object-cover shadow-lg [inset-inline-end:1rem] tablet:h-20 tablet:w-20"
    />
  );
}
