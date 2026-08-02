import * as React from "react";

export interface AchievementMedalProps {
  /** Two-digit achievement number, e.g. "01", for Labs medals -- or a
   * short CTF label like "CTF 1" for the CTF track. Printed on every
   * state; font size shrinks automatically for longer strings (see
   * numberFontSize below) so "CTF 1".."CTF 6" still fit the disc. */
  number: string;
  /** Central symbol. Keep it a single simple glyph -- it renders at
   * roughly 22x22 inside the medal disc. */
  symbol: React.ReactNode;
  locked: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Arc text along the top of the disc. Defaults to "CYBERABEER" for
   * the Labs track; the CTF track passes "CYBERABEER CTF" so the two
   * badge tracks read as visibly related but distinct at a glance,
   * without changing the medal's shape, ribbon, or gold/locked states
   * (founder spec: those stay the one consistent CyberAbeer medal). */
  arcText?: string;
}

const SIZE_PX: Record<NonNullable<AchievementMedalProps["size"]>, number> = {
  sm: 56,
  md: 88,
  lg: 128,
  xl: 176,
};

/**
 * The one consistent CyberAbeer medal shape: a ribboned disc that only
 * ever changes its number, central symbol, arc text, and locked/gold
 * state. This consistency is intentional (founder spec) -- do not vary
 * the outer shape or ribbon per achievement or per badge track.
 *
 * Gold state uses a radial gradient across the brand accent gold
 * (#f4d675 -> #c9a227 -> #a9860f) for a metallic look; locked state
 * uses the neutral-300/400 scale plus a lock glyph overlay, matching
 * the desaturated-outline direction from the founder's reference
 * mockup and the existing <AchievementBadge> locked treatment.
 */
export function AchievementMedal({ number, symbol, locked, size = "md", className, arcText = "CYBERABEER" }: AchievementMedalProps) {
  const px = SIZE_PX[size];
  const gradientId = React.useId();
  // "01".."12" (2 chars) keep the original 15px size; longer labels
  // like "CTF 1".."CTF 6" (5 chars) step down so they never overflow
  // the 26px-radius inner disc.
  const numberFontSize = number.length <= 2 ? 15 : number.length <= 4 ? 12 : 9.5;

  return (
    <svg
      viewBox="0 0 100 120"
      width={px}
      height={(px * 120) / 100}
      className={className}
      role="img"
      aria-label={locked ? `Achievement ${number}, locked` : `Achievement ${number}, unlocked`}
    >
      <defs>
        <radialGradient id={`${gradientId}-gold`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f9e6a8" />
          <stop offset="45%" stopColor="#e0bd4f" />
          <stop offset="80%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#a9860f" />
        </radialGradient>
        <radialGradient id={`${gradientId}-locked`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#dde1e6" />
          <stop offset="60%" stopColor="#c2c9d1" />
          <stop offset="100%" stopColor="#98a2ae" />
        </radialGradient>
      </defs>

      {/* Ribbon: gold tails with a black center stripe, matching the
          founder's Canva reference medal rather than the flatter
          single-tone tails used previously. */}
      <path d="M33 76 L33 116 L50 106 L67 116 L67 76 Z" fill={locked ? "#98a2ae" : "#c9a227"} opacity={locked ? 0.5 : 1} />
      <path d="M40 76 L40 111 L50 105 L50 76 Z" fill={locked ? "#71808f" : "#1a2027"} opacity={locked ? 0.6 : 0.92} />
      <path d="M60 76 L60 111 L50 105 L50 76 Z" fill={locked ? "#71808f" : "#1a2027"} opacity={locked ? 0.6 : 0.92} />
      <path d="M33 76 L33 116 L50 106 L67 116 L67 76 Z" fill="none" stroke={locked ? "#566573" : "#7a5f0d"} strokeWidth="1" opacity={locked ? 0.7 : 0.6} />

      <circle cx="50" cy="50" r="44" fill={locked ? `url(#${gradientId}-locked)` : `url(#${gradientId}-gold)`} stroke={locked ? "#71808f" : "#7a5f0d"} strokeWidth="2" />
      <circle cx="50" cy="50" r="36" fill="none" stroke={locked ? "#ffffff" : "#fdf3d0"} strokeOpacity={locked ? 0.6 : 0.5} strokeWidth="1.5" />

      <circle cx="50" cy="50" r="26" fill={locked ? "#3f4b57" : "#0f4c5c"} />

      <path
        id={`${gradientId}-arc`}
        d="M22 50 A28 28 0 0 1 78 50"
        fill="none"
      />
      <text fontSize={arcText.length > 12 ? "6" : "7.5"} fontWeight="700" letterSpacing="1.2" fill={locked ? "#dde1e6" : "#f4d675"}>
        <textPath href={`#${gradientId}-arc`} startOffset="50%" textAnchor="middle">
          {arcText}
        </textPath>
      </text>

      <g transform="translate(50 44)" color={locked ? "#c2c9d1" : "#f4d675"}>
        <g transform="translate(-11 -11)" style={{ color: "inherit" }}>
          {symbol}
        </g>
      </g>

      <text x="50" y="66" textAnchor="middle" fontSize={numberFontSize} fontWeight="800" fill={locked ? "#eef0f2" : "#ffffff"}>
        {number}
      </text>

      {locked && (
        <g transform="translate(50 50)">
          <circle r="10" fill="#566573" opacity="0.9" />
          <rect x="-5" y="-1" width="10" height="8" rx="1.5" fill="#eef0f2" />
          <path d="M-3 -1 V-4 A3 3 0 0 1 3 -4 V-1" fill="none" stroke="#eef0f2" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}
