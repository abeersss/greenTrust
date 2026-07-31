"use client";

import { useRef, type ReactNode } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { useMotionContext } from "./motion-provider";

interface ParallaxLayerProps {
  children: ReactNode;
  /** -1..1. Positive moves the layer down relative to scroll; negative moves it up. */
  speed?: number;
  className?: string;
}

/**
 * ParallaxLayer — subtle scroll-linked vertical translation for
 * decorative layers only (hero depth layers, background shapes,
 * atmosphere elements). Not intended for text content. Disabled
 * automatically under prefers-reduced-motion.
 */
export function ParallaxLayer({ children, speed = 0.2, className }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useMotionContext();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ["0px", "0px"] : [`${speed * -60}px`, `${speed * 60}px`],
  );

  return (
    <div ref={ref} className={className}>
      <m.div style={{ y }}>{children}</m.div>
    </div>
  );
}
