import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge — generic labeling chip (categories, tags, plan names). For
 * pass/fail governance states use StatusIndicator; for low/medium/
 * high/critical severity use RiskIndicator. Keeping those three
 * separate prevents "badge" from becoming a catch-all that's styled
 * inconsistently across GreenTrust, Labs, and Content.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-neutral-100 text-text-secondary border-transparent",
        primary: "bg-primary-50 text-primary-700 border-transparent",
        success: "bg-success-50 text-success-600 border-transparent",
        warning: "bg-warning-50 text-warning-600 border-transparent",
        danger: "bg-danger-50 text-danger-600 border-transparent",
        info: "bg-info-50 text-info-600 border-transparent",
        outline: "bg-transparent text-text-secondary border-border-strong",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
