import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { FounderSidebar } from "@/components/founder/founder-sidebar";
import { LogoutButton } from "@/components/account/logout-button";

// Founder tooling is internal, not public content -- never indexed,
// regardless of what any individual /founder page's own metadata
// says.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

/**
 * Auth-gated layout for every /founder route (CyberAbeer Platform
 * Phase II, Phase 1: "Founder auth gate + DB schema + bare dashboard
 * shell"). requireFounder() redirects away anyone who isn't signed
 * in as the platform_role = admin account before rendering anything
 * below it, so individual /founder pages never need to repeat the
 * check themselves.
 */
export default async function FounderLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!isAppLocale(locale)) notFound();
    const l = locale as AppLocale;

  await requireFounder(l);

  return (
        <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col gap-8 px-4 py-10 tablet:flex-row tablet:px-6">
              <FounderSidebar locale={l} />
              <div className="min-w-0 flex-1">
                      <div className="mb-6 flex items-center justify-end">
                                <LogoutButton label="Log out" />
                      </div>
                {children}
              </div>
        </div>
      );
}
