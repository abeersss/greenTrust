import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared founder-media upload helper (CyberAbeer Platform). Every
 * admin-uploaded image or downloadable file (tool resource images/
 * PDFs, book gallery images) goes into the same public "media"
 * Storage bucket (migration 030), under a folder per feature so
 * assets stay easy to find in the Supabase dashboard. Write access to
 * this bucket is admin-only via storage.objects RLS -- this helper
 * assumes the caller already ran requireFounder() first, same as
 * every other founder write path in the app.
 */
function safeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned.slice(-80) || "file";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadMediaFile(supabase: SupabaseClient<any>, folder: string, file: File): Promise<string> {
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
