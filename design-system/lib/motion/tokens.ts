/**
 * Shared motion tokens for the CyberAbeer premium motion system.
 * These mirror the CSS custom properties in styles/tokens.css
 * (--duration-*, --ease-*) but expressed as JS numbers/arrays, since
 * framer-motion transition objects need numeric seconds and numeric
 * cubic-bezier arrays rather than CSS strings. Keep this file and
 * the "Motion" block in styles/tokens.css in sync if either changes.
 *
 * fast/base/slow correspond 1:1 to --duration-fast/base/slow (used
 * for hover/focus/UI-state transitions). hero/cinematic are new,
 * longer durations for entrance sequences and scroll-driven reveals.
 */
export const motionDuration = {
  fast: 0.12,
  base: 0.2,
  slow: 0.32,
  hero: 0.7,
  cinematic: 1.1,
} as const;

export type MotionDurationKey = keyof typeof motionDuration;

/**
 * standard/emphasized correspond to --ease-standard/--ease-emphasized.
 * outExpo and inOutSmooth are additional curves for premium entrance
 * and connector-draw animations (Sections 5 and 10 of the motion
 * spec) that the existing UI-state easings weren't designed for.
 */
export const motionEase = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.3, 0, 0, 1.4],
  outExpo: [0.16, 1, 0.3, 1],
  inOutSmooth: [0.65, 0, 0.35, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export type MotionEaseKey = keyof typeof motionEase;

/** Stagger step (seconds) used by StaggerGroup between child items. */
export const staggerStep = {
  tight: 0.05,
  base: 0.08,
  loose: 0.14,
} as const;

export type StaggerStepKey = keyof typeof staggerStep;

/** Default translate distances (px) used by Reveal. */
export const revealDistance = {
  sm: 12,
  base: 24,
  lg: 48,
} as const;
