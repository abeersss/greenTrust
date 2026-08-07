"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateHomepageBanner, type HomepageBannerSettings } from "@/lib/actions/founder-banner";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder admin form for the homepage scrolling banner (CyberAbeer
 * Platform Phase II). The banner always appends the visitor's current
 * date automatically (components/site/homepage-ticker.tsx) -- this
 * form only controls whether it's shown and what the greeting says,
 * in both languages, since the public banner must work on whichever
 * locale a visitor is on.
 */
export function BannerSettingsForm({
  locale,
  initial,
}: {
  locale: AppLocale;
  initial: HomepageBannerSettings;
}) {
  const [enabled, setEnabled] = React.useState(initial.enabled);
  const [greetingEn, setGreetingEn] = React.useState(initial.greetingEn);
  const [greetingAr, setGreetingAr] = React.useState(initial.greetingAr);
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    const result = await updateHomepageBanner(locale, formData);
    if (result.status === "success") {
      setStatus("success");
      setMessage("Saved. The homepage banner is updated.");
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Switch id="banner-enabled" name="enabled" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="banner-enabled">Show the scrolling banner on the homepage</Label>
      </div>

      <div>
        <Label htmlFor="greeting-en">Greeting (English)</Label>
        <Textarea
          id="greeting-en"
          name="greetingEn"
          required
          rows={2}
          value={greetingEn}
          onChange={(e) => setGreetingEn(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="greeting-ar">Greeting (Arabic)</Label>
        <Textarea
          id="greeting-ar"
          name="greetingAr"
          required
          rows={2}
          dir="rtl"
          value={greetingAr}
          onChange={(e) => setGreetingAr(e.target.value)}
          className="mt-1 font-arabic"
        />
      </div>

      <p className="text-xs text-text-muted">
        The current date is added automatically, formatted for each language -- you only need to write the
        greeting.
      </p>

      {message && (
        <p className={`text-sm ${status === "error" ? "text-danger-600" : "text-text-secondary"}`}>{message}</p>
      )}

      <Button type="submit" className="self-start" loading={status === "loading"}>
        Save banner
      </Button>
    </form>
  );
}
