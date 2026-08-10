"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toggleBookActive, deleteBook } from "@/lib/actions/founder-books";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Per-row founder controls on the Books admin table (CyberAbeer
 * Platform Phase II): hide/show a book without losing its data, or
 * remove it outright. Same lightweight client-action pattern as the
 * rest of the founder dashboard's write operations.
 */
export function FounderBookRowActions({
  locale,
  bookId,
  isActive,
}: {
  locale: AppLocale;
  bookId: string;
  isActive: boolean;
}) {
  const [pending, setPending] = React.useState(false);

  async function handleToggle() {
    setPending(true);
    await toggleBookActive(locale, bookId, !isActive);
    setPending(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this book? This cannot be undone.")) return;
    setPending(true);
    await deleteBook(locale, bookId);
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
