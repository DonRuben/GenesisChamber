// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — COUNCIL ICONS
// 12 geometric SVG icons for council presets
// Color: use councilGold token or .council-icon CSS class
// ─────────────────────────────────────────────────────────

const defaults = { viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const svg = (size, props) => ({ ...defaults, width: size, height: size, ...props });

// Cortex — neural burst (viral campaign)
export function CortexIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <circle cx="16" cy="16" r="4" />
      <line x1="16" y1="4" x2="16" y2="10" />
      <line x1="16" y1="22" x2="16" y2="28" />
      <line x1="4" y1="16" x2="10" y2="16" />
      <line x1="22" y1="16" x2="28" y2="16" />
      <line x1="7.5" y1="7.5" x2="11.5" y2="11.5" />
      <line x1="20.5" y1="20.5" x2="24.5" y2="24.5" />
      <line x1="7.5" y1="24.5" x2="11.5" y2="20.5" />
      <line x1="20.5" y1="11.5" x2="24.5" y2="7.5" />
    </svg>
  );
}

// Apex — upward peak (leadership)
export function ApexIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <polyline points="6,26 16,6 26,26" />
      <line x1="10" y1="18" x2="22" y2="18" />
    </svg>
  );
}

// Canvas — frame + stroke (design)
export function CanvasIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <rect x="5" y="5" width="22" height="22" rx="2" />
      <path d="M5 22 L12 15 L17 20 L22 14 L27 19" />
    </svg>
  );
}

// Prism — diamond refraction (naming)
export function PrismIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <polygon points="16,4 28,16 16,28 4,16" />
      <line x1="16" y1="4" x2="16" y2="28" />
      <line x1="4" y1="16" x2="28" y2="16" />
    </svg>
  );
}

// Volt — lightning bolt (speed/quick)
export function VoltIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <polyline points="18,4 10,18 16,18 14,28 22,14 16,14 18,4" />
    </svg>
  );
}

// Folio — open book (copywriting)
export function FolioIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <path d="M4 6 C4 6 10 4 16 8 C22 4 28 6 28 6 L28 24 C28 24 22 22 16 26 C10 22 4 24 4 24 Z" />
      <line x1="16" y1="8" x2="16" y2="26" />
    </svg>
  );
}

// Chrono — clock face (timing/schedule)
export function ChronoIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <circle cx="16" cy="16" r="12" />
      <polyline points="16,8 16,16 22,16" />
    </svg>
  );
}

// Signet — seal/crest (classic/heritage)
export function SignetIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <circle cx="16" cy="14" r="10" />
      <path d="M8 22 L6 28 L16 25 L26 28 L24 22" />
    </svg>
  );
}

// Pulse — heartbeat line (boardroom/analytics)
export function PulseIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <polyline points="4,16 9,16 12,8 16,24 20,12 23,16 28,16" />
    </svg>
  );
}

// Shield — protection (full assembly)
export function ShieldIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <path d="M16 4 L26 8 L26 18 C26 23 21 27 16 28 C11 27 6 23 6 18 L6 8 Z" />
      <polyline points="11,16 14,19 21,12" />
    </svg>
  );
}

// Focus — crosshair (rebrand/precision)
export function FocusIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <circle cx="16" cy="16" r="10" />
      <circle cx="16" cy="16" r="4" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="16" y1="26" x2="16" y2="30" />
      <line x1="2" y1="16" x2="6" y2="16" />
      <line x1="26" y1="16" x2="30" y2="16" />
    </svg>
  );
}

// Persona — silhouette (generic persona)
export function PersonaIcon({ size = 32 }) {
  return (
    <svg {...svg(size)}>
      <circle cx="16" cy="11" r="5" />
      <path d="M6 28 C6 21 10 18 16 18 C22 18 26 21 26 28" />
    </svg>
  );
}

// Icon lookup map (keyed by preset icon string)
export const COUNCIL_ICONS = {
  cortex: CortexIcon,
  apex: ApexIcon,
  canvas: CanvasIcon,
  prism: PrismIcon,
  volt: VoltIcon,
  folio: FolioIcon,
  chrono: ChronoIcon,
  signet: SignetIcon,
  pulse: PulseIcon,
  shield: ShieldIcon,
  focus: FocusIcon,
  persona: PersonaIcon,
};

export default COUNCIL_ICONS;
