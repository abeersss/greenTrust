import type { MetadataRoute } from "next";

/**
 * Minimal web app manifest. No icon files exist yet in this build
 * (see the TODO in app/opengraph-image.tsx for the same reason: no
 * logo asset has been supplied), so `icons` is left empty rather than
 * pointing at files that don't exist. Add a real icon set here once
 * one is designed.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CyberAbeer",
    short_name: "CyberAbeer",
    description: "GreenTrust AI and CyberAbeer Labs.",
    start_url: "/en",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f4c5c",
    icons: [],
  };
}
