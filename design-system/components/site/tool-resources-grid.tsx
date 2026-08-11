"use client";

import * as React from "react";
import { Download, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageCarousel } from "@/components/site/image-carousel";
import { ShareToolButton } from "@/components/site/share-tool-button";
import type { ToolResource } from "@/lib/tools/tool-resources";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder-managed Free Tools "Downloads" grid (CyberAbeer Platform,
 * migration 030). Each tool_resources row can show an image carousel
 * AND a direct download button at once -- founder decides per tool
 * via /founder/tool-resources, no code changes needed to add a 5th,
 * 6th, etc. Descriptions longer than MAX_DESCRIPTION_CHARS are
 * truncated with a "More" control that opens the full text in a
 * popup, so one long write-up can't blow out a card's height and
 * break the grid's row alignment. Each card also carries a Share
 * control pointing at that tool's own /free-tools/downloads/[id]
 * page so a pasted link shows that tool's picture on LinkedIn/X.
 */
const MAX_DESCRIPTION_CHARS = 140;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd() + "\u2026";
}

function ToolDescription({
  name,
  description,
  moreLabel,
}: {
  name: string;
  description: string;
  moreLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  const isLong = description.length > MAX_DESCRIPTION_CHARS;

  return (
    <div className="mt-2 flex-1 text-sm text-text-secondary">
      <p>
        {isLong ? truncate(description, MAX_DESCRIPTION_CHARS) : description}
        {isLong && (
          <>
            {" "}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="font-semibold text-primary hover:underline"
            >
              {moreLabel}
            </button>
          </>
        )}
      </p>
      {isLong && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{name}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-secondary">{description}</p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function ToolResourcesGrid({
  items,
  locale,
  downloadLabel,
  moreLabel = "More",
  shareLabels,
}: {
  items: ToolResource[];
  locale: AppLocale;
  downloadLabel: string;
  moreLabel?: string;
  shareLabels: {
    share: string;
    copyLink: string;
    linkCopied: string;
    linkedIn: string;
    x: string;
  };
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-6 grid gap-6 tablet:grid-cols-2">
      {items.map((item) => (
        <Card key={item.id} className="flex flex-col overflow-hidden">
          {item.imageUrls.length > 0 && (
            <ImageCarousel images={item.imageUrls} alt={item.name} heightClassName="h-48" />
          )}
          <CardContent className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-text-primary">{item.name}</h3>
              <ShareToolButton
                path={`/${locale}/free-tools/downloads/${item.id}`}
                title={item.name}
                shareLabel={shareLabels.share}
                copyLabel={shareLabels.copyLink}
                copiedLabel={shareLabels.linkCopied}
                linkedInLabel={shareLabels.linkedIn}
                xLabel={shareLabels.x}
              />
            </div>
            <ToolDescription name={item.name} description={item.description} moreLabel={moreLabel} />
            {item.fileUrl && (
              <Button asChild className="mt-4 self-start">
                <a href={item.fileUrl} download>
                  <Download className="me-2 h-4 w-4" aria-hidden="true" />
                  {downloadLabel}
                </a>
              </Button>
            )}
            {!item.fileUrl && item.imageUrls.length === 0 && (
              <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Coming soon
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
