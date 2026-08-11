"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, FileIcon } from "lucide-react";
import {
  toggleToolResourceActive,
  deleteToolResource,
  updateToolResource,
} from "@/lib/actions/founder-tool-resources";
import type { AppLocale } from "@/lib/i18n/config";
import type { FounderToolResourceRow } from "@/lib/founder/tool-resources-admin";

const MAX_IMAGES = 4;

/**
 * Single row on the Tool Resources admin list (CyberAbeer Platform,
 * migration 030). Combines the read-only display + Hide/Delete
 * controls with an inline "Edit" mode so the founder can fix a name,
 * description, or swap the media on an existing tool without
 * deleting and re-adding it. Images and the downloadable file are
 * independent -- a tool can carry both at once, and each picker only
 * replaces its own media type when a new one is attached; leaving a
 * picker empty keeps whatever is already live for that type.
 */
export function FounderToolResourceCard({
  locale,
  tool,
}: {
  locale: AppLocale;
  tool: FounderToolResourceRow;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleToggle() {
    setPending(true);
    await toggleToolResourceActive(locale, tool.id, !tool.isActive);
    router.refresh();
    setPending(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this tool? This cannot be undone.")) return;
    setPending(true);
    await deleteToolResource(locale, tool.id);
    router.refresh();
    setPending(false);
  }

  async function handleUpdate(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    const result = await updateToolResource(locale, tool.id, formData);
    if (result.status === "success") {
      setStatus("success");
      router.refresh();
      setEditing(false);
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  if (editing) {
    return (
      <Card>
        <CardContent className="p-4">
          <form action={handleUpdate} className="space-y-4">
            <div className="grid gap-4 tablet:grid-cols-2">
              <div>
                <Label htmlFor={`nameEn-${tool.id}`}>Name (English)</Label>
                <Input id={`nameEn-${tool.id}`} name="nameEn" defaultValue={tool.nameEn} required />
              </div>
              <div>
                <Label htmlFor={`nameAr-${tool.id}`}>الاسم (Arabic)</Label>
                <Input id={`nameAr-${tool.id}`} name="nameAr" dir="rtl" defaultValue={tool.nameAr} required />
              </div>
            </div>

            <div className="grid gap-4 tablet:grid-cols-2">
              <div>
                <Label htmlFor={`descriptionEn-${tool.id}`}>Description (English)</Label>
                <Textarea
                  id={`descriptionEn-${tool.id}`}
                  name="descriptionEn"
                  rows={3}
                  defaultValue={tool.descriptionEn}
                  required
                />
              </div>
              <div>
                <Label htmlFor={`descriptionAr-${tool.id}`}>الوصف (Arabic)</Label>
                <Textarea
                  id={`descriptionAr-${tool.id}`}
                  name="descriptionAr"
                  dir="rtl"
                  rows={3}
                  defaultValue={tool.descriptionAr}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 tablet:grid-cols-2">
              <div>
                <Label htmlFor={`images-${tool.id}`}>
                  Images {tool.imageUrls.length > 0 ? `(currently ${tool.imageUrls.length})` : "(none yet)"}
                </Label>
                <Input id={`images-${tool.id}`} name="images" type="file" accept="image/*" multiple />
                <p className="mt-1 text-xs text-text-muted">
                  Leave blank to keep the current {tool.imageUrls.length > 0 ? "images" : "gallery"}. Selecting new
                  ones (up to {MAX_IMAGES}) replaces the whole set.
                </p>
              </div>
              <div>
                <Label htmlFor={`file-${tool.id}`}>
                  File {tool.fileUrl ? `(currently ${tool.fileName ?? "set"})` : "(none yet)"}
                </Label>
                <Input id={`file-${tool.id}`} name="file" type="file" accept=".pdf,.xlsx,.xls,.zip,.doc,.docx" />
                <p className="mt-1 text-xs text-text-muted">
                  Leave blank to keep the current file. PDF, Excel, Word, or zip -- replaces it if attached.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" loading={status === "loading"}>
                Save changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={status === "loading"}
              >
                Cancel
              </Button>
              {message && (
                <p className={`text-sm ${status === "error" ? "text-danger-600" : "text-text-secondary"}`}>
                  {message}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-text-primary">{tool.nameEn}</p>
              <span className="text-text-muted" dir="rtl">
                {tool.nameAr}
              </span>
              <Badge variant={tool.isActive ? "success" : "danger"}>{tool.isActive ? "Live" : "Hidden"}</Badge>
              {tool.imageUrls.length > 0 && (
                <Badge variant="primary">
                  <ImageIcon className="me-1 inline h-3 w-3" aria-hidden="true" />
                  {tool.imageUrls.length} image{tool.imageUrls.length > 1 ? "s" : ""}
                </Badge>
              )}
              {tool.fileUrl && (
                <Badge variant="primary">
                  <FileIcon className="me-1 inline h-3 w-3" aria-hidden="true" />
                  {tool.fileName ?? "File"}
                </Badge>
              )}
              {tool.imageUrls.length === 0 && !tool.fileUrl && <Badge variant="danger">No media yet</Badge>}
            </div>
            <p className="mt-1 text-sm text-text-muted">{tool.descriptionEn}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} disabled={pending}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleToggle} disabled={pending}>
              {tool.isActive ? "Hide" : "Show"}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
