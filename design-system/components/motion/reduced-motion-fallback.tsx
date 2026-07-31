"use client";

import type { ReactNode } from "react";
import { useMotionContext } from "./motion-provider";

/**
 * ReducedMotionFallback — conditional render helper for the rarer
 * cases where reduced motion needs a structurally different subtree
 * rather than just a lighter transition (most primitives in this
 * folder already handle that internally). Typical use: swapping a
 * WebGL/canvas visual for a static image or simplified SVG.
 */
export function ReducedMotionFallback({
  reduced,
  full,
}: {
  reduced: ReactNode;
  full: ReactNode;
}) {
  const { prefersReducedMotion } = useMotionContext();
  return <>{prefersReducedMotion ? reduced : full}</>;
}
