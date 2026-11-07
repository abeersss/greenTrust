"use client";

import * as React from "react";
import { Link } from "@/lib/i18n/navigation";
import { CategoryIllustration } from "./category-illustration";
import { DG_CATEGORIES, getDgCopy, type DgCategoryRoute } from "@/lib/data-governance/config";
import type { DgResourceCard } from "@/lib/data-governance/resources";
import type { AppLocale } from "@/lib/i18n/config";

type SortMode = "recent" | "featured";

/**
 * Searchable, filterable resource library. Filtering is purely
 * client-side over the already-fetched published resources, so there is
 * no extra request and no invented statistics. `lockedCategory` hides the
 * discipline filter on a category page.
 */
export function ResourceGrid({
  locale,
  resources,
  initialQuery = "",
  lockedCategory,
}: {
  locale: AppLocale;
  resources: DgResourceCard[];
  initialQuery?: string;
  lockedCategory?: DgCategoryRoute;
}) {
  const copy = getDgCopy(locale);
  const [query, setQuery] = React.useState(initialQuery);
  const [category, setCategory] = React.useState<DgCategoryRoute | "all">(lockedCategory ?? "all");
  const [topic, setTopic] = React.useState("all");
  const [sort, setSort] = React.useState<SortMode>("recent");

  const scoped = React.useMemo(
    () => (lockedCategory ? resources.filter((r) => r.category === lockedCategory) : resources),
    [resources, lockedCategory]
  );

  const topics = React.useMemo(() => {
    const set = new Set<string>();
    for (const r of scoped) for (const t of r.topics) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b, locale));
  }, [scoped, locale]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scoped.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (topic !== "all" && !r.topics.includes(topic)) return false;
      if (q) {
        const hay = `${r.title} ${r.excerpt} ${r.topics.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "featured") {
      return [...list].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }
    return list;
  }, [scoped, query, category, topic, sort]);

  const isFiltered = query.trim() !== "" || (!lockedCategory && category !== "all") || topic !== "all" || sort !== "recent";

  function reset() {
    setQuery("");
    setCategory(lockedCategory ?? "all");
    setTopic("all");
    setSort("recent");
  }

  const dateFmt = React.useMemo(
    () => new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", { year: "numeric", month: "short", day: "numeric" }),
    [locale]
  );

  const controlClass =
    "w-full rounded-lg border border-white/15 bg-[#0d2240] px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300";

  return (
    <div>
      <div className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-4">
        <div className="tablet:col-span-2">
          <label htmlFor="dg-grid-search" className="sr-only">
            {copy.grid.searchLabel}
          </label>
          <input
            id="dg-grid-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.grid.searchPlaceholder}
            className={controlClass}
          />
        </div>
        {!lockedCategory && (
          <div>
            <label htmlFor="dg-grid-category" className="sr-only">
              {copy.grid.categoryFilter}
            </label>
            <select
              id="dg-grid-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DgCategoryRoute | "all")}
              className={controlClass}
            >
              <option value="all">{copy.grid.allCategories}</option>
              {DG_CATEGORIES.map((c) => (
                <option key={c.route} value={c.route}>
                  {copy.categories[c.route].short}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="dg-grid-topic" className="sr-only">
            {copy.grid.topicFilter}
          </label>
          <select id="dg-grid-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={controlClass}>
            <option value="all">{copy.grid.allTopics}</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dg-grid-sort" className="sr-only">
            {copy.grid.sortLabel}
          </label>
          <select id="dg-grid-sort" value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className={controlClass}>
            <option value="recent">{copy.grid.sortRecent}</option>
            <option value="featured">{copy.grid.sortFeatured}</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex min-h-[2rem] items-center justify-between gap-3 text-xs text-slate-400">
        <span aria-live="polite">{scoped.length > 0 ? copy.grid.showing(filtered.length, scoped.length) : ""}</span>
        {isFiltered && (
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-cyan-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
          >
            {copy.grid.reset}
          </button>
        )}
      </div>

      {scoped.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-300">
          {copy.grid.noneYet}
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-300">
          {copy.grid.empty}
        </p>
      ) : (
        <ul className="mt-4 grid gap-5 tablet:grid-cols-2 desktop:grid-cols-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link
                href={`/data-governance/${r.category}/${r.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c1f3a] transition duration-base hover:-translate-y-0.5 hover:border-emerald-400/50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="relative aspect-[8/5] overflow-hidden">
                  <CategoryIllustration
                    kind={r.category}
                    className="h-full w-full transition-transform duration-slow group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <div className="absolute start-2 top-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#06121f]/80 px-2.5 py-1 text-[11px] font-semibold text-cyan-200">
                      {copy.types[r.resourceType]}
                    </span>
                    {r.isInteractive && (
                      <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-[11px] font-semibold text-[#06121f]">
                        {copy.grid.interactive}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-semibold text-emerald-300">{copy.categories[r.category].short}</p>
                  <h3 className="mt-1 text-base font-semibold leading-snug text-white">{r.title}</h3>
                  {r.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-300">{r.excerpt}</p>}
                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-xs text-slate-400">
                    {r.readingTime ? <span>{copy.grid.minRead(r.readingTime)}</span> : null}
                    {r.date ? (
                      <span>
                        {copy.grid.updated} {dateFmt.format(new Date(r.date))}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
