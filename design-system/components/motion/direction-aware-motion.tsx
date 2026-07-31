"use client";

import type { ReactNode } from "react";
import { m, type MotionProps } from "framer-motion";
import { useMotionContext } from "./motion-provider";

type FlippableState = Record<string, unknown> | undefined;

function flipX(state: FlippableState, dir: "ltr" | "rtl"): FlippableState {
  if (dir !== "rtl" || !state) return state;
  if (typeof state.x !== "number") return state;
  return { ...state, x: -state.x };
}

/**
 * DirectionAwareMotion — an `m.div` that flips the sign of any
 * numeric `x` value in `initial`/`animate`/`exit` when the active
 * locale is RTL, so "slide in from the reading-start edge" behaves
 * correctly for both English and Arabic without callers hand-coding
 * the sign. For simple enter/reveal cases prefer <Reveal>; use this
 * only when a custom motion sequence is needed.
 */
export function DirectionAwareMotion({
  initial,
  animate,
  exit,
  children,
  ...rest
}: MotionProps & { children?: ReactNode }) {
  const { dir } = useMotionContext();

  return (
    <m.div
      initial={flipX(initial as FlippableState, dir) as MotionProps["initial"]}
      animate={flipX(animate as FlippableState, dir) as MotionProps["animate"]}
      exit={flipX(exit as FlippableState, dir) as MotionProps["exit"]}
      {...rest}
    >
      {children}
    </m.div>
  );
}
