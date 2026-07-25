import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton — loading placeholder. Respects prefers-reduced-motion
 * globally (globals.css disables the pulse animation for those users,
 * leaving a static gray block instead of a flashing one).
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("animate-pulse rounded-md bg-neutral-200", className)}
      {...props}
    />
  );
}
