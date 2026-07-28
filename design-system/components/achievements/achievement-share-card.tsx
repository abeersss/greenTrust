"use client";

import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "@/components/ui/button";
import { AchievementMedal } from "./achievement-medal";
import { Download, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics/track";

export interface AchievementShareCardProps {
  number: string;
  symbol: React.ReactNode;
  name: string;
  xp: number;
  locale: "en" | "ar";
  labels: {
    cardTitle: string;
    xpSuffix: string;
    shareCta: string;
    downloadCta: string;
    shareText: string;
  };
  shareUrl: string;
  challengeKey: string;
}

const CARD_SIZE = 1080;

/**
 * Renders the CyberAbeer achievement share card to an offscreen canvas
 * (1080x1080 -- safe for Instagram feed/story crops, LinkedIn, and
 * WhatsApp) and offers Share (native share sheet with the image file
 * where supported) and Download. The medal itself is drawn by
 * serializing <AchievementMedal> to an SVG data URL and rasterizing it
 * with a plain <img>/canvas.drawImage -- no server round-trip, no
 * canvas/image library dependency, works fully client-side.
 */
export function AchievementShareCard({ number, symbol, name, xp, locale, labels, shareUrl, challengeKey }: AchievementShareCardProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = React.useState(false);
  const isRtl = locale === "ar";

  React.useEffect(() => {
    let cancelled = false;

    async function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = CARD_SIZE;
      canvas.height = CARD_SIZE;

      const bg = ctx.createLinearGradient(0, 0, CARD_SIZE, CARD_SIZE);
      bg.addColorStop(0, "#0a323c");
      bg.addColorStop(1, "#0f4c5c");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE);

      ctx.strokeStyle = "rgba(201,162,39,0.35)";
      ctx.lineWidth = 3;
      ctx.strokeRect(36, 36, CARD_SIZE - 72, CARD_SIZE - 72);

      ctx.textAlign = "center";
      ctx.fillStyle = "#f4d675";
      ctx.font = "700 44px Inter, system-ui, sans-serif";
      ctx.fillText("CYBERABEER", CARD_SIZE / 2, 150);

      ctx.fillStyle = "#ffffff";
      ctx.font = "600 30px Inter, system-ui, sans-serif";
      ctx.letterSpacing = "4px";
      ctx.fillText(labels.cardTitle, CARD_SIZE / 2, 205);
      ctx.letterSpacing = "0px";

      const medalSvg = renderToStaticMarkup(
        <AchievementMedal number={number} symbol={symbol} locked={false} size="xl" />
      );
      const svgWithNs = medalSvg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      const svgDataUrl = `data:image/svg+xml;base64,${typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(svgWithNs))) : ""}`;

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("medal image failed to load"));
        img.src = svgDataUrl;
      });
      if (cancelled) return;

      const medalW = 420;
      const medalH = (medalW * img.height) / img.width;
      ctx.drawImage(img, (CARD_SIZE - medalW) / 2, 300, medalW, medalH);

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 56px Inter, system-ui, sans-serif";
      ctx.fillText(name, CARD_SIZE / 2, 300 + medalH + 90);

      ctx.fillStyle = "#f4d675";
      ctx.font = "700 46px Inter, system-ui, sans-serif";
      ctx.fillText(`+${xp} ${labels.xpSuffix}`, CARD_SIZE / 2, 300 + medalH + 155);

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "500 28px Inter, system-ui, sans-serif";
      ctx.fillText("cyberabeer.com", CARD_SIZE / 2, CARD_SIZE - 70);

      if (!cancelled) setReady(true);
    }

    draw().catch(() => setReady(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number, name, xp, locale]);

  function toBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  async function handleDownload() {
    trackEvent("achievement_card_downloaded", { locale, challengeKey });
    const blob = await toBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cyberabeer-achievement-${number}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleShare() {
    trackEvent("achievement_card_shared", { locale, challengeKey });
    const blob = await toBlob();
    if (blob && typeof navigator !== "undefined" && navigator.canShare) {
      const file = new File([blob], `cyberabeer-achievement-${number}.png`, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: labels.shareText, url: shareUrl });
          return;
        } catch {
          // user cancelled the share sheet -- fall through to download.
        }
      }
    }
    await handleDownload();
  }

  return (
    <div className="flex flex-col items-center gap-4" dir={isRtl ? "rtl" : "ltr"}>
      <canvas
        ref={canvasRef}
        className="w-full max-w-xs rounded-lg border border-border shadow-md"
        aria-label={`${labels.cardTitle}: ${name}`}
      />
      <div className="flex w-full gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={handleDownload} disabled={!ready}>
          <Download className="h-4 w-4" aria-hidden="true" />
          {labels.downloadCta}
        </Button>
        <Button type="button" className="flex-1" onClick={handleShare} disabled={!ready}>
          <Share2 className="h-4 w-4" aria-hidden="true" />
          {labels.shareCta}
        </Button>
      </div>
    </div>
  );
}
