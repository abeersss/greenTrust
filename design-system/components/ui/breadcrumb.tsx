import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  /** Render function so this component stays router-agnostic (Next.js
   * <Link>, a plain <a>, or anything else) — the design system must not
   * import next/link directly. */
  renderLink?: (item: BreadcrumbItem, index: number) => React.ReactNode;
}

/**
 * Breadcrumb — the separator icon is mirrored automatically under RTL
 * via the `rtl:rotate-180` utility rather than swapping icons, since
 * ChevronRight/ChevronLeft as distinct imports would need to be chosen
 * with JS branching on every render.
 */
export function Breadcrumb({ items, renderLink, className, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex", className)} {...props}>
      <ol className="flex items-center gap-1.5 text-sm text-text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />}
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className={cn(isLast && "text-text-primary font-medium")}>
                  {item.label}
                </span>
              ) : renderLink ? (
                renderLink(item, index)
              ) : (
                <a href={item.href} className="hover:text-text-primary hover:underline">
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
