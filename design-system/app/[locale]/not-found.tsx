import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Locale-aware 404. Next.js renders this for any unmatched path under
 * app/[locale]/... so a broken /en/some-typo link still gets a
 * correctly-directioned, correctly-translated page instead of the
 * framework's generic default.
 */
export default async function NotFound({ params }: { params?: Promise<{ locale: string }> }) {
  const locale = (await params)?.locale ?? "en";
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-24 text-center">
      <EmptyState title="404" description="This page could not be found." />
      <Button asChild>
        <Link href="/">{t("backToHome")}</Link>
      </Button>
    </div>
  );
}
