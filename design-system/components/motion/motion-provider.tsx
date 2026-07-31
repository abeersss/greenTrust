"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { LazyMotion, domAnimation, MotionConfig, useReducedMotion } from "framer-motion";
import { localeDir, type AppLocale } from "@/lib/i18n/config";
import { motionEase } from "@/lib/motion/tokens";

interface MotionContextValue {
  locale: AppLocale;
  dir: "ltr" | "rtl";
  prefersReducedMotion: boolean;
}

const MotionContext = createContext<MotionContextValue | null>(null);

/**
 * Read the current locale direction and prefers-reduced-motion state.
 * Every primitive in components/motion/* calls this instead of
 * re-deriving direction/accessibility state on its own.
 */
export function useMotionContext(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (!ctx) {
    throw new Error("useMotionContext must be used within a MotionProvider");
  }
  return ctx;
}

/**
 * Root motion context for the CyberAbeer premium motion system
 * (see MOTION_SYSTEM in the project brief). Wraps the app in a
 * single LazyMotion boundary (domAnimation feature set only, keeps
 * the animation JS out of the initial bundle) and exposes locale
 * direction + prefers-reduced-motion so every motion primitive can
 * make direction-aware and accessibility-aware decisions without
 * each one re-deriving them.
 *
 * Primitives in components/motion/* use the `m` component (not
 * `motion`) so they participate in LazyMotion's code-splitting;
 * follow that convention for any new motion primitive added here.
 */
export function MotionProvider({
  locale,
  children,
}: {
  locale: AppLocale;
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const dir = localeDir[locale];

  const value = useMemo<MotionContextValue>(
    () => ({ locale, dir, prefersReducedMotion: Boolean(prefersReducedMotion) }),
    [locale, dir, prefersReducedMotion],
  );

  return (
    <MotionContext.Provider value={value}>
      <LazyMotion features={domAnimation}>
        <MotionConfig
          reducedMotion="user"
          transition={{ ease: motionEase.standard, duration: 0.2 }}
        >
          {children}
        </MotionConfig>
      </LazyMotion>
    </MotionContext.Provider>
  );
}
