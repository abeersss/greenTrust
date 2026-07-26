import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CyberAbeer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Site-wide default OpenGraph image, generated at request time rather
 * than a static asset, so the CyberAbeer brand colors (from
 * styles/tokens.css) stay in sync automatically if the palette ever
 * changes. No product screenshot or logo file exists yet, so this is
 * a deliberately simple wordmark-on-brand-color card rather than a
 * placeholder image implying a real screenshot.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f4c5c",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, display: "flex" }}>CyberAbeer</div>
        <div style={{ fontSize: 28, marginTop: 16, color: "#eaf2f3", display: "flex" }}>
          GreenTrust AI · CyberAbeer Labs
        </div>
      </div>
    ),
    { ...size }
  );
}
