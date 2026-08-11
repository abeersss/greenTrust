"use client";

import * as React from "react";
import { Share2, Copy, Check, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Per-tool share control (CyberAbeer Platform). Points at the tool's
 * own /free-tools/downloads/[id] page rather than the shared
 * /free-tools hub, so a pasted link carries that tool's own
 * OpenGraph image on LinkedIn/X instead of the site-wide default (or
 * another tool's picture). `path` is the locale-prefixed relative
 * path (e.g. /en/free-tools/downloads/<id>); the absolute URL is
 * resolved from window.location.origin at click time since this is a
 * client component with no access to the server-known siteUrl.
 */
export function ShareToolButton({
  path,
  title,
  shareLabel,
  copyLabel,
  copiedLabel,
  linkedInLabel,
  xLabel,
}: {
  path: string;
  title: string;
  shareLabel: string;
  copyLabel: string;
  copiedLabel: string;
  linkedInLabel: string;
  xLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function getUrl() {
    return typeof window !== "undefined" ? new URL(path, window.location.origin).toString() : path;
  }

  async function handleCopy() {
    const url = getUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail without HTTPS/permissions; the LinkedIn
      // and X options below still work as a fallback.
    }
  }

  const url = getUrl();
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const xHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={shareLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
      </Button>
      {open && (
        <div className="absolute end-0 z-20 mt-2 w-56 rounded-control border border-border bg-surface-raised p-2 shadow-lg">
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 rounded-control px-2 py-2 text-start text-sm text-text-primary hover:bg-neutral-100"
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? copiedLabel : copyLabel}
          </button>
          <a
            href={linkedInHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 rounded-control px-2 py-2 text-start text-sm text-text-primary hover:bg-neutral-100"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
            {linkedInLabel}
          </a>
          <a
            href={xHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 rounded-control px-2 py-2 text-start text-sm text-text-primary hover:bg-neutral-100"
          >
            <Twitter className="h-4 w-4" aria-hidden="true" />
            {xLabel}
          </a>
        </div>
      )}
    </div>
  );
}
