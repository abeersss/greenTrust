"use client";

import * as React from "react";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { AchievementMedal } from "@/components/achievements/achievement-medal";
import { Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics/track";

/**
 * Maps a badge's DB key to the live challenge route it was earned
 * from, so every badge on the account page -- whether it has custom
 * medal art yet or not -- is a real link back to that lab rather than
 * a dead-end stamp. Labs not yet built (GRCL, Agent Zero) fall back
 * to the Decision Labs hub instead of a route that doesn't exist.
 *
 * Only covers Labs badge keys. CTF badges pass `hrefOverride`
 * explicitly instead (their route is /labs/ctf/[slug], a different
 * shape from /challenge/[slug]), so this map never needs CTF entries.
 */
const BADGE_KEY_TO_CHALLENGE_SLUG: Record<string, string> = {
  first_defender: "first-defender",
  phishing_hunter: "first-defender",
  network_guardian: "network-guardian",
  soc_responder: "soc-night-shift",
  data_guardian: "data-guardian",
};

interface AchievementInfo {
  number: string;
  symbol: React.ReactNode;
}

export interface BadgeTileProps {
  badgeKey: string;
  name: string;
  achievement: AchievementInfo | null;
  locale: "en" | "ar";
  shareUrl: string;
  shareText: string;
  shareLabel: string;
  /** Direct PNG image URL for this badge (see
   * app/badge-image/[badgeKey]/route.ts), used for the native Web
   * Share attachment -- separate from `shareUrl`, which is the
   * OG-tagged landing page that X/LinkedIn/Facebook's link-preview
   * scrapers read the same image from. */
  shareImageUrl: string;
  /** Explicit link target, used by CTF badges (route shape
   * /labs/ctf/[slug] rather than /challenge/[slug]). When omitted,
   * falls back to the Labs BADGE_KEY_TO_CHALLENGE_SLUG lookup below,
   * preserving existing behavior for every Labs badge. */
  hrefOverride?: string;
}

export default function BadgeTile({
  badgeKey,
  name,
  achievement,
  locale,
  shareUrl,
  shareText,
  shareLabel,
  shareImageUrl,
  hrefOverride,
}: BadgeTileProps) {
  const [shareOpen, setShareOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const slug = BADGE_KEY_TO_CHALLENGE_SLUG[badgeKey];
  const href = hrefOverride ?? (slug ? `/challenge/${slug}` : "/labs/decision-labs");

  React.useEffect(() => {
    if (!shareOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [shareOpen]);

  function openShare(platform: "x" | "linkedin" | "facebook") {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    const shareLinks: Record<typeof platform, string> = {
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    trackEvent("achievement_card_shared", { locale, challengeKey: badgeKey, platform });
    window.open(shareLinks[platform], "_blank", "noopener,noreferrer,width=600,height=600");
    setShareOpen(false);
  }

  /**
   * Founder instruction (2026-08-04): "the sharing will be with badge
   * as image in the post." On devices that support attaching a real
   * file to the OS share sheet (navigator.share + canShare({files}),
   * true on most mobile browsers and some desktop ones), fetch the
   * badge's PNG and hand it to the native share sheet directly -- the
   * resulting post carries the actual image, not just a link. Where
   * that's unsupported, fall back to the existing X/LinkedIn/Facebook
   * popover; those now point at shareUrl, a page whose Open Graph
   * image is this same badge PNG, so their link previews show the
   * image too.
   */
  async function handleShareClick() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        const response = await fetch(shareImageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], `${badgeKey}.png`, { type: blob.type || "image/png" });
          const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
          if (nav.canShare && nav.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: shareText, text: shareText, url: shareUrl });
            trackEvent("achievement_card_shared", { locale, challengeKey: badgeKey, platform: "native" });
            return;
          }
        }
      } catch {
        // User cancelled the native share sheet, or the image fetch
        // failed -- either way, fall through to the link popover
        // below rather than leaving the click unhandled.
      }
    }
    setShareOpen((v) => !v);
  }

  if (achievement) {
    return (
      <div ref={containerRef} className="relative flex flex-col items-center gap-1 text-center">
        <div className="flex flex-col items-center gap-1">
          <AchievementMedal number={achievement.number} symbol={achievement.symbol} locked={false} size="sm" />
          <span className="line-clamp-2 max-w-[5.5rem] break-words text-xs font-medium text-text-primary">
            {name}
          </span>
        </div>
        <button
          type="button"
          onClick={handleShareClick}
          aria-label={shareLabel}
          className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-text-secondary transition-colors hover:bg-surface-raised"
        >
          <Share2 className="h-3 w-3" aria-hidden="true" />
          {shareLabel}
        </button>
        {shareOpen ? (
          <div className="absolute top-full z-10 mt-1 flex items-center gap-1 rounded-md border border-border bg-surface p-1.5 shadow-md">
            <button
              type="button"
              onClick={() => openShare("x")}
              className="flex h-7 w-7 items-center justify-center rounded text-xs font-semibold hover:bg-surface-raised"
              aria-label="Share on X"
            >
              X
            </button>
            <button
              type="button"
              onClick={() => openShare("linkedin")}
              className="flex h-7 w-7 items-center justify-center rounded text-xs font-semibold text-[#0A66C2] hover:bg-surface-raised"
              aria-label="Share on LinkedIn"
            >
              in
            </button>
            <button
              type="button"
              onClick={() => openShare("facebook")}
              className="flex h-7 w-7 items-center justify-center rounded text-xs font-semibold text-[#1877F2] hover:bg-surface-raised"
              aria-label="Share on Facebook"
            >
              f
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Link href={href} className="transition-opacity hover:opacity-80">
      <Badge variant="success" className="cursor-pointer">
        {name}
      </Badge>
    </Link>
  );
}
