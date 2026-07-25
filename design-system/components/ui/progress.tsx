import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value: number;
  /** Visual accent — 'brand' uses the current brand's primary color;
   * 'xp' uses the Labs-only gamification gold token regardless of brand
   * (used by XPBar even when embedded in a non-Labs context like a
   * cross-sell card). */
  tone?: "brand" | "xp" | "success" | "danger";
}

const toneClass: Record<NonNullable<ProgressProps["tone"]>, string> = {
  brand: "bg-primary",
  xp: "bg-xp",
  success: "bg-success-500",
  danger: "bg-danger-500",
};

/**
 * Progress — used for assessment completion, course/path completion,
 * and (via XPBar) level progress. Radix's Progress sets
 * role="progressbar" with aria-valuenow/min/max automatically.
 */
const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, tone = "brand", ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-neutral-200", className)}
      {...props}
    >
      {/* Width-based fill (not a transform) so the bar grows from the
          inline-start edge in whichever direction `dir` currently is —
          correct in RTL automatically, no sign-flipping math needed. */}
      <ProgressPrimitive.Indicator
        className={cn("h-full transition-[width] duration-slow ease-standard", toneClass[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
      />
    </ProgressPrimitive.Root>
  )
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
