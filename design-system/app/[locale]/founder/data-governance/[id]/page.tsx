import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { emptyDgDetail, getDgAdminDetail } from "@/lib/founder/dg-admin";
import { DgResourceForm } from "@/components/founder/dg-resource-form";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function FounderDataGovernanceEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  await requireFounder(l);

  const isNew = id === "new";
  if (!isNew && !UUID.test(id)) notFound();
  const detail = isNew ? emptyDgDetail() : await getDgAdminDetail(id);
  if (!detail) notFound();

  return (
    <div>
      <a href={`/${locale}/founder/data-governance`} className="text-sm text-text-muted hover:underline">
        Back to resources
      </a>
      <h1 className="mt-2 font-display text-2xl font-bold text-text-primary tablet:text-3xl">
        {isNew ? "New resource" : "Edit resource"}
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Fill in English, Arabic, or both. A language with no content is simply not shown on the site.
      </p>
      <DgResourceForm locale={l} initial={detail} />
    </div>
  );
}
