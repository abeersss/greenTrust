import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button - the single most-reused control in the system. Every color
 * used here is a token (bg-primary, text-danger-600, etc.), so this
 * exact component automatically restyles for GreenTrust vs Labs vs
 * CyberAbeer just from the `data-brand` attribute on <html>; nothing
 * brand-specific is hardcoded in this file.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
"rounded-control text-sm font-medium transition-all duration-fast ease-out",
    "active:scale-[0.97] active:brightness-95",
    "disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
    "focus-visible:outline-none", // globals.css supplies the visible ring
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-text-on-primary hover:bg-primary-hover active:bg-primary-active shadow-sm",
        secondary:
          "bg-surface-raised text-text-primary border border-border-strong hover:bg-neutral-100",
        outline:
          "border border-border-strong text-text-primary bg-transparent hover:bg-neutral-100",
        ghost: "text-text-primary bg-transparent hover:bg-neutral-100",
        destructive: "bg-danger-500 text-white hover:bg-danger-600",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (e.g. a Next.js <Link>) instead of <button>. */
  asChild?: boolean;
  /** Shows a spinner and disables the button; label stays for screen readers. */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {/* Slottable marks which child Radix's Slot should merge props
            onto when asChild is used; without it, Slot always sees two
            children (this array plus the spinner slot above) and throws
            "expected a single React element child", even when `loading`
            is false, because the spinner's `false` still occupies a
            children-array slot. */}
        <Slottable>{children}</Slottable>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
