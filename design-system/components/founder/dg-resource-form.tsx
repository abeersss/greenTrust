"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveDgResource, type DgSaveInput, type DgSaveLocale } from "@/lib/actions/founder-dg";
import type { AppLocale } from "@/lib/i18n/config";

const CATEGORIES = [
  { route: "classification", label: "Data Classification & Information Protection" },
  { route: "governance", label: "Data Governance" },
  { route: "quality", label: "Data Quality Management" },
  { route: "mdm", label: "Master Data Management" },
];
const TYPES = ["guide", "checklist", "framework", "example", "template"];
const STATUSES = [
  { v: "draft", l: "Draft (hidden)" },
  { v: "founder_review", l: "Founder review (hidden)" },
  { v: "published", l: "Published (live)" },
  { v: "archived", l: "Archived (hidden)" },
];

const SNIPPETS: { label: string; html: string }[] = [
  { label: "Heading", html: "\n<h2>Heading</h2>\n<p>Text.</p>\n" },
  {
    label: "Callout",
    html: '\n<div class="content-callout">\n  <div class="content-callout-title">The short answer</div>\n  <p>Text.</p>\n</div>\n',
  },
  {
    label: "Checklist",
    html: '\n<div class="content-checklist">\n<ul>\n<li>First item</li>\n<li>Second item</li>\n</ul>\n</div>\n',
  },
  {
    label: "Table",
    html: '\n<table class="content-comparison-table">\n<thead><tr><th>Column A</th><th>Column B</th></tr></thead>\n<tbody>\n<tr><td>Cell</td><td>Cell</td></tr>\n</tbody>\n</table>\n',
  },
  { label: "Steps", html: "\n<ol>\n<li><strong>Step.</strong> Detail.</li>\n</ol>\n" },
];

const PREVIEW_CSS = `
.dgp{color:#cbd5e1;line-height:1.8}
.dgp h2{margin:1.5rem 0 .5rem;font-size:1.4rem;font-weight:700;color:#fff}
.dgp h3{margin:1.2rem 0 .4rem;font-size:1.15rem;font-weight:600;color:#fff}
.dgp p{margin:0 0 .9rem}
.dgp ul,.dgp ol{margin:0 0 1rem;padding-inline-start:1.4rem}
.dgp ul{list-style:disc}.dgp ol{list-style:decimal}
.dgp .content-callout{margin:1rem 0;padding:.9rem 1.1rem;border-inline-start:4px solid #34d399;border-radius:.6rem;background:rgba(52,211,153,.08)}
.dgp .content-callout-title{font-weight:700;color:#6ee7b7}
.dgp .content-checklist{margin:1rem 0;padding:.9rem 1.1rem;border:1px solid rgba(255,255,255,.15);border-radius:.6rem}
.dgp .content-checklist ul{list-style:none;padding:0;margin:0}
.dgp table{display:block;overflow-x:auto;border-collapse:collapse;margin:1rem 0}
.dgp th,.dgp td{padding:.5rem .7rem;border:1px solid rgba(255,255,255,.15);text-align:start}
.dgp th{background:rgba(34,211,238,.1);color:#fff}
.dgp svg{display:block;width:100%;height:auto}
.dgp .dg-figure{margin:1.5rem 0;padding:.8rem;border:1px solid rgba(255,255,255,.1);border-radius:.8rem;background:#0a1b33}
.dgp .dg-figure figcaption{margin-top:.5rem;font-size:.85rem;color:#94a3b8;text-align:center}
`;

const field =
  "mt-1 w-full rounded-control border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring";
const label = "block text-sm font-medium text-text-primary";

type Tab = "en" | "ar";

export function DgResourceForm({ locale, initial }: { locale: AppLocale; initial: DgSaveInput }) {
  const [data, setData] = React.useState<DgSaveInput>(initial);
  const [tab, setTab] = React.useState<Tab>(initial.en.title || !initial.ar.title ? "en" : "ar");
  const [preview, setPreview] = React.useState(false);
  const [msg, setMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = React.useTransition();
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  const cur = data[tab];
  function setLocaleField(k: keyof DgSaveLocale, v: string) {
    setData((d) => ({ ...d, [tab]: { ...d[tab], [k]: v } }));
  }
  function insert(html: string) {
    const el = bodyRef.current;
    const start = el?.selectionStart ?? cur.body.length;
    const end = el?.selectionEnd ?? cur.body.length;
    setLocaleField("body", cur.body.slice(0, start) + html + cur.body.slice(end));
  }
  function setSource(i: number, k: "title" | "publisher" | "url", v: string) {
    setData((d) => ({ ...d, sources: d.sources.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const r = await saveDgResource(locale, data);
      if (r.status === "error") setMsg({ ok: false, text: r.message });
      else setMsg({ ok: true, text: "Saved." });
    });
  }

  const dir = tab === "ar" ? "rtl" : "ltr";

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="grid gap-4 tablet:grid-cols-2">
        <label className={label}>
          Category
          <select className={field} value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c.route} value={c.route}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Resource type
          <select className={field} value={data.resourceType} onChange={(e) => setData({ ...data, resourceType: e.target.value })}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Status
          <select className={field} value={data.status} onChange={(e) => setData({ ...data, status: e.target.value })}>
            {STATUSES.map((s) => (
              <option key={s.v} value={s.v}>
                {s.l}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Topic tags (comma separated)
          <Input className="mt-1" value={data.tags} onChange={(e) => setData({ ...data, tags: e.target.value })} placeholder="NIST, ISO 27001" />
        </label>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input type="checkbox" checked={data.featured} onChange={(e) => setData({ ...data, featured: e.target.checked })} />
          Featured on the hub
        </label>
      </section>

      <section>
        <div role="tablist" className="flex gap-2 border-b border-border-strong">
          {(["en", "ar"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-t-lg px-4 py-2 text-sm font-semibold ${
                tab === t ? "bg-primary-600 text-white" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t === "en" ? "English" : "العربية"}
              {data[t].title ? " ✓" : ""}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-4" dir={dir}>
          <label className={label}>
            Title
            <Input className="mt-1" value={cur.title} onChange={(e) => setLocaleField("title", e.target.value)} />
          </label>
          <label className={label}>
            Slug (web address ending)
            <Input
              className="mt-1"
              value={cur.slug}
              onChange={(e) => setLocaleField("slug", e.target.value)}
              placeholder={tab === "en" ? "my-guide-title" : "عنوان-الدليل"}
            />
          </label>
          <label className={label}>
            Summary (shown on cards and in search results)
            <textarea className={field} rows={3} value={cur.excerpt} onChange={(e) => setLocaleField("excerpt", e.target.value)} />
          </label>

          <div>
            <div className="flex flex-wrap items-center gap-2" dir="ltr">
              <span className={label}>Body (HTML)</span>
              {SNIPPETS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => insert(s.html)}
                  className="rounded-md border border-border-strong px-2 py-1 text-xs text-text-primary hover:bg-surface-raised"
                >
                  + {s.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="ms-auto rounded-md border border-border-strong px-2 py-1 text-xs text-text-primary hover:bg-surface-raised"
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div className="mt-2 rounded-xl bg-[#06121f] p-5">
                <style>{PREVIEW_CSS}</style>
                {/* Founder-only preview of founder-authored HTML. */}
                <div className="dgp" dangerouslySetInnerHTML={{ __html: cur.body }} />
              </div>
            ) : (
              <textarea
                ref={bodyRef}
                className={`${field} font-mono`}
                rows={22}
                value={cur.body}
                onChange={(e) => setLocaleField("body", e.target.value)}
                spellCheck={false}
              />
            )}
          </div>

          <div className="grid gap-4 tablet:grid-cols-2">
            <label className={label}>
              SEO title
              <Input className="mt-1" value={cur.metaTitle} onChange={(e) => setLocaleField("metaTitle", e.target.value)} />
            </label>
            <label className={label}>
              Reading time in minutes (blank = automatic)
              <Input className="mt-1" inputMode="numeric" value={cur.readingTime} onChange={(e) => setLocaleField("readingTime", e.target.value)} />
            </label>
          </div>
          <label className={label}>
            SEO description
            <textarea className={field} rows={2} value={cur.metaDescription} onChange={(e) => setLocaleField("metaDescription", e.target.value)} />
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-text-primary">References</h2>
        <p className="text-xs text-text-muted">Shared by both languages. Titles are shown as written, so use the original source title.</p>
        <div className="mt-3 space-y-3">
          {data.sources.map((s, i) => (
            <div key={i} className="grid gap-2 tablet:grid-cols-[2fr_1fr_2fr_auto]">
              <Input placeholder="Title" value={s.title} onChange={(e) => setSource(i, "title", e.target.value)} />
              <Input placeholder="Publisher" value={s.publisher} onChange={(e) => setSource(i, "publisher", e.target.value)} />
              <Input placeholder="https://..." value={s.url} onChange={(e) => setSource(i, "url", e.target.value)} />
              <Button type="button" variant="ghost" size="sm" onClick={() => setData({ ...data, sources: data.sources.filter((_, idx) => idx !== i) })}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setData({ ...data, sources: [...data.sources, { title: "", publisher: "", url: "" }] })}>
          Add reference
        </Button>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" loading={pending}>
          Save
        </Button>
        {msg && (
          <p role="status" className={`text-sm ${msg.ok ? "text-success-600" : "text-danger-600"}`}>
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}
