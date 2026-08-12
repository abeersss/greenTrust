"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toggleResearchAreaActive, deleteResearchArea } from "@/lib/actions/founder-research";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Per-row founder controls on the Research areas admin list
 * (CyberAbeer Platform Phase II, migration 031): hide/show an area
 * without losing it, or remove it outright. Same pattern as
 * FounderBookRowActions.
 */
export function ResearchAreaRowActions({
  locale,
  areaId,
  isActive,
}: {
  locale: AppLocale;
  areaId: string;
  isActive: boolean;
}) {
  const [pending, setPending] = React.useState(false);

  async function handleToggle() {
    setPending(true);
    await toggleResearchAreaActive(locale, areaId, !isActive);
    setPending(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this research area? This cannot be undone.")) return;
    setPending(true);
    await deleteResearchArea(locale, areaId);
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
