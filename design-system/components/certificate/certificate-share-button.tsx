"use client";

import * as React from "react";
import { Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics/track";

export interface CertificateShareButtonProps {
  referenceCode: string;
  shareUrl: string;
  shareImageUrl: string;
  shareText: string;
  shareLabel: string;
  locale: "en" | "ar";
}

/**
 * Certificate equivalent of BadgeTile's share button (founder
 * instruction, 2026-08-04: "make sharing for certificate as an image
 * post with link to site"). Same two-tier approach as
 * components/account/badge-tile.tsx: native Web Share with the
 * actual certificate PNG attached where the device supports it,
 * falling back to X/LinkedIn/Facebook intent links that point at
 * shareUrl (this same certificate/verification page) -- whose Open
 * Graph image, wired in generateMetadata below, is that same PNG, so
 * link-preview scrapers show it too either way.
 */
export default function CertificateShareButton({
  referenceCode,
  shareUrl,
  shareImageUrl,
  shareText,
  shareLabel,
  locale,
}: CertificateShareButtonProps) {
  const [shareOpen, setShareOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
    trackEvent("achievement_card_shared", { locale, challengeKey: `certificate_${referenceCode}`, platform });
    window.open(shareLinks[platform], "_blank", "noopener,noreferrer,width=600,height=600");
    setShareOpen(false);
  }

  async function handleShareClick() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        const response = await fetch(shareImageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], `cyberabeer-certificate-${referenceCode}.png`, {
            type: blob.type || "image/png",
          });
          const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
          if (nav.canShare && nav.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: shareText, text: shareText, url: shareUrl });
            trackEvent("achievement_card_shared", {
              locale,
              challengeKey: `certificate_${referenceCode}`,
              platform: "native",
            });
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

  return (
    <div ref={containerRef} className="relative mx-auto mt-6 flex w-fit flex-col items-center">
      <button
        type="button"
        onClick={handleShareClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-raised"
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
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
