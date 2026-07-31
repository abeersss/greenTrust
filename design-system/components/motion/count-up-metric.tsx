"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useMotionContext } from "./motion-provider";

interface CountUpMetricProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

/**
 * CountUpMetric — animates a number from 0 to `value` once it enters
 * the viewport (e.g. years of experience, labs completed, frameworks
 * covered). Displays the final value immediately, with no count
 * animation, under prefers-reduced-motion.
 */
export function CountUpMetric({ value, suffix = "", prefix = "", decimals = 0, className }: CountUpMetricProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const { prefersReducedMotion } = useMotionContext();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReducedMotion) {
      ref.current.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      return;
    }
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      }
    });
    return unsubscribe;
  }, [spring, prefix, suffix, decimals, prefersReducedMotion, value]);

  return (
    <span ref={ref} className={className}>
      {prefersReducedMotion ? `${prefix}${value.toFixed(decimals)}${suffix}` : `${prefix}0${suffix}`}
    </span>
  );
}
