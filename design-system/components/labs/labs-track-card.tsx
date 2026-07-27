"use client";

import * as React from "react";
import { Link } from "@/lib/i18n/navigation";
import { trackEvent } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/i18n/config";

export type LabsTrackCategory = "scenario" | "ctf" | "quick_check";

export interface LabsTrackCardProps {
  locale: AppLocale;
  category: LabsTrackCategory;
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  ctaLabel: string;
  accent: "primary" | "accent" | "success";
}

const accentClasses: Record<LabsTrackCardProps["accent"], string> = {
  primary: "bg-primary-50 text-primary-700 group-hover:bg-primary-100",
  accent: "bg-accent/10 text-accent group-hover:bg-accent/20",
  success: "bg-success-50 text-success-600 group-hover:bg-success-100",
};

/**
* Production UX fix (2026-07-27): the three "learning mode" cards on
* the CyberAbeer Labs landing page previously rendered as plain,
* non-interactive Cards, even though the design made them look like
* navigation. This component is the fix: the entire card is a single
* Link, so there is exactly one interactive element and one tab stop
* per card, with a visible hover/focus-visible state on desktop and an
* active/pressed state on tap, driven by Tailwind's group and
* focus-visible utilities rather than JavaScript. Fires
* labs_category_clicked with the category for analytics.
*/
export function LabsTrackCard({ locale, category, href, icon, title, body, ctaLabel, accent }: LabsTrackCardProps) {
  function handleClick() {
    trackEvent("labs_category_clicked", { locale, category });
  }

return (
  <Link
    href={href}
    onClick={handleClick}
    className={cn(
      "group block rounded-lg border border-border bg-surface p-6 text-start",
      "shadow-sm transition-all duration-fast",
      "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md",
      "active:translate-y-0 active:shadow-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      )}
    >
  <div
    className={cn(
      "mb-4 flex h-11 w-11 items-center justify-center rounded-md transition-colors duration-fast",
      accentClasses[accent]
      )}
    >
    {icon}
  </div>
  <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
  <p className="mt-2 text-sm text-text-secondary">{body}</p>
  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform duration-fast group-hover:gap-2">
    {ctaLabel}
  <span aria-hidden="true">{locale === "ar" ? "←" : "→"}</span>
  </span>
  </Link>
  );
}
