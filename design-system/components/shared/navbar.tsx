import * as React from "react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo: React.ReactNode;
  items: NavItem[];
  /** LanguageSwitcher / ThemeToggle / auth buttons — passed as children
   * so this component never needs to know about routing or auth state. */
  actions?: React.ReactNode;
  renderLink?: (item: NavItem) => React.ReactNode;
}

/**
 * Navbar — same structural component for all three brands; the visual
 * identity shift (CyberAbeer's authority tone vs GreenTrust's premium
 * enterprise chrome vs Labs' energetic strip) comes entirely from
 * `data-brand` tokens (bg-surface, border-border, text-primary) plus
 * the `font-display` class on the logo slot. Sticky by default since
 * every brand's IA (Phase 1 sitemap) assumes persistent top nav.
 */
export function Navbar({ logo, items, actions, renderLink, className, ...props }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-sticky flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur",
        "tablet:px-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-8">
        <div className="font-display text-lg font-semibold text-text-primary">{logo}</div>
        <nav aria-label="Primary" className="hidden desktop:flex items-center gap-1">
          {items.map((item) =>
            renderLink ? (
              <React.Fragment key={item.href}>{renderLink(item)}</React.Fragment>
            ) : (
              <a
                key={item.href}
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary",
                  item.active && "text-text-primary bg-neutral-100"
                )}
              >
                {item.label}
              </a>
            )
          )}
        </nav>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}
