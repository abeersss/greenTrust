"use client";

import * as React from "react";

/**
 * Founder-requested "hurray" win celebration (2026-08-02): confetti +
 * a short cheering sound effect, fired exactly once whenever a player
 * clears BADGE_PASS_SCORE (lib/actions/challenge.ts) and a badge is
 * genuinely earned -- never for a below-threshold completion.
 * Deliberately dependency-free (a handful of CSS-animated <span>s,
 * no npm confetti library) so this can never become a build-breaking
 * dependency. Renders nothing until `active` flips true, and never
 * re-fires for the same mount, so a completed screen re-render on
 * locale switch, hint reveal, or a parent state update never replays
 * the sound or confetti burst a second time.
 *
 * Sound asset: design-system/public/sounds/ (the exact founder-supplied
 * WhatsApp voice note, uploaded verbatim rather than renamed, so the
 * repo history stays traceable to the original file the founder sent).
 * The filename has spaces, so it's referenced through encodeURIComponent
 * rather than a literal path.
 */
const WIN_SOUND_SRC = `/sounds/${encodeURIComponent("WhatsApp Audio 2026-08-02 at 9.11.23 PM.mp4")}`;

const CONFETTI_COLORS = ["#f4d675", "#c9a227", "#0f4c5c", "#2f9e6f", "#e0bd4f", "#ffffff"];
const PIECE_COUNT = 36;

interface ConfettiPiece {
  id: number;
  left: number; // vw
  delay: number; // s
  duration: number; // s
  rotate: number; // deg
  color: string;
  width: number; // px
  height: number; // px
}

function buildPieces(): ConfettiPiece[] {
  // PRODUCTION BUILD FIX (2026-08-03): under this project's tsconfig
  // (noUncheckedIndexedAccess), indexing an array by a computed number
  // (`CONFETTI_COLORS[i % CONFETTI_COLORS.length]`) types as
  // `string | undefined`, not `string`, even though the modulo makes
  // it always in range. ConfettiPiece.color requires a non-null
  // `string`, so this failed `npm run build` with "Type 'string |
  // undefined' is not assignable to type 'string'." at this file's
  // line 40. The `?? CONFETTI_COLORS[0]` fallback (which TypeScript
  // can prove is a plain string) satisfies the type with no behavior
  // change, since the modulo already guarantees the index is valid.
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    duration: 2.1 + Math.random() * 1.5,
    rotate: Math.random() * 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] ?? CONFETTI_COLORS[0],
    width: 6 + Math.random() * 6,
    height: 10 + Math.random() * 6,
  }));
}

export interface WinCelebrationProps {
  /** Fire the celebration. Callers must gate this on a genuine win
   * (score >= 80 / badgeAwarded) -- the component itself only guards
   * against re-firing on re-render, not against being told to
   * celebrate a loss. */
  active: boolean;
  /** Mutes the sound; confetti still plays. Defaults to false. */
  muted?: boolean;
}

export function WinCelebration({ active, muted = false }: WinCelebrationProps) {
  const [pieces, setPieces] = React.useState<ConfettiPiece[] | null>(null);
  const firedRef = React.useRef(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    if (!active || firedRef.current) return;
    firedRef.current = true;
    setPieces(buildPieces());
    if (!muted && audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => {
        // Autoplay can be blocked before any user gesture elsewhere on
        // the page; confetti still plays, so a blocked sound degrades
        // silently rather than throwing.
      });
    }
    const timeout = setTimeout(() => setPieces(null), 4200);
    return () => clearTimeout(timeout);
  }, [active, muted]);

  return (
    <>
      <audio ref={audioRef} preload="auto" aria-hidden="true">
        <source src={WIN_SOUND_SRC} type="audio/mp4" />
      </audio>
      {pieces && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
          {pieces.map((p) => (
            <span
              key={p.id}
              style={{
                position: "absolute",
                top: "-6vh",
                left: `${p.left}vw`,
                width: p.width,
                height: p.height,
                backgroundColor: p.color,
                borderRadius: 1,
                transform: `rotate(${p.rotate}deg)`,
                animation: `win-celebration-fall ${p.duration}s ease-in ${p.delay}s forwards`,
              }}
            />
          ))}
        </div>
      )}
      <style>{`
        @keyframes win-celebration-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(112vh) rotate(560deg); opacity: 0.15; }
        }
      `}</style>
    </>
  );
}
