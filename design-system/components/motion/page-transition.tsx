"use client";

import { useEffect, useState, type ReactNode } from "react";
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
 * on mount, keyed by pathname -- enough to remove the "hard cut"
 * feeling without touching browser history or delaying navigation.
 *
 * Renders plain children until the component has mounted on the
 * client. Framer Motion's SSR-computed inline style for the initial
 * animation state does not always byte-match what the client
 * computes on its first render pass, which trips React's hydration
 * check (errors #418 / #423). Gating the animated wrapper behind a
 * post-mount flag guarantees the server HTML and the client's first
 * render are identical, so the animation only ever starts after
 * hydration has safely completed.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { prefersReducedMotion } = useMotionContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (prefersReducedMotion || !mounted) return <>{children}</>;

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
