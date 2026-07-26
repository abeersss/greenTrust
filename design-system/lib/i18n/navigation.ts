import { createNavigation } from "next-intl/navigation";
import { locales } from "./config";

/**
 * Locale-aware `Link`, `useRouter`, `usePathname` (pathname WITHOUT
 * the locale prefix here, unlike the raw next/navigation hooks used
 * in components/site/locale-switcher.tsx, which deliberately wants
 * the prefix so it can swap it). Pages and nav components should
 * import Link from here, never from "next/link" directly, so every
 * internal link automatically carries the current locale.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation({
  locales,
  localePrefix: "always",
});
