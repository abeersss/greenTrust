"use client";

import { m, useScroll, useSpring } from "framer-motion";
import { useMotionContext } from "./motion-provider";

/**
 * ScrollProgress — a thin fixed progress bar tracking overall page
 * scroll position. Intended for long-form pages (Research, Book
 * Series, article/insight detail) to reinforce "you are here"
 * without adding extra chrome. Renders nothing under
 * prefers-reduced-motion (Section 15: remove scroll-scrubbing).
 */
export function ScrollProgress({ className }: { className?: string }) {
  const { prefersReducedMotion, dir } = useMotionContext();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, restDelta: 0.001 });

  if (prefersReducedMotion) return null;

  return (
    <m.div
      aria-hidden="true"
      className={className ?? "fixed inset-x-0 top-0 z-toast h-[3px] bg-primary"}
      style={{ scaleX, transformOrigin: dir === "rtl" ? "right" : "left" }}
    />
  );
}
