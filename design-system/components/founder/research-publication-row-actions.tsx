"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  toggleResearchPublicationActive,
  deleteResearchPublication,
} from "@/lib/actions/founder-research";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Per-row founder controls on the Research publications admin list
 * (CyberAbeer Platform Phase II, migration 031): hide/show a
 * publication without losing it, or remove it outright. Same pattern
 * as FounderBookRowActions.
 */
export function ResearchPublicationRowActions({
  locale,
  publicationId,
  isActive,
}: {
  locale: AppLocale;
  publicationId: string;
  isActive: boolean;
}) {
  const [pending, setPending] = React.useState(false);

  async function handleToggle() {
    setPending(true);
    await toggleResearchPublicationActive(locale, publicationId, !isActive);
    setPending(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this publication? This cannot be undone.")) return;
    setPending(true);
    await deleteResearchPublication(locale, publicationId);
    setPending(false);
  }

  return (
    <div className="flex shrink-0 gap-2">
      <Button variant="outline" size="sm" onClick={handleToggle} disabled={pending}>
        {isActive ? "Hide" : "Show"}
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
        Delete
      </Button>
    </div>
  );
}
