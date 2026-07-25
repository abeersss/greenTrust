"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * ErrorState — for a failed data fetch (e.g. "couldn't load risk
 * assessments"). `role="alert"` announces it immediately to screen
 * readers the moment it mounts, unlike EmptyState which is a normal,
 * expected state and should NOT interrupt.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "Please try again. If the problem continues, contact support.",
  onRetry,
  retryLabel = "Try again",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-danger-500/30 bg-danger-50 p-10 text-center",
        className
      )}
      {...props}
    >
      <AlertTriangle className="h-8 w-8 text-danger-600" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-semibold text-danger-600">{title}</p>
        <p className="text-sm text-danger-600/90 max-w-sm">{description}</p>
      </div>
      {onRetry && (
        <Button variant="destructive" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
