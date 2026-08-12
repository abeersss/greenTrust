"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  updateResearchSettings,
  type ResearchSettingsForm as ResearchSettingsData,
} from "@/lib/actions/founder-research";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder editor for the Research page's bilingual intro paragraph
 * (CyberAbeer Platform Phase II, migration 031). Same singleton-
 * settings pattern as BannerSettingsForm.
 */
export function ResearchSettingsForm({
  locale,
  initial,
}: {
  locale: AppLocale;
  initial: ResearchSettingsData;
}) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    const result = await updateResearchSettings(locale, formData);
    if (result.status === "success") {
      setStatus("success");
      setMessage("Saved. The intro is live on the public Research page.");
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="introEn">Intro paragraph (English)</Label>
        <Textarea id="introEn" name="introEn" defaultValue={initial.introEn} rows={4} required />
      </div>

      <div>
        <Label htmlFor="introAr">Intro paragraph (Arabic)</Label>
        <Textarea id="introAr" name="introAr" defaultValue={initial.introAr} rows={4} dir="rtl" required />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={status === "loading"}>
          Save
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
