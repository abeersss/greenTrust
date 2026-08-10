"use client";

import { Download, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/site/image-carousel";
import type { ToolResource } from "@/lib/tools/tool-resources";

/**
 * Founder-managed Free Tools "Downloads" grid (CyberAbeer Platform,
 * migration 030). Each tool_resources row shows either a sliding
 * image carousel or a direct download button for its file -- founder
 * decides per tool via /founder/tool-resources, no code changes
 * needed to add a 5th, 6th, etc.
 */
export function ToolResourcesGrid({
  items,
  downloadLabel,
}: {
  items: ToolResource[];
  downloadLabel: string;
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
            <h3 className="font-display text-lg font-bold text-text-primary">{item.name}</h3>
            <p className="mt-2 flex-1 text-sm text-text-secondary">{item.description}</p>
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
