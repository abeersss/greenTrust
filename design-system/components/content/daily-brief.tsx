import { Card } from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";
import { SeverityBadge } from "@/components/content/severity-badge";
import type { ArticleSummary, IntelSeverity } from "@/lib/content/articles";

export interface DailyBriefProps {
  articles: ArticleSummary[];
  title: string;
  readingTimeLabel: string;
  severityLabels: Record<IntelSeverity, string>;
  emptyText: string;
}

/**
 * Today's Cyber Brief (Section 14): a compact, ~3-5 minute-read strip
 * at the top of the hub, built from whatever the latest genuinely
 * important intelligence items actually are -- capped at 5, but never
 * padded to 5. If only one or two items are currently worth
 * surfacing, this renders one or two, per the spec's explicit "do not
 * manufacture five stories" instruction. The caller (the /intelligence
 * page) is responsible for passing already-fetched, already-sorted
 * `getLatestIntelligenceArticles` results -- this component only
 * renders, it doesn't decide what counts as "genuinely important".
 */
export function DailyBrief({ articles, title, readingTimeLabel, severityLabels, emptyText }: DailyBriefProps) {
  const items = articles.slice(0, 5);

  return (
    <Card className="mt-8 border-border-strong p-5 tablet:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
        <span className="text-xs text-text-muted">{readingTimeLabel}</span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">{emptyText}</p>
      ) : (
        <ol className="mt-4 flex flex-col divide-y divide-border">
          {items.map((article) => (
            <li key={article.id} className="py-3 first:pt-0 last:pb-0">
              <Link href={`/intelligence/${article.slug}`} className="group flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {article.intelSeverity && (
                    <SeverityBadge severity={article.intelSeverity} label={severityLabels[article.intelSeverity]} />
                  )}
                  {article.categoryName && <span className="text-xs text-text-muted">{article.categoryName}</span>}
                </div>
                <span className="font-medium text-text-primary transition-colors group-hover:text-primary-700">
                  {article.title}
                </span>
                {article.excerpt && <span className="text-sm text-text-secondary">{article.excerpt}</span>}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
