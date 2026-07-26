import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { Link } from "@/lib/i18n/navigation";

/**
 * Thin wrapper so every page gets the locale-aware `Link` for
 * breadcrumb trails without repeating the renderLink wiring. Server
 * Component: next-intl's Link renders fine outside a "use client"
 * boundary, so no client bundle cost for something this static.
 */
export function SiteBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Breadcrumb
      items={items}
      renderLink={(item) => (
        <Link href={item.href ?? "/"} className="hover:text-text-primary hover:underline">
          {item.label}
        </Link>
      )}
    />
  );
}
