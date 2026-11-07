import type { DgCategoryRoute } from "@/lib/data-governance/config";

const GREEN = "#34d399";
const CYAN = "#22d3ee";
const NAVY = "#0b1b33";
const PANEL = "#12284a";
const LINE = "#27456f";

/**
 * Original, decorative SVG illustrations, one per discipline. They carry
 * no text so they need no translation and render identically in LTR and
 * RTL. Purely presentational (aria-hidden); the surrounding card holds
 * the accessible name.
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
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`dg-bg-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0f2a4d" />
          <stop offset="1" stopColor={NAVY} />
        </linearGradient>
      </defs>
      <rect width="240" height="150" fill={`url(#dg-bg-${kind})`} />
      <g stroke={LINE} strokeWidth="0.6" opacity="0.5">
        {[30, 60, 90, 120].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="240" y2={y} />
        ))}
        {[40, 80, 120, 160, 200].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="150" />
        ))}
      </g>
      {kind === "classification" && <Classification />}
      {kind === "governance" && <Governance />}
      {kind === "quality" && <Quality />}
      {kind === "mdm" && <Mdm />}
    </svg>
  );
}

function Classification() {
  return (
    <g>
      <rect x="62" y="24" width="84" height="104" rx="8" fill={PANEL} stroke={CYAN} strokeWidth="1.5" />
      <rect x="74" y="40" width="46" height="5" rx="2.5" fill={LINE} />
      <rect x="74" y="52" width="60" height="5" rx="2.5" fill={LINE} />
      <rect x="74" y="64" width="38" height="5" rx="2.5" fill={LINE} />
      <rect x="74" y="76" width="56" height="5" rx="2.5" fill={LINE} />
      <rect x="74" y="92" width="26" height="12" rx="6" fill={GREEN} opacity="0.9" />
      <rect x="104" y="92" width="26" height="12" rx="6" fill={CYAN} opacity="0.85" />
      <rect x="74" y="108" width="26" height="12" rx="6" fill="#f59e0b" opacity="0.9" />
      <g transform="translate(150 70)">
        <circle cx="26" cy="26" r="26" fill={NAVY} stroke={GREEN} strokeWidth="1.5" />
        <rect x="14" y="24" width="24" height="18" rx="4" fill={GREEN} />
        <path d="M18 24v-5a8 8 0 0 1 16 0v5" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
        <circle cx="26" cy="33" r="2.5" fill={NAVY} />
      </g>
    </g>
  );
}

function Governance() {
  return (
    <g>
      <g stroke={CYAN} strokeWidth="1.5" fill="none" opacity="0.8">
        <path d="M120 54v18M120 72H70v14M120 72h50v14M120 72v14" />
      </g>
      <circle cx="120" cy="38" r="17" fill={PANEL} stroke={GREEN} strokeWidth="2" />
      <path d="M120 28l9 3.5v6c0 5.5-3.8 9-9 11-5.2-2-9-5.500-9-11v-6z" fill={GREEN} opacity="0.9" />
      {[70, 120, 170].map((x) => (
        <g key={x}>
          <rect x={x - 20} y="86" width="40" height="22" rx="6" fill={PANEL} stroke={CYAN} strokeWidth="1.2" />
          <circle cx={x} cy="95" r="3.5" fill={GREEN} />
          <rect x={x - 11} y="101" width="22" height="3" rx="1.5" fill={LINE} />
        </g>
      ))}
      <rect x="52" y="118" width="136" height="6" rx="3" fill={LINE} opacity="0.7" />
    </g>
  );
}

function Quality() {
  const bars = [
    { x: 40, h: 38 },
    { x: 66, h: 56 },
    { x: 92, h: 46 },
    { x: 118, h: 72 },
    { x: 144, h: 62 },
  ];
  return (
    <g>
      <rect x="30" y="22" width="130" height="108" rx="8" fill={PANEL} stroke={LINE} strokeWidth="1" />
      {bars.map((b, i) => (
        <rect
          key={b.x}
          x={b.x}
          y={122 - b.h}
          width="16"
          height={b.h}
          rx="3"
          fill={i === 3 ? GREEN : CYAN}
          opacity={i === 3 ? 1 : 0.75}
        />
      ))}
      <path d="M40 60l26-12 26 8 26-20 26 10" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(176 54)">
        <circle cx="26" cy="26" r="24" fill={NAVY} stroke={LINE} strokeWidth="5" />
        <path d="M26 2a24 24 0 1 1-22.8 31.200" fill="none" stroke={GREEN} strokeWidth="5" strokeLinecap="round" />
        <path d="M16 26l7 7 13-14" fill="none" stroke={GREEN} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

function Mdm() {
  const nodes = [
    { x: 40, y: 34 },
    { x: 40, y: 76 },
    { x: 40, y: 118 },
    { x: 200, y: 34 },
    { x: 200, y: 76 },
    { x: 200, y: 118 },
  ];
  return (
    <g>
      <g stroke={CYAN} strokeWidth="1.3" opacity="0.7">
        {nodes.map((n) => (
          <line key={`${n.x}-${n.y}`} x1={n.x} y1={n.y} x2="120" y2="76" />
        ))}
      </g>
      {nodes.map((n) => (
        <g key={`n-${n.x}-${n.y}`}>
          <rect x={n.x - 16} y={n.y - 10} width="32" height="20" rx="5" fill={PANEL} stroke={LINE} strokeWidth="1" />
          <rect x={n.x - 9} y={n.y - 4} width="18" height="3" rx="1.5" fill={CYAN} opacity="0.8" />
          <rect x={n.x - 9} y={n.y + 2} width="12" height="3" rx="1.5" fill={LINE} />
        </g>
      ))}
      <circle cx="120" cy="76" r="30" fill={NAVY} stroke={GREEN} strokeWidth="2" />
      <circle cx="120" cy="76" r="22" fill={PANEL} stroke={GREEN} strokeWidth="1" strokeDasharray="3 3" />
      <path d="M120 62l4.500 9 10 1.500-7.200 7 1.700 10-9-4.700-9 4.700 1.700-10-7.200-7 10-1.500z" fill={GREEN} />
    </g>
  );
}
