"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drawer (a.k.a. Sheet) — built on the same Dialog primitive as
 * DialogContent (same focus trap / Escape / aria-modal guarantees),
 * but slides in from an edge instead of appearing centered. `side`
 * uses logical "start"/"end" (not "left"/"right") so a drawer that
 * opens from the trailing edge in English correctly opens from the
 * opposite physical side in Arabic automatically.
 */
const Drawer = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerClose = DialogPrimitive.Close;

const drawerVariants = cva(
  "fixed z-modal bg-surface-raised border-border shadow-xl flex flex-col p-6 transition-transform",
  {
    variants: {
      side: {
        end: "inset-y-0 end-0 h-full w-full max-w-md border-s data-[state=closed]:translate-x-full rtl:data-[state=closed]:-translate-x-full",
        start: "inset-y-0 start-0 h-full w-full max-w-md border-e data-[state=closed]:-translate-x-full rtl:data-[state=closed]:translate-x-full",
        bottom: "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-xl border-t data-[state=closed]:translate-y-full",
      },
    },
    defaultVariants: { side: "end" },
  }
);

interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerVariants> {}

const DrawerContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DrawerContentProps>(
  ({ className, side, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-modal-backdrop bg-neutral-950/50" />
      <DialogPrimitive.Content ref={ref} className={cn(drawerVariants({ side }), className)} {...props}>
        {children}
        <DialogPrimitive.Close className="absolute end-4 top-4 rounded-sm text-text-muted opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
);
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 text-start mb-4", className)} {...props} />
);
const DrawerTitle = DialogPrimitive.Title;
const DrawerDescription = DialogPrimitive.Description;

export { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose };
