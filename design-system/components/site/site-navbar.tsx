"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/shared/navbar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/actions/auth";
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
    { label: t("greentrust"), href: "/greentrust" },
    { label: t("labs"), href: "/labs" },
    { label: t("freeTools"), href: "/free-tools" },
    { label: t("research"), href: "/research" },
    { label: t("insights"), href: "/insights" },
    { label: t("contact"), href: "/contact" },
  ].map((item) => ({ ...item, active: pathname === item.href }));

  return (
    <Navbar
      logo={<Link href="/">CyberAbeer</Link>}
      items={items}
      renderLink={(item) => (
        <Link
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={
            "rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary" +
            (item.active ? " bg-neutral-100 text-text-primary" : "")
          }
        >
          {item.label}
        </Link>
      )}
      actions={
        <div className="flex items-center gap-2">
          <LocaleSwitcher locale={locale} />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account">{t("account")}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/labs">{t("myLabs")}</Link>
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
