const SOUND_PREF_KEY = "cyberabeer:achievement-sound";

/** Reads the persisted achievement-sound preference. Defaults to "on"
 * (per spec: sound plays by default; the user has to opt out). */
export function getAchievementSoundPreference(): boolean {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem(SOUND_PREF_KEY);
  return stored !== "off";
}

export function setAchievementSoundPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOUND_PREF_KEY, enabled ? "on" : "off");
}

/**
 * Synthesizes the CyberAbeer signature achievement sound entirely with
 * the Web Audio API -- no MP3/asset file, so there is zero licensing
 * risk (nothing sampled, copied, or derived from any game/OS/brand
 * sound) and zero extra network weight. Three layered oscillator
 * voices produce the founder's requested shape: a soft digital
 * "activation" tick, a short rising futuristic sweep, then a clean,
 * bright two-note major-interval resolution. Total length ~1.4s.
 *
 * Fails silently and never throws: browser autoplay restrictions or a
 * missing AudioContext must never block achievement completion, which
 * is a purely visual/data event independent of whether sound plays.
 */
export function playAchievementSound(): void {
  if (typeof window === "undefined") return;
  if (!getAchievementSoundPreference()) return;

  try {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
    const now = ctx.currentTime;

    // 1. Soft digital activation tick (short, filtered noise-free blip).
    const tick = ctx.createOscillator();
    const tickGain = ctx.createGain();
    tick.type = "sine";
    tick.frequency.setValueAtTime(880, now);
    tickGain.gain.setValueAtTime(0, now);
    tickGain.gain.linearRampToValueAtTime(0.22, now + 0.01);
    tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    tick.connect(tickGain).connect(master);
    tick.start(now);
    tick.stop(now + 0.1);

    // 2. Rising futuristic sweep.
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.type = "sawtooth";
    const sweepFilter = ctx.createBiquadFilter();
    sweepFilter.type = "lowpass";
    sweepFilter.frequency.setValueAtTime(600, now + 0.1);
    sweepFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.5);
    sweep.frequency.setValueAtTime(220, now + 0.1);
    sweep.frequency.exponentialRampToValueAtTime(660, now + 0.55);
    sweepGain.gain.setValueAtTime(0, now + 0.1);
    sweepGain.gain.linearRampToValueAtTime(0.14, now + 0.28);
    sweepGain.gain.linearRampToValueAtTime(0, now + 0.58);
    sweep.connect(sweepFilter).connect(sweepGain).connect(master);
    sweep.start(now + 0.1);
    sweep.stop(now + 0.6);

    // 3. Clean bright resolution: two notes, a perfect fifth apart
    // (fifths read as "resolved/confident", never "jackpot"-like).
    const notes: Array<{ freq: number; start: number; dur: number; gain: number }> = [
      { freq: 659.25, start: 0.58, dur: 0.55, gain: 0.2 },
      { freq: 987.77, start: 0.66, dur: 0.7, gain: 0.22 },
    ];
    notes.forEach(({ freq, start, dur, gain }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + start);
      g.gain.setValueAtTime(0, now + start);
      g.gain.linearRampToValueAtTime(gain, now + start + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(g).connect(master);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });

    master.gain.setValueAtTime(0.9, now);

    const stopAt = now + 1.45;
    window.setTimeout(() => {
      ctx.close().catch(() => undefined);
    }, 1600);
    void stopAt;
  } catch {
    // Autoplay policy, unsupported browser, etc. -- never block the
    // achievement itself on audio failing.
  }
}
