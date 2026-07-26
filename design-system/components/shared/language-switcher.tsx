"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/utils";

export interface LanguageSwitcherProps {
  locale: Locale;
  /** Caller supplies the actual navigation (e.g. next-intl's
   * useRouter().replace with the new locale) - this component only
   * renders the control, keeping it framework-routing-agnostic. */
  onLocaleChange: (locale: Locale) => void;
}

const labels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

const otherLocale: Record<Locale, Locale> = {
  en: "ar",
  ar: "en",
};

/**
 * LanguageSwitcher - a single toggle, not a dropdown showing the
 * current selection: the visible label is always the *other*
 * language's own name (e.g. "العربية" while reading the English
 * site, "English" while reading the Arabic site), since that's the
 * language a click switches you to. Showing the current locale's own
 * name here (as a normal <Select> would) reads as "this button does
 * nothing" to a visitor who already knows what language they're on.
 * Switching locale changes `dir`/`lang` on <html> at the routing
 * layer (app/[locale]/layout.tsx), not here; this component is
 * purely the trigger.
 */
export function LanguageSwitcher({ locale, onLocaleChange }: LanguageSwitcherProps) {
  const target = otherLocale[locale];
  return (
    <button
      type="button"
      onClick={() => onLocaleChange(target)}
      aria-label={`Switch language to ${labels[target]}`}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-control border border-border-strong",
        "bg-surface px-3 text-sm text-text-primary",
        "hover:bg-neutral-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
      )}
    >
      <Languages className="h-4 w-4 opacity-60" aria-hidden="true" />
      {labels[target]}
    </button>
  );
}
