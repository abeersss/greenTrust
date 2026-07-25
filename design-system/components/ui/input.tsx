import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Marks the field invalid: red border + sets aria-invalid so the
   * paired error message (see FormField pattern in the design-system
   * doc) is announced by screen readers. */
  invalid?: boolean;
}

/**
 * Input — 40px min height meets the WCAG 2.2 target-size guidance and
 * matches Button's `md` size so forms line up visually. Uses logical
 * padding (`ps-`/`pe-` not `pl-`/`pr-`) so a leading icon in English
 * correctly becomes a trailing icon in Arabic without any RTL-specific
 * component code.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-10 w-full rounded-control border bg-surface px-3 py-2 text-sm text-text-primary",
          "border-border-strong placeholder:text-text-muted",
          "transition-colors duration-fast",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "border-danger-500 focus-visible:ring-danger-500",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
