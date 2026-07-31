"use client";

import { useRef, useState, type ReactNode } from "react";
import { m, useScroll, useMotionValueEvent } from "framer-motion";
import { useMotionContext } from "./motion-provider";

interface PinnedStoryProps {
  /** Ordered content blocks (text/copy) — one per scroll step. */
  steps: ReactNode[];
  /** Renders the pinned visual for a given active step index. */
  visual: (activeIndex: number) => ReactNode;
  className?: string;
}

/**
 * PinnedStory — a scrollytelling section where a visual stays pinned
 * while stepped text content scrolls past and updates the visual.
 * Used for Research timelines, GreenTrust's HUMAN→...→AUDIT chain,
 * and the For Organizations challenge→tool journey.
 *
 * Falls back to a plain stacked (non-pinned) layout under
 * prefers-reduced-motion, per the motion spec's accessibility
 * requirements (no scroll-scrubbing when reduced motion is on).
 */
export function PinnedStory({ steps, visual, className }: PinnedStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { prefersReducedMotion } = useMotionContext();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const idx = Math.min(steps.length - 1, Math.max(0, Math.floor(latest * steps.length)));
    setActiveIndex(idx);
  });

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {steps.map((step, i) => (
          <div key={i} className="grid gap-8 py-12 tablet:grid-cols-2 tablet:items-center">
            <div>{visual(i)}</div>
            <div>{step}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={{ minHeight: `${steps.length * 100}vh` }}>
      <div className="sticky top-0 grid min-h-screen items-center gap-8 py-12 tablet:grid-cols-2">
        <div>
          <m.div
            key={`visual-${activeIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {visual(activeIndex)}
          </m.div>
        </div>
        <div>
          <m.div
            key={`step-${activeIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {steps[activeIndex]}
          </m.div>
        </div>
      </div>
    </div>
  );
}
