"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { useMotionContext } from "./motion-provider";

/**
 * PageTransition — a light, entrance-only cross-page transition.
 * Deliberately does NOT use exit animations: in the Next.js App
 * Router, exit-animating a Server Component subtree fights the
 * framework's own streaming/suspense boundaries and can mask real
 * navigation/route errors, which the motion spec explicitly
 * prohibits. Instead this fades and rises the new route's content in
 * on mount, keyed by pathname — enough to remove the "hard cut"
 * feeling without touching browser history or delaying navigation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { prefersReducedMotion } = useMotionContext();

  if (prefersReducedMotion) return <>{children}</>;

  return (
    <m.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}
