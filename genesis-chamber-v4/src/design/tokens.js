// ─────────────────────────────────────────────────────────
// GENESIS CHAMBER V4 — DESIGN TOKENS
// Tobias van Schneider — Editorial, flat, typographic
// Source: gc-v4-figma-tokens.json
// ─────────────────────────────────────────────────────────

// Dark theme (default)
export const T = {
  // Surfaces
  bg: '#111113',
  surface: '#18181B',
  surfaceRaised: '#1F1F23',
  surfaceHover: '#26262B',

  // Accents
  flame: '#F27123',
  cyan: '#00D9FF',
  gold: '#D4A853',
  magenta: '#E5375E',
  green: '#34D399',
  purple: '#8B5CF6',

  // Text
  text: '#E8E6E3',
  textSoft: '#A1A1AA',
  textMuted: '#63636E',

  // Borders
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.12)',

  // DA Arena
  da: {
    prosecution: '#E5375E',
    defense: '#00D9FF',
    verdict: {
      strong: '#34D399',
      partial: '#D4A853',
      insufficient: '#E5375E',
      noDefense: '#63636E',
    },
  },

  // Persona colors
  persona: {
    skeptic: '#00D9FF',
    contrarian: '#E5375E',
    realist: '#D4A853',
    purist: '#8B5CF6',
  },

  // Council preset colors
  council: {
    compare: '#00D9FF',
    analyze: '#34D399',
    brainstorm: '#D4A853',
    evaluate: '#8B5CF6',
    debate: '#E5375E',
  },

  // Stage colors
  stage: {
    create: '#34D399',
    critique: '#F59E0B',
    synthesize: '#EF4444',
  },
};

// Light theme overrides
export const TLight = {
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceRaised: '#E8E8ED',
  surfaceHover: '#DDDDE2',

  text: '#1A1A1E',
  textSoft: '#52525B',
  textMuted: '#8E8E93',

  border: 'rgba(0,0,0,0.08)',
  borderHover: 'rgba(0,0,0,0.15)',
};

// Font stacks
export const font = {
  display: "'OmniPresent', 'Inter', system-ui, -apple-system, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
};

// Font sizes (px values as numbers for inline styles)
export const fontSize = {
  xs: 9,
  sm: 11,
  base: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 36,
};

// Spacing (px values as numbers)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 36,
  xxxl: 48,
};

// Border radius
export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
};

// Motion
export const motion = {
  duration: {
    instant: '80ms',
    fast: '130ms',
    normal: '200ms',
    smooth: '340ms',
    dramatic: '550ms',
  },
  easing: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Model colors
export const MODEL_COLORS = {
  claude: '#F27123',
  gpt4o: '#34D399',
  gemini: '#00D9FF',
  llama: '#8B5CF6',
  mistral: '#D4A853',
  grok: '#E5375E',
};

// Layout constants
export const layout = {
  sidebar: {
    hidden: 0,
    collapsed: 56,
    expanded: 260,
  },
  topBar: {
    height: 48,
  },
};
