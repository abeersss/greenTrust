"use client";

import { m } from "framer-motion";
import { useMotionContext } from "./motion-provider";

interface AnimatedConnectorProps {
  /** SVG path data for the connector line. */
  d: string;
  className?: string;
  strokeWidth?: number;
  delay?: number;
}

/**
 * AnimatedConnector — draws an SVG path (a connecting line between
 * two nodes/cards/steps) as it enters the viewport. Used for the
 * homepage Knowledge Network hero, GreenTrust's agent chain, and
 * Research theme maps. This component only owns the draw animation;
 * the caller computes and passes the path's `d` data.
 *
 * Must be rendered inside an <svg> element by the caller.
 */
export function AnimatedConnector({ d, className, strokeWidth = 1.5, delay = 0 }: AnimatedConnectorProps) {
  const { prefersReducedMotion } = useMotionContext();

  return (
    <m.path
      d={d}
      className={className}
      fill="none"
      strokeWidth={strokeWidth}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.01 }
          : { duration: 1.1, delay, ease: [0.65, 0, 0.35, 1] }
      }
    />
  );
}
