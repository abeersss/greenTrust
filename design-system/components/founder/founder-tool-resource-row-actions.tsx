"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toggleToolResourceActive, deleteToolResource } from "@/lib/actions/founder-tool-resources";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Per-row founder controls on the Tool Resources admin table
 * (CyberAbeer Platform, migration 030). Same hide/show + delete
 * pattern as founder-book-row-actions.tsx.
 */
export function FounderToolResourceRowActions({
  locale,
  id,
  isActive,
}: {
  locale: AppLocale;
  id: string;
  isActive: boolean;
}) {
  const [pending, setPending] = React.useState(false);

  async function handleToggle() {
    setPending(true);
    await toggleToolResourceActive(locale, id, !isActive);
    setPending(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this tool? This cannot be undone.")) return;
    setPending(true);
    await deleteToolResource(locale, id);
    setPending(false);
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleToggle} disabled={pending}>
        {isActive ? "Hide" : "Show"}
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
        Delete
      </Button>
    </div>
  );
}
