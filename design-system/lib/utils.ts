import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard shadcn-style class combiner: clsx resolves conditional
 * classes, twMerge resolves conflicting Tailwind utilities (e.g. two
 * different `px-*` values) so the last one wins predictably instead of
 * both being emitted.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Brand = "cyberabeer" | "greentrust" | "labs";
export type ColorScheme = "light" | "dark";
export type Locale = "en" | "ar";

/** Central place components can import brand-conditional class logic
 * from, instead of re-deriving `data-brand` checks ad hoc. Most
 * components should NOT need this — brand differentiation should come
 * from the CSS tokens, not from JS branching. Reach for this only for
 * genuinely structural differences (e.g. Labs showing an XP strip that
 * GreenTrust never renders). */
export function isLabs(brand: Brand) {
  return brand === "labs";
}
export function isGreenTrust(brand: Brand) {
  return brand === "greentrust";
}

/** Formats a risk/status level into its token-backed color classes.
 * Centralized so RiskIndicator, StatusBadge, and chart legends can't
 * drift out of sync with each other. */
export const riskLevelClasses: Record<
  "low" | "medium" | "high" | "critical",
  { text: string; bg: string; dot: string }
> = {
  low: { text: "text-success-600", bg: "bg-success-50", dot: "bg-risk-low" },
  medium: { text: "text-warning-600", bg: "bg-warning-50", dot: "bg-risk-medium" },
  high: { text: "text-danger-600", bg: "bg-danger-50", dot: "bg-risk-high" },
  critical: { text: "text-white", bg: "bg-risk-critical", dot: "bg-risk-critical" },
};
