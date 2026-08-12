"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createBook } from "@/lib/actions/founder-books";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder "add a book" form (CyberAbeer Platform Phase II). Every
 * book needs a complete English edition and a complete Arabic
 * edition -- separate title, description, Amazon link, and up to 4
 * cover images each (migration 032) -- since the two are genuinely
 * different storefront listings, not a single record with a
 * translated label. New books start active/visible on both locales;
 * the founder can hide one later from the list below without
 * deleting it.
 */
const MAX_IMAGES = 4;

export function FounderBooksForm({ locale }: { locale: AppLocale }) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    const result = await createBook(locale, formData);
    if (result.status === "success") {
      setStatus("success");
      setMessage("Saved. Both editions are live on the public Books page.");
      formRef.current?.reset();
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 tablet:grid-cols-2">
        <div className="space-y-4 rounded-control border border-border p-4">
          <p className="text-sm font-semibold text-text-primary">English edition</p>
          <div>
            <Label htmlFor="titleEn">Title</Label>
            <Input id="titleEn" name="titleEn" required />
          </div>
          <div>
            <Label htmlFor="descriptionEn">Description</Label>
            <Textarea id="descriptionEn" name="descriptionEn" rows={4} required />
          </div>
          <div>
            <Label htmlFor="amazonUrlEn">Amazon link</Label>
            <Input
              id="amazonUrlEn"
              name="amazonUrlEn"
              type="url"
              placeholder="https://www.amazon.com/dp/..."
              required
            />
          </div>
          <div>
            <Label htmlFor="imagesEn">Cover images (optional, up to {MAX_IMAGES})</Label>
            <Input id="imagesEn" name="imagesEn" type="file" accept="image/*" multiple />
          </div>
        </div>

        <div className="space-y-4 rounded-control border border-border p-4" dir="rtl">
          <p className="text-sm font-semibold text-text-primary">النسخة العربية</p>
          <div>
            <Label htmlFor="titleAr">العنوان</Label>
            <Input id="titleAr" name="titleAr" required dir="rtl" />
          </div>
          <div>
            <Label htmlFor="descriptionAr">الوصف</Label>
            <Textarea id="descriptionAr" name="descriptionAr" rows={4} required dir="rtl" />
          </div>
          <div>
            <Label htmlFor="amazonUrlAr">رابط أمازون</Label>
            <Input
              id="amazonUrlAr"
              name="amazonUrlAr"
              type="url"
              placeholder="https://www.amazon.sa/dp/..."
              required
              dir="ltr"
            />
          </div>
          <div>
            <Label htmlFor="imagesAr">صور الغلاف (اختياري، حتى {MAX_IMAGES})</Label>
            <Input id="imagesAr" name="imagesAr" type="file" accept="image/*" multiple />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={status === "loading"}>
          Add book
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
