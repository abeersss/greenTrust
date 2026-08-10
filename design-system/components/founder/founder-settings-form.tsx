"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateFounderDisplayName } from "@/lib/actions/founder-settings";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder display-name form (CyberAbeer Platform Phase II, Batch 4
 * Settings). Same status/message pattern as BannerSettingsForm.
 */
export function FounderSettingsForm({
  locale,
  initialFullName,
}: {
  locale: AppLocale;
  initialFullName: string;
}) {
  const [fullName, setFullName] = React.useState(initialFullName);
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    const result = await updateFounderDisplayName(locale, formData);
    if (result.status === "success") {
      setStatus("success");
      setMessage("Saved. Your display name is updated everywhere it's shown, including certificates.");
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Display name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={120}
          required
        />
        <p className="mt-1 text-xs text-text-muted">
          Used across the platform, including on certificates you claim.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={status === "loading"}>
          Save changes
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
