"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AchievementMedal } from "./achievement-medal";
import { getAchievementSymbol } from "./achievement-symbols";
import { getAchievementSoundPreference, setAchievementSoundPreference } from "@/lib/achievements/sound";
import type { AchievementCatalogEntry } from "@/lib/achievements/catalog";
import type { AppLocale } from "@/lib/i18n/config";
import { Volume2, VolumeX, Sparkles, Trophy } from "lucide-react";

export interface AchievementsGridProps {
  locale: AppLocale;
  catalog: AchievementCatalogEntry[];
  earnedKeys: string[];
  awardedAtByKey: Record<string, string>;
  totalXp: number;
}

/**
 * "My Achievements" -- private collection view. Earned medals render
 * gold with their real date; not-yet-built achievements (everything
 * past 01 right now) render as a generic locked slot with no unique
 * symbol, matching the founder's "don't design the other 11 medals
 * yet" instruction. Nothing here is publicly indexable (see page.tsx).
 */
export function AchievementsGrid({ locale, catalog, earnedKeys, awardedAtByKey, totalXp }: AchievementsGridProps) {
  const t = useTranslations("achievements");
  const [soundOn, setSoundOn] = React.useState(true);
  const earnedSet = React.useMemo(() => new Set(earnedKeys), [earnedKeys]);
  const isRtl = locale === "ar";

  React.useEffect(() => {
    setSoundOn(getAchievementSoundPreference());
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setAchievementSoundPreference(next);
  }

  const earnedCount = catalog.filter((entry) => earnedSet.has(entry.key)).length;
  const nextEntry = catalog.find((entry) => !earnedSet.has(entry.key));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 tablet:px-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-3xl font-bold text-text-primary">{t("pageTitle")}</h1>
        <p className="max-w-md text-sm text-text-secondary">{t("pageDescription")}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 tablet:grid-cols-4">
        <StatCard icon={<Trophy className="h-5 w-5" aria-hidden="true" />} label={t("stats.earned")} value={`${earnedCount}/${catalog.length}`} />
        <StatCard icon={<Sparkles className="h-5 w-5" aria-hidden="true" />} label={t("stats.totalXp")} value={String(totalXp)} />
        <StatCard label={t("stats.next")} value={nextEntry ? t(`catalog.${nextEntry.key}.name`) : t("stats.allDone")} />
        <button
          type="button"
          onClick={toggleSound}
          className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-surface p-3 text-xs font-medium text-text-secondary hover:bg-neutral-50"
          aria-pressed={soundOn}
        >
          {soundOn ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
          {soundOn ? t("stats.soundOn") : t("stats.soundOff")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 tablet:grid-cols-3 desktop:grid-cols-4">
        {catalog.map((entry) => {
          const unlocked = earnedSet.has(entry.key);
          const awardedAt = awardedAtByKey[entry.key];
          return (
            <div key={entry.number} className="flex flex-col items-center gap-2 text-center">
              <AchievementMedal
                number={entry.number}
                symbol={unlocked && entry.hasMedalArt ? getAchievementSymbol(entry.key) : <PlaceholderSymbol />}
                locked={!unlocked}
                size="md"
              />
              <p className={unlocked ? "text-sm font-semibold text-text-primary" : "text-sm font-medium text-text-muted"}>
                {t(`catalog.${entry.key}.name`)}
              </p>
              <p className="text-xs text-text-muted">
                {unlocked
                  ? awardedAt
                    ? new Date(awardedAt).toLocaleDateString(locale === "ar" ? "ar" : "en", { year: "numeric", month: "short", day: "numeric" })
                    : t("earned")
                  : t("locked")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-surface p-3 text-center">
      {icon}
      <p className="font-display text-lg font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

function PlaceholderSymbol() {
  return (
    <svg viewBox="0 0 22 22" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 3" />
    </svg>
  );
}
