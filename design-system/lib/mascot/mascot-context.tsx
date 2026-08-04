"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Bilingual } from "@/lib/challenges/bilingual";

export interface MascotHint {
  title: Bilingual;
  body: Bilingual;
}

interface MascotHintContextValue {
  hint: MascotHint | null;
  setHint: (hint: MascotHint | null) => void;
}

const MascotHintContext = createContext<MascotHintContextValue | null>(null);

/**
 * Provides the "live" mascot hint -- the concept explanation for whatever
 * stage of a lab/CTF challenge/knowledge check the learner is currently on.
 * Mounted once in the root locale layout, alongside <LabsMascot />, so any
 * client component further down the tree can call useMascotHint() to make
 * the mascot's tap-to-explain bubble reflect exactly what's on screen right
 * now (2026-08-04, founder request: "give small explanation for each
 * game... explain concept in brief when pressed at each stage").
 */
export function MascotHintProvider({ children }: { children: React.ReactNode }) {
  const [hint, setHint] = useState<MascotHint | null>(null);
  const value = useMemo(() => ({ hint, setHint }), [hint]);
  return <MascotHintContext.Provider value={value}>{children}</MascotHintContext.Provider>;
}

function useMascotHintContext(): MascotHintContextValue {
  const ctx = useContext(MascotHintContext);
  if (!ctx) {
    throw new Error("useMascotHintContext must be used within MascotHintProvider");
  }
  return ctx;
}

/**
 * Call from any lab/challenge/knowledge-check component to register the
 * concept explanation for whatever stage/step is currently shown. Pass
 * `null` while there's nothing stage-specific to say yet (e.g. still
 * loading) -- LabsMascot falls back to a general per-page explanation in
 * that case. Automatically clears itself on unmount so navigating away
 * doesn't leave a stale hint behind for the next page.
 */
export function useMascotHint(hint: MascotHint | null) {
  const { setHint } = useMascotHintContext();
  const key = hint ? `${hint.title.en}|${hint.body.en}` : null;
  useEffect(() => {
    setHint(hint);
    return () => setHint(null);
    // Re-register whenever the hint's actual content changes, not on
    // every render (a new object with the same text shouldn't re-fire).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export function useMascotDisplayedHint(): MascotHint | null {
  return useMascotHintContext().hint;
}
