import * as React from "react";

export interface CyberAbeerMarkProps {
  className?: string;
  /** "on-dark" swaps the shield fill for the dark-mode-safe tone. Use
   * on dark headers/hero sections; default suits light surfaces. */
  variant?: "default" | "on-dark";
  /** Accessible title. Pass `""` (empty string) to mark the mark as
   * purely decorative when it sits next to visible "CyberAbeer" text. */
  title?: string;
}

/**
 * The CyberAbeer brand mark: a shield (defense) with a keyhole (trust,
 * investigation, access) crossed by a circuit trace (digital/technical
 * identity), ringed in the brand's gold accent (intelligence, earned
 * achievement). Deliberately NOT the generic 3D atom graphic that had
 * been used as a placeholder -- that graphic communicates "science", not
 * cybersecurity, and was never an intentional brand choice.
 *
 * Colors are the literal CyberAbeer brand hex values from tokens.css
 * (--color-primary-700/--color-primary-500 and --color-accent-500/600),
 * not CSS custom properties: a logo is a fixed brand asset that should
 * read as "CyberAbeer" the same way in every context, including inside
 * an <img>/favicon/OG-image export where CSS variables aren't available.
 *
 * Single-color-family, holds up at 16px (favicon) through hero scale:
 * the silhouette (shield + keyhole cutout) is legible even at sizes
 * where the gold ring and circuit trace read as a single accent tone.
 */
export function CyberAbeerMark({ className, variant = "default", title = "CyberAbeer" }: CyberAbeerMarkProps) {
  const shieldFill = variant === "on-dark" ? "#123746" : "#0f4c5c";
  const shieldStroke = variant === "on-dark" ? "#0a232c" : "#0a323c";
  const gold = "#c9a227";
  const goldDark = "#a9860f";
  const cutout = variant === "on-dark" ? "#0a232c" : "#ffffff";

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M32 4 L53 11.5 V29 C53 45.5 44.5 55 32 60 C19.5 55 11 45.5 11 29 V11.5 Z"
        fill={shieldFill}
        stroke={shieldStroke}
        strokeWidth="1.5"
      />
      <circle cx="32" cy="20.5" r="12.5" fill="none" stroke={gold} strokeWidth="2" />
      <line x1="11" y1="30" x2="21" y2="30" stroke={gold} strokeWidth="2" strokeLinecap="round" />
      <line x1="43" y1="30" x2="53" y2="30" stroke={gold} strokeWidth="2" strokeLinecap="round" />
      <circle cx="21" cy="30" r="2" fill={gold} />
      <circle cx="43" cy="30" r="2" fill={gold} />
      <g>
        <circle cx="32" cy="27" r="6" fill={cutout} />
        <path d="M28.4 32 H35.6 L33 45 H31 Z" fill={cutout} />
      </g>
      <circle cx="32" cy="27" r="6" fill="none" stroke={goldDark} strokeOpacity="0.35" strokeWidth="1" />
    </svg>
  );
}
