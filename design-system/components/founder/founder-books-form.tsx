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
 *
 * Image uploads are compressed client-side (downscaled + re-encoded
 * as JPEG) before the form ever submits. Server Actions still travel
 * through the platform's request pipeline like a normal POST, which
 * caps payload size well below what next.config's own
 * serverActions.bodySizeLimit allows -- an uncompressed phone photo
 * or two pushes past that cap and the platform rejects the request
 * with a 413 before our action code ever runs. handleSubmit also
 * guards every step in try/catch: a failed submission (413, dropped
 * connection, anything) now surfaces as an inline error message
 * instead of throwing on an undefined result and crashing the whole
 * page to Next's generic error screen.
 */
const MAX_IMAGES = 4;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

async function compressFormImages(formData: FormData, fieldNames: string[]): Promise<FormData> {
  const compressed = new FormData();
  for (const [key, value] of formData.entries()) {
    if (fieldNames.includes(key) && value instanceof File && value.size > 0) {
      compressed.append(key, await compressImage(value));
    } else {
      compressed.append(key, value);
    }
  }
  return compressed;
}

export function FounderBooksForm({ locale }: { locale: AppLocale }) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    try {
      const compact = await compressFormImages(formData, ["imagesEn", "imagesAr"]);
      const result = await createBook(locale, compact);
      if (result?.status === "success") {
        setStatus("success");
        setMessage("Saved. Both editions are live on the public Books page.");
        formRef.current?.reset();
      } else {
        setStatus("error");
        setMessage(result?.message ?? "Could not save the book. Please try again.");
      }
    } catch (err) {
      console.error("createBook submit failed", err);
      setStatus("error");
      setMessage(
        "Could not save the book. If you attached cover images, try fewer images or smaller files and try again."
      );
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
