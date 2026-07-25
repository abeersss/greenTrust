import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * StatusIndicator — binary/tri-state governance and lifecycle status:
 * active/inactive, in_place/partial/not_started, valid/expired/revoked,
 * paid/pending/failed. This is NOT for severity — use RiskIndicator for
 * low/medium/high/critical. Keeping the two separate means "danger"
 * never gets reused to mean two different things in the same screen.
 */
const statusVariants = cva("inline-flex items-center gap-1.5 text-sm font-medium", {
  variants: {
    tone: {
      positive: "text-success-600",
      negative: "text-danger-600",
      neutral: "text-text-muted",
      pending: "text-warning-600",
      info: "text-info-600",
    },
  },
  defaultVariants: { tone: "neutral" },
});

const dotTone: Record<NonNullable<VariantProps<typeof statusVariants>["tone"]>, string> = {
  positive: "bg-success-500",
  negative: "bg-danger-500",
  neutral: "bg-neutral-400",
  pending: "bg-warning-500",
  info: "bg-info-500",
};

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusVariants> {
  label: string;
  /** Adds a slow pulse to the dot — reserve for genuinely live states
   * (e.g. "scan in progress"), never for static states. */
  pulse?: boolean;
}

export function StatusIndicator({ label, tone = "neutral", pulse, className, ...props }: StatusIndicatorProps) {
  return (
    <span className={cn(statusVariants({ tone }), className)} {...props}>
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", dotTone[tone ?? "neutral"])}
            aria-hidden="true"
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotTone[tone ?? "neutral"])} />
      </span>
      {label}
    </span>
  );
}
