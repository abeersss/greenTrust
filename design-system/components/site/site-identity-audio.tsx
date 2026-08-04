"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { AppLocale } from "@/lib/i18n/config";

const AUDIO_SRC = `/audio/${encodeURIComponent(
  "uri_ifs___A_pHanf2va3pU-rTK-eBqwKzDc-_TdCjTv3o-EAmx2pNk (1).m4a"
)}`;

const copy = {
  unmute: { en: "Unmute site sound", ar: "تفعيل صوت الموقع" },
  mute: { en: "Mute site sound", ar: "كتم صوت الموقع" },
} as const;

/**
 * CyberAbeer site identity theme song (2026-08-03, founder-supplied
 * asset; original creative work by Dr. Abeer Alshammari, founder of
 * CyberAbeer). Plays automatically, muted, looping, on first homepage
 * visit -- the only browser-compliant way to autoplay audio at all,
 * since every major browser blocks audio with sound before a user
 * gesture. A small floating control lets a visitor unmute with one
 * click (a real user gesture), which is also the only way the audio
 * can become audible without direct interaction.
 *
 * Homepage-only placement, per the founder's explicit choice: this is
 * deliberately not sitewide, so it never fights with the separate
 * Decision Labs / CTF win-celebration sound and never restarts as a
 * visitor navigates between pages.
 *
 * The uploaded filename is kept verbatim (not renamed) so the repo
 * history stays traceable to the exact file the founder supplied; it
 * has spaces and parentheses, so it's referenced through
 * encodeURIComponent rather than a literal path, matching the same
 * convention already used for the Labs/CTF win sound.
 *
 * 2026-08-04 revision (founder feedback: "where is cyberabeer song
 * ... return with sound icon with color"): the control was easy to
 * miss -- a plain gray icon on a white circle with no visual weight.
 * It now uses the brand's primary token as a solid fill so it reads
 * as a deliberate, colorful control rather than blending into the
 * page chrome, plus a soft pulse ring while muted to draw a first-
 * time visitor's eye to it.
 */
export function SiteIdentityAudio({ locale }: { locale: AppLocale }) {
  const [muted, setMuted] = React.useState(true);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    audioRef.current?.play().catch(() => {
      // Autoplay can still be blocked by some browser configurations
      // even when muted; that's fine, the visitor can press unmute,
      // which is itself a user gesture and will start playback.
    });
  }, []);

  function handleToggle() {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
      if (!next) audioRef.current.play().catch(() => {});
    }
  }

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} autoPlay muted loop preload="auto" />
      <button
        type="button"
        onClick={handleToggle}
        title="CyberAbeer site theme — created by Dr. Abeer Alshammari"
        aria-label={muted ? copy.unmute[locale] : copy.mute[locale]}
        className="fixed bottom-4 z-toast flex h-11 w-11 items-center justify-center rounded-full bg-primary text-text-on-primary shadow-lg transition-colors hover:bg-primary-hover [inset-inline-end:1rem]"
      >
        {muted && (
          <span
            className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary opacity-40"
            aria-hidden="true"
          />
        )}
        {muted ? (
          <VolumeX className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Volume2 className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
