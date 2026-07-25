import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * EmptyState — "no agents yet", "no leaderboard entries yet", etc.
 * Deliberately plain (no illustration asset dependency) so it renders
 * identically before any brand-specific illustration system exists.
 */
export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-strong p-10 text-center",
        className
      )}
      {...props}
    >
      {icon && <div className="text-text-muted [&>svg]:h-10 [&>svg]:w-10">{icon}</div>}
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-semibold text-text-primary">{title}</p>
        {description && <p className="text-sm text-text-muted max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
