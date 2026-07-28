import * as React from "react";

/**
 * Central medal symbols, one per achievement `key`. Only `phishingHunter`
 * is implemented (achievement 01) -- see catalog.ts for why the other
 * 11 intentionally have no entry here yet. Each symbol is drawn on a
 * 22x22 grid so it drops straight into <AchievementMedal>'s centered
 * `<g transform="translate(-11 -11)">` wrapper; stroke/fill use
 * `currentColor` so the medal component controls locked-vs-gold color.
 */
const SYMBOLS: Record<string, React.ReactNode> = {
  phishingHunter: (
    <svg viewBox="0 0 22 22" width="22" height="22" fill="none">
      <rect x="1" y="4" width="16" height="11" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M1 5.5 L9 11 L17 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16.5" cy="15.5" r="4.3" stroke="currentColor" strokeWidth="1.6" />
      <line x1="19.6" y1="18.6" x2="21.8" y2="20.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

export function getAchievementSymbol(key: string): React.ReactNode {
  return SYMBOLS[key] ?? null;
}
