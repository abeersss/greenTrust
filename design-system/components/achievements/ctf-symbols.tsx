import * as React from "react";

/**
 * Central medal symbols for the CTF achievement track, one per
 * category (web, forensics, crypto) -- mirrors the shape of
 * achievement-symbols.tsx exactly: each glyph is drawn on the same
 * 22x22 grid so it drops straight into <AchievementMedal>'s centered
 * `<g transform="translate(-11 -11)">` wrapper, and stroke/fill use
 * `currentColor` so the medal component controls locked-vs-gold color.
 * The two challenges in each category (e.g. the two "web" CTF
 * challenges) intentionally share the same category glyph -- the
 * medal's own number ("CTF 1" vs "CTF 2") is what tells them apart,
 * same as how two Labs medals are told apart by number, not symbol.
 */
const CTF_SYMBOLS: Record<"web" | "forensics" | "crypto", React.ReactNode> = {
  web: (
    <svg viewBox="0 0 22 22" width="22" height="22" fill="none">
      <circle cx="11" cy="11" r="9.3" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="11" cy="11" rx="3.6" ry="9.3" stroke="currentColor" strokeWidth="1.4" />
      <line x1="1.7" y1="11" x2="20.3" y2="11" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.9 6.5 H19.1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M2.9 15.5 H19.1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  ),
  forensics: (
    <svg viewBox="0 0 22 22" width="22" height="22" fill="none">
      <circle cx="9" cy="9" r="6.4" stroke="currentColor" strokeWidth="1.7" />
      <line x1="13.6" y1="13.6" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.2 9 L8.3 11 L12.2 6.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  crypto: (
    <svg viewBox="0 0 22 22" width="22" height="22" fill="none">
      <circle cx="7" cy="7.5" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7" cy="7.5" r="1.3" fill="currentColor" />
      <line x1="10" y1="10.5" x2="19.5" y2="20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="14.8" y1="15.3" x2="17.2" y2="12.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17.3" y1="17.8" x2="19.5" y2="15.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export function getCtfAchievementSymbol(category: "web" | "forensics" | "crypto"): React.ReactNode {
  return CTF_SYMBOLS[category] ?? null;
}
