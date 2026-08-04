const MASCOT_SOUND_PREF_KEY = "cyberabeer:mascot-sound";

/** Reads the persisted mascot-tap-sound preference. Defaults to "on",
 * same convention as the achievement sound preference. */
export function getMascotSoundPreference(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(MASCOT_SOUND_PREF_KEY) !== "off";
}

export function setMascotSoundPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MASCOT_SOUND_PREF_KEY, enabled ? "on" : "off");
}

/**
 * Small "bubble pop" blip for the Labs mascot's tap-to-explain button
 * (2026-08-04, founder request: "give small sound ... like bubble
 * sound when pressing this character"). Synthesized entirely with the
 * Web Audio API -- the same zero-asset, zero-licensing-risk approach
 * already established site-wide for the achievement sound
 * (lib/achievements/sound.ts) -- rather than a new MP3/M4A file. A
 * quick rising "bloop" that settles and pops off, ~180ms and quiet
 * (peak gain 0.16), since this is a button a learner may tap
 * repeatedly to reread a hint and must never feel noisy or
 * attention-grabbing the way the achievement fanfare is allowed to.
 *
 * Fails silently and never throws: autoplay/AudioContext restrictions
 * must never block the mascot's actual job, which is opening the
 * explanation bubble.
 */
export function playMascotBubbleSound(): void {
  if (typeof window === "undefined") return;
  if (!getMascotSoundPreference()) return;

  try {
    const AudioContextCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2400, now);

    osc.type = "sine";
    // Rising "bloop" (a bubble drifting up) then a soft pop-off --
    // classic bubble SFX shape, kept tiny and non-intrusive.
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.15);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    window.setTimeout(() => {
      ctx.close().catch(() => undefined);
    }, 350);
  } catch {
    // Autoplay policy, unsupported browser, etc. -- never block the
    // mascot's tap interaction on audio failing.
  }
}
