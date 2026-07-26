"use client";

import { useTranslations } from "next-intl";
import { Navbar } from "@/components/shared/navbar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { Link, usePathname } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Public-site navigation. Wraps the design system's brand-agnostic
 * Navbar with real routes, active-link detection, the locale switcher,
 * theme toggle, and auth entry points. Login/Register are plain
 * buttons rather than part of the primary nav item list, matching the
 * IA from the Phase 1 blueprint (auth is a distinct, secondary action).
 */
export function SiteNavbar({ locale }: { locale: AppLocale }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

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
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/register">{t("register")}</Link>
          </Button>
        </div>
      }
    />
  );
}
