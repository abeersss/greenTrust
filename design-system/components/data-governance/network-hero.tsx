"use client";

import * as React from "react";
import { DG_STAGE_ORDER, getDgCopy, type DgStageKey } from "@/lib/data-governance/config";
import type { AppLocale } from "@/lib/i18n/config";

const STAGE_COLORS: Record<DgStageKey, string> = {
  sources: "#22d3ee",
  classification: "#34d399",
  quality: "#22d3ee",
  governance: "#34d399",
  master: "#22d3ee",
  decisions: "#34d399",
};

/**
 * Animated data-flow network: Data Sources to Trusted Decisions.
 * Stages are real buttons (keyboard and touch accessible). Hover, focus,
 * or selection reveals the stage purpose in an aria-live panel. On
 * narrow screens the same stages stack vertically. The flow dots use a
 * logical-property animation so the direction mirrors correctly in RTL,
 * and all motion stops under prefers-reduced-motion.
 */
export function NetworkHero({ locale }: { locale: AppLocale }) {
  const copy = getDgCopy(locale);
  const [active, setActive] = React.useState<DgStageKey>("classification");
  const activeCopy = copy.stages[active];

  return (
    <div className="w-full">
      <style>{`
        @keyframes dg-flow { from { inset-inline-start: 0%; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } to { inset-inline-start: 100%; opacity: 0; } }
        @keyframes dg-flow-v { from { top: 0%; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } to { top: 100%; opacity: 0; } }
        @keyframes dg-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.35); } 50% { box-shadow: 0 0 0 8px rgba(52,211,153,0); } }
        .dg-dot { animation: dg-flow 2.6s linear infinite; }
        .dg-dot-v { animation: dg-flow-v 2.2s linear infinite; }
        .dg-active { animation: dg-pulse 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .dg-dot, .dg-dot-v, .dg-active { animation: none !important; }
          .dg-dot, .dg-dot-v { opacity: 1; inset-inline-start: 50%; top: 50%; }
        }
      `}</style>

      <p className="mb-4 text-sm font-medium text-cyan-200/90">{copy.hero.networkLabel}</p>

      <ol className="flex flex-col items-stretch gap-0 desktop:flex-row desktop:items-start desktop:gap-0">
        {DG_STAGE_ORDER.map((stage, index) => {
          const isActive = stage === active;
          const color = STAGE_COLORS[stage];
          const isLast = index === DG_STAGE_ORDER.length - 1;
          return (
            <li key={stage} className="flex flex-col items-stretch desktop:flex-1 desktop:flex-row desktop:items-center">
              <button
                type="button"
                onClick={() => setActive(stage)}
                onMouseEnter={() => setActive(stage)}
                onFocus={() => setActive(stage)}
                aria-pressed={isActive}
                aria-describedby="dg-stage-detail"
                className={
                  "group flex min-h-[3.25rem] items-center gap-3 rounded-xl border px-4 py-3 text-start transition-colors desktop:flex-col desktop:justify-center desktop:px-2 desktop:text-center " +
                  (isActive
                    ? "dg-active border-emerald-400/70 bg-emerald-400/10"
                    : "border-white/10 bg-white/[0.03] hover:border-cyan-300/50 hover:bg-white/[0.06]") +
                  " focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 desktop:w-full"
                }
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold text-white"
                  style={{ borderColor: color, backgroundColor: isActive ? color : "transparent", color: isActive ? "#06121f" : "#fff" }}
                >
                  {index + 1}
                </span>
                <span className="text-sm font-semibold leading-tight text-white">{copy.stages[stage].title}</span>
              </button>

              {!isLast && (
                <>
                  <span
                    aria-hidden="true"
                    className="relative mx-auto my-0 hidden h-px w-6 shrink-0 bg-white/20 desktop:block desktop:w-full desktop:max-w-[3rem]"
                  >
                    <span
                      className="dg-dot absolute top-1/2 block h-2 w-2 -translate-y-1/2 rounded-full bg-emerald-300"
                      style={{ animationDelay: `${index * 0.35}s` }}
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative mx-auto block h-5 w-px shrink-0 bg-white/20 desktop:hidden"
                  >
                    <span
                      className="dg-dot-v absolute start-1/2 block h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-300 rtl:translate-x-1/2"
                      style={{ animationDelay: `${index * 0.3}s` }}
                    />
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>

      <div
        id="dg-stage-detail"
        role="status"
        aria-live="polite"
        className="mt-5 rounded-xl border border-white/10 bg-[#0d2240]/80 p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
          {copy.hero.stageDetailLabel}: {activeCopy.title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-200">{activeCopy.purpose}</p>
      </div>
      <p className="mt-2 text-xs text-slate-400">{copy.hero.networkHint}</p>
    </div>
  );
}
