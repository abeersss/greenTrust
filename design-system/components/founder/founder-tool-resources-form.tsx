"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createToolResource } from "@/lib/actions/founder-tool-resources";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder "add a tool" form (CyberAbeer Platform, migration 030).
 * Bilingual name + description, then either up to 4 gallery images
 * (shown as a sliding carousel on /free-tools) or one downloadable
 * file (PDF/xlsx/zip) -- not both. This is the founder-manageable
 * replacement for the hardcoded Downloads array that used to live in
 * free-tools/page.tsx.
 */
const MAX_IMAGES = 4;

export function FounderToolResourcesForm({ locale }: { locale: AppLocale }) {
  const [mode, setMode] = React.useState<"images" | "file">("images");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    const result = await createToolResource(locale, formData);
    if (result.status === "success") {
      setStatus("success");
      setMessage("Saved. The tool is live on the public Free Tools page.");
      formRef.current?.reset();
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 tablet:grid-cols-2">
        <div>
          <Label htmlFor="nameEn">Name (English)</Label>
          <Input id="nameEn" name="nameEn" required />
        </div>
        <div>
          <Label htmlFor="nameAr">الاسم (Arabic)</Label>
          <Input id="nameAr" name="nameAr" dir="rtl" required />
        </div>
      </div>

      <div className="grid gap-4 tablet:grid-cols-2">
        <div>
          <Label htmlFor="descriptionEn">Description (English)</Label>
          <Textarea id="descriptionEn" name="descriptionEn" rows={3} required />
        </div>
        <div>
          <Label htmlFor="descriptionAr">الوصف (Arabic)</Label>
          <Textarea id="descriptionAr" name="descriptionAr" dir="rtl" rows={3} required />
        </div>
      </div>

      <div>
        <Label>Media</Label>
        <div className="mt-1 flex gap-2">
          <Button
            type="button"
            variant={mode === "images" ? "primary" : "outline"}
            size="sm"
            onClick={() => setMode("images")}
          >
            Up to {MAX_IMAGES} images (carousel)
          </Button>
          <Button
            type="button"
            variant={mode === "file" ? "primary" : "outline"}
            size="sm"
            onClick={() => setMode("file")}
          >
            One downloadable file
          </Button>
        </div>

        {mode === "images" ? (
          <div className="mt-2">
            <Input id="images" name="images" type="file" accept="image/*" multiple />
            <p className="mt-1 text-xs text-text-muted">
              Select up to {MAX_IMAGES} images. They'll appear as a sliding carousel on the public page.
            </p>
          </div>
        ) : (
          <div className="mt-2">
            <Input id="file" name="file" type="file" accept=".pdf,.xlsx,.xls,.zip,.doc,.docx" />
            <p className="mt-1 text-xs text-text-muted">
              PDF, Excel, Word, or zip. Visitors get a direct download button.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={status === "loading"}>
          Add tool
        </Button>
        {message && (
          <p className={`text-sm ${status === "error" ? "text-danger-600" : "text-text-secondary"}`}>{message}</p>
        )}
      </div>
    </form>
  );
}
