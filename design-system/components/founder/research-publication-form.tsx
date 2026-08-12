"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createResearchPublication } from "@/lib/actions/founder-research";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder "add a publication" form (CyberAbeer Platform Phase II,
 * migration 031). Title, venue, year, and a DOI/article link are all
 * required, replacing the previous hardcoded PUBLICATIONS constant.
 * Titles stay English-only on both locales, matching the existing
 * academic-citation convention. New publications start active/visible.
 */
export function ResearchPublicationForm({ locale }: { locale: AppLocale }) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    const result = await createResearchPublication(locale, formData);
    if (result.status === "success") {
      setStatus("success");
      setMessage("Added.");
      formRef.current?.reset();
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="pubTitle">Title</Label>
        <Input id="pubTitle" name="title" required />
      </div>

      <div className="grid gap-4 tablet:grid-cols-2">
        <div>
          <Label htmlFor="pubVenue">Venue</Label>
          <Input id="pubVenue" name="venue" placeholder="SSRN Preprint" required />
        </div>
        <div>
          <Label htmlFor="pubYear">Year</Label>
          <Input id="pubYear" name="year" placeholder="2026" required />
        </div>
      </div>

      <div>
        <Label htmlFor="pubDoiUrl">Link (DOI or article URL)</Label>
        <Input id="pubDoiUrl" name="doiUrl" type="url" placeholder="https://doi.org/..." required />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={status === "loading"}>
          Add publication
        </Button>
        {message && (
          <p className={`text-sm ${status === "error" ? "text-danger-600" : "text-text-secondary"}`}>
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
