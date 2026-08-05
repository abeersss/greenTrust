import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

/**
 * Founder Dashboard landing (Phase 1 bare shell). Deliberately shows
 * only real, cheap counts pulled from tables that already exist --
 * no mocked data, and no stats for subsystems (Newsletter, Analytics,
 * SEO, ...) that have not been built yet. Those return to this page
 * with real numbers as each later phase ships.
 */
export default async function FounderDashboardPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!isAppLocale(locale)) notFound();
    const l = locale as AppLocale;

  await requireFounder(l);

  const supabase = await createSupabaseServerClient();

  const [{ count: publishedArticles }, { count: registeredUsers }] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

  const stats: { label: string; value: number }[] = [
    { label: "Published articles", value: publishedArticles ?? 0 },
    { label: "Registered users", value: registeredUsers ?? 0 },
      ];

  return (
        <div>
              <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">Founder Dashboard</h1>
              <p className="mt-1 text-sm text-text-muted">
                      Phase 1: founder-only access gate is live. Other sections are under construction.
              </p>
        
              <div className="mt-6 grid grid-cols-1 gap-4 tablet:grid-cols-2">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                                <CardHeader className="pb-2">
                                              <CardTitle className="text-sm font-medium text-text-muted">{stat.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                              <span className="font-display text-3xl font-bold text-primary">{stat.value}</span>
                                </CardContent>
                    </Card>
                              ))}
              </div>
        </div>
      );
}
