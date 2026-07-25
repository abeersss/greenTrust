import * as React from "react";
import { cn } from "@/lib/utils";

export interface SidebarSection {
  label?: string;
  items: { label: string; href: string; icon?: React.ReactNode; active?: boolean }[];
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  sections: SidebarSection[];
  renderLink?: (item: SidebarSection["items"][number]) => React.ReactNode;
}

/**
 * Sidebar — GreenTrust executive dashboards and Labs "my learning"
 * views both use this same left-hand (start-side, logically) nav.
 * `desktop:` is the breakpoint it appears at; below that it's expected
 * to be rendered inside a Drawer (see components/ui/drawer.tsx)
 * instead — this component only renders the list, not the responsive
 * show/hide chrome, so it can be reused in both places without
 * duplicating the item markup.
 */
export function Sidebar({ sections, renderLink, className, ...props }: SidebarProps) {
  return (
    <nav aria-label="Section" className={cn("flex w-60 flex-col gap-6 border-e border-border p-4", className)} {...props}>
      {sections.map((section, i) => (
        <div key={section.label ?? i} className="flex flex-col gap-1">
          {section.label && (
            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {section.label}
            </p>
          )}
          {section.items.map((item) =>
            renderLink ? (
              <React.Fragment key={item.href}>{renderLink(item)}</React.Fragment>
            ) : (
              <a
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-text-secondary",
                  "hover:bg-neutral-100 hover:text-text-primary transition-colors",
                  item.active && "bg-primary-50 text-primary-700"
                )}
              >
                {item.icon && <span className="[&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>}
                {item.label}
              </a>
            )
          )}
        </div>
      ))}
    </nav>
  );
}
