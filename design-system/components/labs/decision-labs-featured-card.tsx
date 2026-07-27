"use client";

import * as React from "react";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";

export interface DecisionLabsFeaturedCardProps {
  locale: AppLocale;
  href: string;
  icon: React.ReactNode;
  kicker: string;
  title: string;
  body: string;
  ctaLabel: string;
}

/**
 * The flagship featured banner for Decision Labs on the Labs landing
 * page (hierarchy directive, 2026-07-27). Split out as its own client
 * component, mirroring LabsTrackCard, because the parent LabsPage is
 * an async Server Component and cannot pass an inline onClick handler
 * directly to the Link (a Client Component) without a "use client"
 * boundary of its own; doing so previously broke the production build
 * with "Error: Event handlers cannot be passed to Client Component
 * props."
 */
export function DecisionLabsFeaturedCard({ locale, href, icon, kicker, title, body, ctaLabel }: DecisionLabsFeaturedCardProps) {
  function handleClick() {
    trackEvent("labs_category_clicked", { locale, category: "scenario" });
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="group block overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-surface p-8 shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 tablet:p-12"
    >
      <Badge variant="primary" className="mb-4">
        {kicker}
      </Badge>
      <div className="flex flex-col items-start gap-6 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            {icon}
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">{title}</h2>
            <p className="mt-2 max-w-xl text-text-secondary">{body}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform duration-fast group-hover:gap-3">
          {ctaLabel}
          <span aria-hidden="true">{locale === "ar" ? "←" : "→"}</span>
        </span>
      </div>
    </Link>
  );
}
