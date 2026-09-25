"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/shared/navbar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/actions/auth";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Public-site navigation. Wraps the design system's brand-agnostic
 * Navbar with real routes, active-link detection, the locale switcher,
 * theme toggle, and auth entry points. Login/Register are plain
 * buttons rather than part of the primary nav item list, matching the
 * IA from the Phase 1 blueprint (auth is a distinct, secondary action).
 *
 * `isAuthenticated` is resolved server-side once, in the root
 * `[locale]/layout.tsx`, and passed down as a plain prop (production
 * auth-recovery fix, 2026-07-29: this header previously never
 * reflected auth state at all, always showing "Log in"/"Register"
 * even to a signed-in user). Because the parent layout re-renders on
 * every navigation and full page load, this prop is correct after
 * login, logout, a hard refresh, and direct navigation to any route,
 * without this component needing its own client-side session check.
 *
 * Duplicate-nav fix (2026-08-03): the authenticated actions area used
 * to render its own "My Labs" button pointing at /labs, right next to
 * the main nav's "CyberAbeer Labs" item which points at the exact
 * same route -- so a signed-in visitor saw two separate labs links in
 * the header doing the same thing. Removed the redundant one; "My
 * account" + "Log out" is the only auth-specific state that belongs
 * here, since Labs already has its permanent home in the main nav for
 * every visitor, logged in or not.
 *
 * Mobile-nav fix (2026-08-14): the shared Navbar previously had no
 * mobile counterpart at all (the whole <nav> was `hidden` below the
 * desktop breakpoint), so no nav item -- including Books, which was
 * additionally buried in a hover-only "Insights" flyout with no touch
 * equivalent -- was reachable on phones/tablets. `renderMobileLink`
 * below flattens every item (and its children) into a tappable list
 * for the new hamburger-triggered mobile panel in Navbar.
 *
 * TrustCheck AI link (2026-09-25, corrected same day): added an
 * external entry under "For Organizations" pointing at the static
 * /trustlab section (TrustCheck AI risk assessment, Scam Analyzer, AI
 * Governance Check). Brand architecture: CyberAbeer is the parent
 * brand; GreenTrust AI is the existing, separate enterprise AI
 * governance/GRC product and is NOT touched by this section;
 * TrustCheck AI is the new free cybersecurity assessment product for
 * small businesses and individuals, positioned as a CyberAbeer
 * Research Lab initiative. The nav label was corrected from an
 * earlier "CyberAbeer TrustLab" working name to "TrustCheck AI" so it
 * never reads as the same product as GreenTrust AI. The URL stays at
 * /trustlab/ (technical slug only, not shown to visitors as a brand
 * name) to avoid breaking the already-live link. Same `external: true`
 * pattern already used for the OOP Learning Lab under Labs, since
 * /trustlab is a self-contained static HTML section rather than a
 * Next.js route.
 *
 * Labs submenu regroup (2026-09-25): the Labs dropdown now shows 3
 * items -- "CyberAbeer Decision Labs" (the flagship gamified-learning
 * hub at /labs/decision-labs) as a direct link, and a "Dr. Abeer
 * Training Labs" group that opens a second-level flyout containing
 * "OOP Learning Lab" (and is the designated home for future live
 * training content taught by Dr. Abeer). The shared Navbar component's
 * NavItem type only renders one level of children on its own, so this
 * component's renderLink/renderMobileLink closures now handle the
 * second level themselves: a child with its own `children` array
 * renders as a non-navigating trigger (group/sub hover on desktop,
 * always-expanded indent on mobile) instead of a plain Link, exactly
 * mirroring the top-level dropdown pattern one level deeper.
 */
export function SiteNavbar({ locale, isAuthenticated }: { locale: AppLocale; isAuthenticated: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutUser();
    router.push("/");
    router.refresh();
  }

  const items = [
    { label: t("home"), href: "/" },
    { label: t("about"), href: "/about" },
    {
      label: t("forOrganizations"),
      href: "/for-organizations",
      children: [
        { label: t("greentrust"), href: "/greentrust" },
        { label: t("freeTools"), href: "/free-tools" },
        {
          label: locale === "ar" ? "تراست تشيك AI" : "TrustCheck AI",
          href: "/trustlab/index.html",
          external: true,
        },
      ],
    },
    {
      label: t("labs"),
      href: "/labs",
      children: [
        {
          label: locale === "ar" ? "مختبرات القرار من سايبر أبير" : "CyberAbeer Decision Labs",
          href: "/labs/decision-labs",
        },
        {
          label: locale === "ar" ? "مختبرات التدريب مع د. عبير" : "Dr. Abeer Training Labs",
          href: "/oop-lab/index.html",
          children: [
            {
              label: locale === "ar" ? "مختبر البرمجة الكائنية" : "OOP Learning Lab",
              href: "/oop-lab/index.html",
              external: true,
            },
          ],
        },
      ],
    },
    {
      label: t("insights"),
      href: "/insights",
      children: [
        { label: t("research"), href: "/research" },
        { label: t("learn"), href: "/learn" },
        { label: t("intelligence"), href: "/intelligence" },
        { label: t("books"), href: "/books" },
      ],
    },
    { label: t("contact"), href: "/contact" },
  ].map((item) => ({
    ...item,
    active:
      pathname === item.href ||
      Boolean(
        item.children?.some(
          (child) => pathname === child.href || Boolean(child.children?.some((gc) => pathname === gc.href))
        )
      ),
  }));

  return (
    <Navbar
      logo={<Link href="/">CyberAbeer</Link>}
      items={items}
      mobileMenuLabel={locale === "ar" ? "القائمة" : "Menu"}
      renderLink={(item) => {
        const children = item.children;
        const linkClassName =
          "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary" +
          (item.active ? " bg-neutral-100 text-text-primary" : "");

        if (!children || children.length === 0) {
          return (
            <Link href={item.href} aria-current={item.active ? "page" : undefined} className={linkClassName}>
              {item.label}
            </Link>
          );
        }

        return (
          <div className="group relative">
            <Link href={item.href} aria-current={item.active ? "page" : undefined} className={linkClassName}>
              {item.label}
              <ChevronDown
                className="h-3.5 w-3.5 transition-transform duration-fast group-hover:rotate-180 group-focus-within:rotate-180"
                aria-hidden="true"
              />
            </Link>
            <div className="invisible absolute start-0 top-full z-dropdown mt-1 min-w-[12rem] rounded-card border border-border bg-surface p-1 opacity-0 shadow-lg transition-opacity duration-fast group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {children.map((child) => {
                const grandchildren = child.children;
                if (grandchildren && grandchildren.length > 0) {
                  return (
                    <div key={child.href} className="group/sub relative">
                      <div className="flex cursor-default items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary">
                        {child.label}
                        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                      </div>
                      <div className="invisible absolute start-full top-0 z-dropdown ms-1 min-w-[12rem] rounded-card border border-border bg-surface p-1 opacity-0 shadow-lg transition-opacity duration-fast group-hover/sub:visible group-hover/sub:opacity-100">
                        {grandchildren.map((grandchild) =>
                          grandchild.external ? (
                            <a
                              key={grandchild.href}
                              href={grandchild.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary"
                            >
                              {grandchild.label}
                            </a>
                          ) : (
                            <Link
                              key={grandchild.href}
                              href={grandchild.href}
                              className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary"
                            >
                              {grandchild.label}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  );
                }

                return child.external ? (
                  <a
                    key={child.href}
                    href={child.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary"
                  >
                    {child.label}
                  </a>
                ) : (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary"
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      }}
      renderMobileLink={(item) => {
        const children = item.children;
        const mobileLinkClassName =
          "block w-full rounded-md px-3 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary" +
          (item.active ? " bg-neutral-100 text-text-primary" : "");

        return (
          <div key={item.href} className="w-full">
            <Link href={item.href} aria-current={item.active ? "page" : undefined} className={mobileLinkClassName}>
              {item.label}
            </Link>
            {children && children.length > 0 && (
              <div className="ms-3 flex flex-col gap-0.5 border-s border-border ps-3">
                {children.map((child) => {
                  const grandchildren = child.children;
                  if (grandchildren && grandchildren.length > 0) {
                    return (
                      <div key={child.href} className="w-full">
                        <div className="block rounded-md px-3 py-2 text-sm font-medium text-text-secondary">
                          {child.label}
                        </div>
                        <div className="ms-3 flex flex-col gap-0.5 border-s border-border ps-3">
                          {grandchildren.map((grandchild) =>
                            grandchild.external ? (
                              <a
                                key={grandchild.href}
                                href={grandchild.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary"
                              >
                                {grandchild.label}
                              </a>
                            ) : (
                              <Link
                                key={grandchild.href}
                                href={grandchild.href}
                                className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary"
                              >
                                {grandchild.label}
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    );
                  }

                  return child.external ? (
                    <a
                      key={child.href}
                      href={child.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary"
                    >
                      {child.label}
                    </a>
                  ) : (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary"
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      }}
      actions={
        <div className="flex items-center gap-2">
          <LocaleSwitcher locale={locale} />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account">{t("account")}</Link>
              </Button>
              <Button variant="outline" size="sm" loading={loggingOut} onClick={handleLogout}>
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link href="/register">{t("register")}</Link>
              </Button>
            </>
          )}
        </div>
      }
    />
  );
}
