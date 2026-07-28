import type { ArticleSource } from "@/lib/content/articles";
import type { AppLocale } from "@/lib/i18n/config";

export interface SourcesListProps {
  sources: ArticleSource[];
  locale: AppLocale;
  title: string;
  accessedLabel: string;
}

/**
 * Renders the citation trail for an article. Deliberately only renders
 * sources that actually exist in `article_sources` -- there is no
 * placeholder/fallback citation, per the content spec's "never invent
 * citations" rule. If an article has no sources rows (pure evergreen
 * how-to content with no external claims), this returns null instead
 * of rendering an empty "Sources" heading.
 */
export function SourcesList({ sources, locale, title, accessedLabel }: SourcesListProps) {
  if (sources.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-6" aria-labelledby="article-sources-heading">
      <h2 id="article-sources-heading" className="font-display text-lg font-semibold text-text-primary">
        {title}
      </h2>
      <ol className="mt-3 flex flex-col gap-3 text-sm text-text-secondary">
        {sources.map((source, index) => (
          <li key={`${source.url}-${index}`} className="flex gap-2">
            <span className="text-text-muted">[{index + 1}]</span>
            <span>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-primary hover:underline"
              >
                {source.title}
              </a>
              {source.publisher && <span className="text-text-muted"> — {source.publisher}</span>}
              {source.publishedDate && (
                <span className="text-text-muted">
                  {" "}
                  ({new Date(source.publishedDate).toLocaleDateString(locale)})
                </span>
              )}
              <span className="block text-xs text-text-muted">
                {accessedLabel} {new Date(source.accessedDate).toLocaleDateString(locale)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
