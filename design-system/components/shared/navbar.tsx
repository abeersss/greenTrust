import * as React from "react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
  /** Optional dropdown sub-items (e.g. "For Organizations" -> GreenTrust AI, Free Tools). */
  children?: NavItem[];
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo: React.ReactNode;
  items: NavItem[];
  /** LanguageSwitcher / ThemeToggle / auth buttons — passed as children
   * so this component never needs to know about routing or auth state. */
  actions?: React.ReactNode;
  renderLink?: (item: NavItem) => React.ReactNode;
  /** Optional override for how each item renders inside the mobile drawer.
   * Falls back to a plain <a> (with nested children indented) if omitted. */
  renderMobileLink?: (item: NavItem) => React.ReactNode;
  /** Accessible label for the mobile menu toggle button. Defaults to "Menu". */
  mobileMenuLabel?: string;
}

/**
 * Navbar — same structural component for all three brands; the visual
 * identity shift (CyberAbeer's authority tone vs GreenTrust's premium
 * enterprise chrome vs Labs' energetic strip) comes entirely from
 * `data-brand` tokens (bg-surface, border-border, text-primary) plus
 * the `font-display` class on the logo slot. Sticky by default since
 * every brand's IA (Phase 1 sitemap) assumes persistent top nav.
 *
 * Mobile-nav fix (2026-08-14): the desktop <nav> was `hidden` below the
 * `desktop` breakpoint with no tap-friendly counterpart, so every item
 * (not just Books, which was additionally buried in a hover-only
 * "Insights" flyout) was unreachable on phones/tablets. Added a
 * hamburger toggle + slide-down panel that flattens parent + child
 * items into a single tappable list.
 */
export function Navbar({
  logo,
  items,
  actions,
  renderLink,
  renderMobileLink,
  mobileMenuLabel = "Menu",
  className,
  ...props
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  function renderDefaultMobileLink(item: NavItem) {
    const children = item.children;
    return (
      <div key={item.href} className="w-full">
        <a
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "block w-full rounded-md px-3 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary",
            item.active && "bg-neutral-100 text-text-primary"
          )}
        >
          {item.label}
        </a>
        {children && children.length > 0 && (
          <div className="ms-3 flex flex-col gap-0.5 border-s border-border ps-3">
            {children.map((child) => (
              <a
                key={child.href}
                href={child.href}
                className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary"
              >
                {child.label}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-sticky border-b border-border bg-surface/95 backdrop-blur",
        className
      )}
      {...props}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4 tablet:px-6">
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
        <div className="flex items-center gap-2">
          {actions}
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            aria-label={mobileMenuLabel}
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary desktop:hidden"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav-panel"
          onClick={() => setMobileOpen(false)}
          className="max-h-[70vh] overflow-y-auto border-t border-border bg-surface px-4 py-3 desktop:hidden"
        >
          <nav aria-label="Primary mobile" className="flex flex-col gap-0.5">
            {items.map((item) =>
              renderMobileLink ? (
                <React.Fragment key={item.href}>{renderMobileLink(item)}</React.Fragment>
              ) : (
                renderDefaultMobileLink(item)
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
