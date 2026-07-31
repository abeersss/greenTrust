"use client";

import type { ReactNode } from "react";
import { m, type Variants } from "framer-motion";
import { useMotionContext } from "./motion-provider";
import { staggerStep, type StaggerStepKey } from "@/lib/motion/tokens";

interface StaggerGroupProps {
  children: ReactNode;
  step?: StaggerStepKey;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  as?: "div" | "ul" | "ol";
}

/**
 * StaggerGroup — wraps a set of StaggerItem children and staggers
 * their entrance as the group scrolls into view. Use for card grids,
 * list rows, and menu items across labs, tools, research, books,
 * learning paths, insights, and intelligence articles.
 */
export function StaggerGroup({
  children,
  step = "base",
  delayChildren = 0,
  once = true,
  amount = 0.2,
  className,
  as = "div",
}: StaggerGroupProps) {
  const { prefersReducedMotion } = useMotionContext();
  const Component = m[as];

  const container: Variants = {
    hidden: {},
    show: {
      transition: prefersReducedMotion
        ? { staggerChildren: 0 }
        : { staggerChildren: staggerStep[step], delayChildren },
    },
  };

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={container}
    >
      {children}
    </Component>
  );
}

/** Child item for StaggerGroup. Must be a direct child to inherit the "show" variant trigger. */
export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const { prefersReducedMotion } = useMotionContext();
  const Component = m[as];

  const item: Variants = {
    hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <Component className={className} variants={item}>
      {children}
    </Component>
  );
}
