import type { DgCategoryRoute } from "@/lib/data-governance/config";

const GREEN = "#34d399";
const CYAN = "#22d3ee";
const AMBER = "#f59e0b";
const NAVY = "#0a1a31";
const PANEL = "#11284b";
const LINE = "#2a4a76";

/**
 * Original, decorative SVG illustrations, one per discipline. They carry
 * no text so they need no translation and render identically in LTR and
 * RTL. Purely presentational (aria-hidden); the surrounding card holds
 * the accessible name.
 *
 * Composition rules shared by all four: a 240x150 canvas, a centered
 * soft glow, a single focal object inside a 24px safe margin, one green
 * accent and one cyan accent, 2px strokes with rounded joins. The
 * container must keep an 8:5 aspect ratio so nothing is ever cropped.
 */
export function CategoryIllustration({
  kind,
  className,
}: {
  kind: DgCategoryRoute;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 150"
      className={className}
      role="presentation"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`dg-bg-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#10305a" />
          <stop offset="1" stopColor={NAVY} />
        </linearGradient>
        <radialGradient id={`dg-glow-${kind}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={CYAN} stopOpacity="0.22" />
          <stop offset="1" stopColor={CYAN} stopOpacity="0" />
        </radialGradient>
        <pattern id={`dg-dots-${kind}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill={LINE} opacity="0.55" />
        </pattern>
      </defs>
      <rect width="240" height="150" fill={`url(#dg-bg-${kind})`} />
      <rect width="240" height="150" fill={`url(#dg-dots-${kind})`} />
      <ellipse cx="120" cy="75" rx="105" ry="68" fill={`url(#dg-glow-${kind})`} />
      <g strokeLinecap="round" strokeLinejoin="round">
        {kind === "classification" && <Classification />}
        {kind === "governance" && <Governance />}
        {kind === "quality" && <Quality />}
        {kind === "mdm" && <Mdm />}
      </g>
    </svg>
  );
}

function Classification() {
  return (
    <g>
      <rect x="64" y="24" width="82" height="102" rx="9" fill={PANEL} stroke={CYAN} strokeWidth="2" />
      <path d="M130 24v14a4 4 0 0 0 4 4h12" fill="none" stroke={CYAN} strokeWidth="2" opacity="0.7" />
      <rect x="76" y="40" width="40" height="5" rx="2.5" fill={LINE} />
      <rect x="76" y="52" width="56" height="5" rx="2.5" fill={LINE} />
      <rect x="76" y="64" width="34" height="5" rx="2.5" fill={LINE} />
      <rect x="76" y="82" width="26" height="12" rx="6" fill={GREEN} />
      <rect x="106" y="82" width="26" height="12" rx="6" fill={CYAN} />
      <rect x="76" y="100" width="26" height="12" rx="6" fill={AMBER} />
      <g transform="translate(138 70)">
        <circle cx="26" cy="26" r="25" fill={NAVY} stroke={GREEN} strokeWidth="2" />
        <rect x="14.500" y="25" width="23" height="17" rx="4" fill={GREEN} />
        <path d="M18.500 25v-5a7.500 7.500 0 0 1 15 0v5" fill="none" stroke={GREEN} strokeWidth="3" />
        <circle cx="26" cy="33.500" r="2.500" fill={NAVY} />
      </g>
    </g>
  );
}

function Governance() {
  return (
    <g>
      <path d="M120 54v14M60 68h120M60 68v14M120 68v14M180 68v14" fill="none" stroke={CYAN} strokeWidth="2" opacity="0.85" />
      <circle cx="120" cy="36" r="18" fill={PANEL} stroke={GREEN} strokeWidth="2" />
      <path d="M120 25l10 4v7c0 6-4.200 10-10 12.500-5.800-2.500-10-6.500-10-12.500v-7z" fill={GREEN} />
      <path d="M115 36l4 4 7-8" fill="none" stroke={NAVY} strokeWidth="2.500" />
      {[60, 120, 180].map((x) => (
        <g key={x}>
          <rect x={x - 22} y="82" width="44" height="30" rx="7" fill={PANEL} stroke={CYAN} strokeWidth="1.500" />
          <circle cx={x} cy="94" r="4.500" fill={GREEN} />
          <rect x={x - 12} y="102" width="24" height="4" rx="2" fill={LINE} />
        </g>
      ))}
    </g>
  );
}

function Quality() {
  const bars = [
    { x: 42, h: 34 },
    { x: 66, h: 52 },
    { x: 90, h: 42 },
    { x: 114, h: 68 },
    { x: 138, h: 58 },
  ];
  return (
    <g>
      <rect x="28" y="24" width="144" height="102" rx="9" fill={PANEL} stroke={LINE} strokeWidth="1.500" />
      {bars.map((b, i) => (
        <rect
          key={b.x}
          x={b.x}
          y={114 - b.h}
          width="16"
          height={b.h}
          rx="3"
          fill={i === 3 ? GREEN : CYAN}
          opacity={i === 3 ? 1 : 0.7}
        />
      ))}
      <path d="M42 56l24-10 24 7 24-18 24 8" fill="none" stroke={GREEN} strokeWidth="2" />
      <g transform="translate(168 50)">
        <circle cx="26" cy="26" r="24" fill={NAVY} stroke={LINE} strokeWidth="5" />
        <path d="M26 2a24 24 0 1 1-22.800 31.200" fill="none" stroke={GREEN} strokeWidth="5" />
        <path d="M16 26l7 7 13-14" fill="none" stroke={GREEN} strokeWidth="3.500" />
      </g>
    </g>
  );
}

function Mdm() {
  const nodes = [
    { x: 46, y: 34 },
    { x: 46, y: 76 },
    { x: 46, y: 118 },
    { x: 194, y: 34 },
    { x: 194, y: 76 },
    { x: 194, y: 118 },
  ];
  return (
    <g>
      <g stroke={CYAN} strokeWidth="1.500" opacity="0.7">
        {nodes.map((n) => (
          <line key={`${n.x}-${n.y}`} x1={n.x} y1={n.y} x2="120" y2="76" />
        ))}
      </g>
      {nodes.map((n) => (
        <g key={`n-${n.x}-${n.y}`}>
          <rect x={n.x - 18} y={n.y - 11} width="36" height="22" rx="6" fill={PANEL} stroke={LINE} strokeWidth="1.500" />
          <rect x={n.x - 10} y={n.y - 5} width="20" height="3.500" rx="1.750" fill={CYAN} opacity="0.85" />
          <rect x={n.x - 10} y={n.y + 2} width="13" height="3.500" rx="1.750" fill={LINE} />
        </g>
      ))}
      <circle cx="120" cy="76" r="32" fill={NAVY} stroke={GREEN} strokeWidth="2" />
      <circle cx="120" cy="76" r="23" fill={PANEL} stroke={GREEN} strokeWidth="1.500" strokeDasharray="3 3" />
      <path d="M120 62l4.600 9.300 10.300 1.500-7.500 7.200 1.800 10.200-9.200-4.800-9.200 4.800 1.800-10.200-7.500-7.200 10.300-1.500z" fill={GREEN} />
    </g>
  );
}
