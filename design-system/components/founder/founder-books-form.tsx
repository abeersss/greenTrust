"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createBook } from "@/lib/actions/founder-books";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder "add a book" form (CyberAbeer Platform Phase II). Exactly
 * the three fields the public page needs: title, description, and
 * the Amazon purchase link. New books start active/visible -- the
 * founder can hide one later from the list below without deleting it.
 */
export function FounderBooksForm({ locale }: { locale: AppLocale }) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [amazonUrl, setAmazonUrl] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    const result = await createBook(locale, formData);
    if (result.status === "success") {
      setStatus("success");
      setMessage("Saved. The book is live on the public Books page.");
      setTitle("");
      setDescription("");
      setAmazonUrl("");
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="amazonUrl">Amazon link</Label>
        <Input
          id="amazonUrl"
          name="amazonUrl"
          type="url"
          placeholder="https://www.amazon.com/dp/..."
          value={amazonUrl}
          onChange={(e) => setAmazonUrl(e.target.value)}
          required
        />
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
