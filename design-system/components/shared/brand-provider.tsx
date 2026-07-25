"use client";

import * as React from "react";
import type { Brand, ColorScheme } from "@/lib/utils";

interface BrandContextValue {
  brand: Brand;
  setBrand: (brand: Brand) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const BrandContext = React.createContext<BrandContextValue | null>(null);

/**
 * BrandProvider — the ONLY place that writes `data-brand` and `.dark`
 * onto <html>. Every visual difference between CyberAbeer, GreenTrust,
 * and Labs flows from these two attributes plus the CSS in
 * styles/tokens.css; no component should ever read `brand` to pick
 * different Tailwind classes for color (layout/structure differences,
 * like Labs showing an XP strip GreenTrust never shows, are the one
 * legitimate exception — see lib/utils.ts `isLabs()`).
 *
 * Persisted to localStorage so a returning visitor's last color-scheme
 * choice sticks; brand itself is normally set by the route (GreenTrust
 * pages wrap themselves in <BrandProvider brand="greentrust">), not by
 * user choice.
 */
export function BrandProvider({
  brand: initialBrand,
  children,
}: {
  brand: Brand;
  children: React.ReactNode;
}) {
  const [brand, setBrand] = React.useState<Brand>(initialBrand);
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>("light");

  React.useEffect(() => {
    const stored = window.localStorage.getItem("color-scheme") as ColorScheme | null;
    if (stored) setColorScheme(stored);
  }, []);

  React.useEffect(() => {
    document.documentElement.dataset.brand = brand;
  }, [brand]);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", colorScheme === "dark");
    window.localStorage.setItem("color-scheme", colorScheme);
  }, [colorScheme]);

  const value = React.useMemo(
    () => ({ brand, setBrand, colorScheme, setColorScheme }),
    [brand, colorScheme]
  );

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const ctx = React.useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within a BrandProvider");
  return ctx;
}
