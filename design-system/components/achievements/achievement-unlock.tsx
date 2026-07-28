"use client";

import * as React from "react";
import { AchievementMedal } from "./achievement-medal";
import { playAchievementSound, getAchievementSoundPreference, setAchievementSoundPreference } from "@/lib/achievements/sound";
import { Volume2, VolumeX, X } from "lucide-react";

export interface CyberAbeerAchievementUnlockProps {
  number: string;
  symbol: React.ReactNode;
  name: string;
  xp: number;
  /** "ACHIEVEMENT UNLOCKED" (or the Arabic equivalent). */
  unlockedLabel: string;
  xpSuffix: string;
  skipLabel: string;
  soundOnLabel: string;
  soundOffLabel: string;
  onComplete: () => void;
}

/**
 * CyberAbeerAchievementUnlock -- the one reusable "winning" sequence
 * every CyberAbeer achievement plays through: darken -> glow -> gold
 * particles converge -> medal enters (scale + rotate) -> shine sweep
 * -> number -> title -> XP counts up -> "ACHIEVEMENT UNLOCKED", then
 * settles and calls `onComplete`. Every achievement reuses this exact
 * component unchanged -- only `number`/`symbol`/`name`/`xp` differ --
 * so the reveal itself becomes a recognizable CyberAbeer signature.
 *
 * Built with CSS keyframes + a small number of DOM nodes (no canvas,
 * no video, no animation library) so it stays lightweight on mobile.
 * `prefers-reduced-motion` swaps the whole sequence for a single short
 * fade/scale reveal with the medal already gold and the XP total
 * already final -- no particles, no rotation, no counting animation.
 * A Skip control appears ~500ms in either way and calls `onComplete`
 * immediately. Sound plays once on mount (never on skip/replay), is
 * fully independent of the reduced-motion preference, respects the
 * persisted on/off setting, and never throws if the browser blocks
 * autoplay.
 */
export function CyberAbeerAchievementUnlock({
  number,
  symbol,
  name,
  xp,
  unlockedLabel,
  xpSuffix,
  skipLabel,
  soundOnLabel,
  soundOffLabel,
  onComplete,
}: CyberAbeerAchievementUnlockProps) {
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const [stage, setStage] = React.useState<"playing" | "done">("playing");
  const [showSkip, setShowSkip] = React.useState(false);
  const [displayXp, setDisplayXp] = React.useState(reduceMotion ? xp : 0);
  const [soundOn, setSoundOn] = React.useState(true);
  const completedRef = React.useRef(false);
  // useId() includes colons (e.g. ":r1:"), which are invalid inside a
  // CSS class/keyframes identifier -- strip them so the generated
  // `.ca-unlock-<id>` selectors and `@keyframes ca-*-<id>` names are
  // valid CSS while still being unique per mounted instance.
  const rawId = React.useId();
  const rootId = React.useMemo(() => rawId.replace(/[^a-zA-Z0-9]/g, ""), [rawId]);

  const finish = React.useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setStage("done");
    onComplete();
  }, [onComplete]);

  React.useEffect(() => {
    setSoundOn(getAchievementSoundPreference());
    playAchievementSound();

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setShowSkip(true), 500));

    if (reduceMotion) {
      timers.push(window.setTimeout(finish, 1400));
      return () => timers.forEach(clearTimeout);
    }

    const xpStart = 1650;
    const xpDuration = 700;
    const stepMs = 30;
    let elapsed = 0;
    const xpTimer = window.setTimeout(function tick() {
      elapsed += stepMs;
      const progress = Math.min(1, elapsed / xpDuration);
      setDisplayXp(Math.round(xp * progress));
      if (progress < 1) {
        timers.push(window.setTimeout(tick, stepMs));
      }
    }, xpStart);
    timers.push(xpTimer);

    timers.push(window.setTimeout(finish, 3000));

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setAchievementSoundPreference(next);
  }

  if (stage === "done") return null;

  return (
    <div
      className={`ca-unlock-${rootId} fixed inset-0 z-modal flex items-center justify-center bg-neutral-950/0 px-4`}
      role="dialog"
      aria-label={unlockedLabel}
      aria-live="polite"
    >
      <style>{`
        .ca-unlock-${rootId} { animation: ca-backdrop-${rootId} ${reduceMotion ? "0.25s" : "0.5s"} ease forwards; }
        @keyframes ca-backdrop-${rootId} { to { background-color: rgb(15 19 23 / 0.72); } }

        .ca-glow-${rootId} {
          position: absolute; width: 60vmin; height: 60vmin; border-radius: 9999px;
          background: radial-gradient(circle, rgba(201,162,39,0.35) 0%, rgba(201,162,39,0) 70%);
          opacity: 0; ${reduceMotion ? "" : `animation: ca-glow-in-${rootId} 1.1s ease-out 0.15s forwards;`}
          ${reduceMotion ? "animation: ca-glow-static forwards; animation-duration:0.25s;" : ""}
        }
        @keyframes ca-glow-in-${rootId} { 0% { opacity: 0; transform: scale(0.6);} 50% { opacity: 1; } 100% { opacity: 0.7; transform: scale(1.15);} }

        .ca-particle-${rootId} {
          position: absolute; width: 6px; height: 6px; border-radius: 9999px; background: #f4d675;
          box-shadow: 0 0 6px 1px rgba(244,214,117,0.8);
          opacity: 0;
          animation: ca-particle-${rootId} 0.9s ease-in forwards;
        }
        @keyframes ca-particle-${rootId} {
          0% { opacity: 0; transform: translate(var(--px), var(--py)) scale(1); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translate(0, 0) scale(0.3); }
        }

        .ca-medal-${rootId} {
          opacity: 0;
          ${reduceMotion
            ? `animation: ca-medal-fade-${rootId} 0.5s ease 0.1s forwards;`
            : `animation: ca-medal-in-${rootId} 0.7s cubic-bezier(0.2,0.6,0.2,1) 0.55s forwards;`}
        }
        @keyframes ca-medal-in-${rootId} {
          0% { opacity: 0; transform: scale(0.35) rotateY(140deg); }
          70% { opacity: 1; }
          100% { opacity: 1; transform: scale(1) rotateY(0deg); }
        }
        @keyframes ca-medal-fade-${rootId} { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }

        .ca-shine-${rootId} {
          position: absolute; inset: 0; overflow: hidden; border-radius: 9999px; pointer-events: none;
        }
        .ca-shine-${rootId}::after {
          content: ""; position: absolute; top: -20%; bottom: -20%; width: 35%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.75), transparent);
          left: -40%;
          ${reduceMotion ? "display:none;" : `animation: ca-shine-move-${rootId} 0.9s ease 1.3s forwards;`}
        }
        @keyframes ca-shine-move-${rootId} { to { left: 130%; } }

        .ca-text-${rootId} { opacity: 0; transform: translateY(6px); animation: ca-text-in-${rootId} 0.45s ease forwards; }
        @keyframes ca-text-in-${rootId} { to { opacity: 1; transform: translateY(0); } }

        @media (prefers-reduced-motion: reduce) {
          .ca-particle-${rootId} { display: none; }
        }
      `}</style>

      {!reduceMotion && <div className={`ca-glow-${rootId}`} aria-hidden="true" />}

      {!reduceMotion &&
        Array.from({ length: 14 }).map((_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          const radius = 160 + (i % 3) * 30;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          return (
            <span
              key={i}
              aria-hidden="true"
              className={`ca-particle-${rootId}`}
              style={{
                left: "50%",
                top: "42%",
                animationDelay: `${0.05 + i * 0.02}s`,
                ["--px" as string]: `${px}px`,
                ["--py" as string]: `${py}px`,
              }}
            />
          );
        })}

      <div className="relative flex flex-col items-center gap-4 text-center">
        <button
          type="button"
          onClick={toggleSound}
          className="absolute -top-10 end-0 rounded-full p-2 text-neutral-0/80 hover:text-neutral-0"
          aria-label={soundOn ? soundOnLabel : soundOffLabel}
        >
          {soundOn ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
        </button>

        <div className={`ca-medal-${rootId} relative`} style={{ animationDelay: reduceMotion ? "0.1s" : "0.55s" }}>
          <AchievementMedal number={number} symbol={symbol} locked={false} size="xl" />
          <div className={`ca-shine-${rootId}`} />
        </div>

        <p
          className={`ca-text-${rootId} font-display text-2xl font-bold text-accent`}
          style={{ animationDelay: reduceMotion ? "0.35s" : "1.5s" }}
        >
          {name}
        </p>

        <p
          className={`ca-text-${rootId} font-display text-3xl font-extrabold text-neutral-0`}
          style={{ animationDelay: reduceMotion ? "0.35s" : "1.65s" }}
        >
          +{displayXp} {xpSuffix}
        </p>

        <p
          className={`ca-text-${rootId} text-sm font-semibold uppercase tracking-widest text-neutral-0/85`}
          style={{ animationDelay: reduceMotion ? "0.45s" : "2.35s" }}
        >
          {unlockedLabel}
        </p>

        {showSkip && (
          <button
            type="button"
            onClick={finish}
            className="mt-2 inline-flex items-center gap-1 rounded-full border border-neutral-0/30 px-4 py-1.5 text-xs font-medium text-neutral-0/90 hover:bg-neutral-0/10"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}
