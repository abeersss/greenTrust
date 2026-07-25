"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Locale } from "@/lib/utils";

export interface LanguageSwitcherProps {
  locale: Locale;
  /** Caller supplies the actual navigation (e.g. next-intl's
   * useRouter().replace with the new locale) — this component only
   * renders the control, keeping it framework-routing-agnostic. */
  onLocaleChange: (locale: Locale) => void;
}

const labels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

/**
 * LanguageSwitcher — switching locale changes `dir`/`lang` on <html>
 * at the routing layer (app/[locale]/layout.tsx), not here; this
 * component is purely the trigger. Kept deliberately tiny: two
 * options, no search, since the platform only ships EN/AR (Section 6,
 * Phase 3 localization strategy — a third locale is a new enum value,
 * not a redesign of this control).
 */
export function LanguageSwitcher({ locale, onLocaleChange }: LanguageSwitcherProps) {
  return (
    <Select value={locale} onValueChange={(value) => onLocaleChange(value as Locale)}>
      <SelectTrigger aria-label="Change language" className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{labels.en}</SelectItem>
        <SelectItem value="ar">{labels.ar}</SelectItem>
      </SelectContent>
    </Select>
  );
}
