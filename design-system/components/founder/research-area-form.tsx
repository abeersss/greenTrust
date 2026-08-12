"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createResearchArea } from "@/lib/actions/founder-research";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder "add a research area" form (CyberAbeer Platform Phase II,
 * migration 031). Both languages are required -- the public page has
 * no fallback when one is missing. New areas start active/visible.
 */
export function ResearchAreaForm({ locale }: { locale: AppLocale }) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    const result = await createResearchArea(locale, formData);
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
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1">
        <Label htmlFor="areaTextEn">English</Label>
        <Input id="areaTextEn" name="textEn" required />
      </div>
      <div className="min-w-[200px] flex-1">
        <Label htmlFor="areaTextAr">Arabic</Label>
        <Input id="areaTextAr" name="textAr" dir="rtl" required />
      </div>
      <Button type="submit" loading={status === "loading"}>
        Add
      </Button>
      {message && (
        <p className={`w-full text-sm ${status === "error" ? "text-danger-600" : "text-text-secondary"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
