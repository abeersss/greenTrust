import * as React from "react";

/**
 * Central medal symbols, one per achievement `key`. Implemented for
 * every achievement that currently has a live challenge behind it
 * (phishingHunter, networkGuardian, socNightShift, dataGuardian,
 * grcStrategist, agentZero) -- see catalog.ts for why the remaining
 * entries intentionally have no symbol here yet. Each symbol is drawn
 * on a 22x22 grid so it drops straight into <AchievementMedal>'s
 * centered `<g transform="translate(-11 -11)">` wrapper; stroke/fill
 * use `currentColor` so the medal component controls locked-vs-gold
 * color.
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
  networkGuardian: (
    <svg viewBox="0 0 22 22" width="22" height="22" fill="none">
      <path
        d="M11 1.2 L18.5 4 V9.6 C18.5 14.6 15.4 18.5 11 20.3 C6.6 18.5 3.5 14.6 3.5 9.6 V4 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="7" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="15" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <line x1="10.1" y1="9.1" x2="7.8" y2="12.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="11.9" y1="9.1" x2="14.2" y2="12.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  socNightShift: (
    <svg viewBox="0 0 22 22" width="22" height="22" fill="none">
      <rect x="1.5" y="3" width="19" height="12.5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <line x1="7.5" y1="19" x2="14.5" y2="19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="11" y1="15.5" x2="11" y2="19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M15.2 6 A3.7 3.7 0 1 0 15.6 12.9 A4.7 4.7 0 0 1 15.2 6 Z"
        fill="currentColor"
      />
    </svg>
  ),
  dataGuardian: (
    <svg viewBox="0 0 22 22" width="22" height="22" fill="none">
      <rect x="4.5" y="9.5" width="13" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 9.5 V6.8 a3.5 3.5 0 0 1 7 0 V9.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <line x1="8" y1="13.6" x2="14" y2="13.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="8" y1="16.1" x2="14" y2="16.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  grcStrategist: (
    <svg viewBox="0 0 22 22" width="22" height="22" fill="none">
      <circle cx="11" cy="3.2" r="1" fill="currentColor" />
      <line x1="11" y1="4.2" x2="11" y2="15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="4" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="4" y1="6" x2="4" y2="10.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="18" y1="6" x2="18" y2="10.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M1.3 10.3 A2.7 2.7 0 0 0 6.7 10.3 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15.3 10.3 A2.7 2.7 0 0 0 20.7 10.3 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.5 17 H15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 15.4 L11 17.6 L13 15.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  /**
   * Agent Zero (09): a contained AI agent -- a small robot/circuit head
   * inside a shield outline, with a padlock-like antenna at the shield's
   * point to read as "an autonomous agent that has been locked down."
   * Geometry mirrors the other symbols' simple stroked primitives
   * (rect, circle, path) on the same 22x22 grid, with the same 1.6
   * stroke weight for the main shapes.
   */
  agentZero: (
    <svg viewBox="0 0 22 22" width="22" height="22" fill="none">
      <path
        d="M11 1.2 L19.5 4.4 V10.4 C19.5 15.6 15.9 19.3 11 20.8 C6.1 19.3 2.5 15.6 2.5 10.4 V4.4 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="7.3" y="8.1" width="7.4" height="6.2" rx="1.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 8.1 V6.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="5" r="1.1" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9.4" cy="11.1" r="0.9" fill="currentColor" />
      <circle cx="12.6" cy="11.1" r="0.9" fill="currentColor" />
      <path d="M5.6 12.3 H7.3 M14.7 12.3 H16.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
};

export function getAchievementSymbol(key: string): React.ReactNode {
  return SYMBOLS[key] ?? null;
}
