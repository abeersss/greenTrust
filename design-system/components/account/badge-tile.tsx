"use client";

import * as React from "react";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import AchievementMedal from "@/components/achievements/achievement-medal";
import { Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics/track";

/**
 * Maps a badge's DB key to the live challenge route it was earned
 * from, so every badge on the account page -- whether it has custom
 * medal art yet or not -- is a real link back to that lab rather than
 * a dead-end stamp. Labs not yet built (GRCL, Agent Zero) fall back
 * to the Decision Labs hub instead of a route that doesn't exist.
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
}

export default function BadgeTile({
  badgeKey,
  name,
  achievement,
  locale,
  shareUrl,
  shareText,
  shareLabel,
}: BadgeTileProps) {
  const [shareOpen, setShareOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const slug = BADGE_KEY_TO_CHALLENGE_SLUG[badgeKey];
  const href = slug ? `/challenge/${slug}` : "/labs/decision-labs";

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

  if (achievement) {
    return (
      <div ref={containerRef} className="relative flex flex-col items-center gap-1 text-center">
        <div className="flex flex-col items-center gap-1">
          <AchievementMedal number={achievement.number} symbol={achievement.symbol} locked={false} size="sm" />
          <span className="max-w-[5.5rem] text-xs font-medium text-text-primary">{name}</span>
        </div>
        <button
          type="button"
          onClick={() => setShareOpen((v) => !v)}
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
