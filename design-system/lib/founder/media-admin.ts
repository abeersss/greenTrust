import "server-only";
import { siteUrl } from "@/lib/seo/site";

export type MediaFile = {
  label: string;
  path: string;
  category: "Downloads" | "Audio" | "Video";
  reachable: boolean;
  sizeKB: number | null;
  contentType: string | null;
};

/**
 * Founder Media Library (CyberAbeer Platform Phase II, Batch 3). There
 * is no CMS-managed upload system or storage bucket anywhere in this
 * codebase -- every media asset the site actually links to lives in
 * design-system/public and ships as a static file as part of the
 * Next.js build. Rather than fabricate a dynamic asset manager, this
 * catalogs the real files and live-checks each one with a HEAD
 * request against the production origin, so a founder sees whether
 * an asset is genuinely reachable and how large it is, not just that
 * a row exists in a list.
 */
const MEDIA_CATALOG: { label: string; path: string; category: MediaFile["category"] }[] = [
  { label: "Aegis GRC Platform (ZIP)", path: "/downloads/CyberAbeer_Aegis_GRC_Platform.zip", category: "Downloads" },
  { label: "ISO 27001:2022 SoA Tracker", path: "/downloads/CyberAbeer_ISO27001_2022_SoA_Tracker.xlsx", category: "Downloads" },
  { label: "Incident Response Log + MTTR", path: "/downloads/CyberAbeer_Incident_Response_Log_MTTR.xlsx", category: "Downloads" },
  { label: "Risk Register + Heat Map", path: "/downloads/CyberAbeer_Risk_Register_Heat_Map.xlsx", category: "Downloads" },
  { label: "Labs Mascot Video", path: "/mascot/A cute green agile character with robot-like features but more organic and playful, funny looking with cybersecurity theme, animated movement, friendly and approachable design, tech-inspired but not fully robotic.mp4", category: "Video" },
  { label: "Mascot Tap Sound", path: "/sounds/WhatsApp Audio 2026-08-02 at 9.11.23 PM.mp4", category: "Audio" },
  { label: "Site Identity Song", path: "/audio/uri_ifs___A_pHanf2va3pU-rTK-eBqwKzDc-_TdCjTv3o-EAmx2pNk (1).m4a", category: "Audio" },
];

export async function getAllMediaFiles(): Promise<MediaFile[]> {
  const results = await Promise.all(
    MEDIA_CATALOG.map(async (entry) => {
      try {
        const res = await fetch(siteUrl + encodeURI(entry.path), {
          method: "HEAD",
          cache: "no-store",
        });
        const lengthHeader = res.headers.get("content-length");
        return {
          ...entry,
          reachable: res.ok,
          sizeKB: lengthHeader ? Math.round(Number(lengthHeader) / 1024) : null,
          contentType: res.headers.get("content-type"),
        };
      } catch {
        return { ...entry, reachable: false, sizeKB: null, contentType: null };
      }
    })
  );
  return results;
}
