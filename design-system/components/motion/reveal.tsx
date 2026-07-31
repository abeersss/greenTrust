"use client";

import type { ReactNode } from "react";
import { m } from "framer-motion";
import { useMotionContext } from "./motion-provider";
import { motionEase, revealDistance } from "@/lib/motion/tokens";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  amount?: number;
  className?: string;
}

/**
 * Reveal — the single most-used primitive in the CyberAbeer motion
 * system. Fades (and optionally rises/slides) an element into place
 * once it enters the viewport.
 *
 * direction="left"/"right" is reading-direction-aware: it is mirrored
 * automatically for RTL (Arabic) locales via MotionProvider's `dir`,
 * so it always moves toward the reading-start edge rather than a
 * fixed screen edge.
 *
 * Under prefers-reduced-motion, Reveal drops to a simple opacity
 * fade with no translation, per the motion spec's accessibility
 * requirements.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration,
  distance = revealDistance.base,
  once = true,
  amount = 0.3,
  className,
}: RevealProps) {
  const { dir, prefersReducedMotion } = useMotionContext();

  if (prefersReducedMotion) {
    return (
      <m.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once, amount }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </m.div>
    );
  }

  let offset: { x?: number; y?: number } = {};
  if (direction === "up") offset = { y: distance };
  else if (direction === "down") offset = { y: -distance };
  else if (direction === "left") offset = { x: dir === "rtl" ? -distance : distance };
  else if (direction === "right") offset = { x: dir === "rtl" ? distance : -distance };

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration: duration ?? 0.6,
        delay,
        ease: motionEase.outExpo,
      }}
    >
      {children}
    </m.div>
  );
}
