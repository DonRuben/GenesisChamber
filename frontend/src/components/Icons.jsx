// Genesis Chamber — Minimalist SVG Icon Library
// Style: Tobias van Schneider inspired — geometric, thin stroke, pure primitives
// 35 icons, viewBox 0 0 20 20, stroke 1.5px, currentColor

// ─── Helper wrapper ──────────────────────────────────────────────────────────

const Icon = ({ size = 20, className = '', children, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`gc-icon ${className}`}
    {...props}
  >
    {children}
  </svg>
);

// ─── Navigation (4) ──────────────────────────────────────────────────────────

export const IconMenu = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <line x1="3" y1="5" x2="17" y2="5" />
    <line x1="3" y1="10" x2="17" y2="10" />
    <line x1="3" y1="15" x2="17" y2="15" />
  </Icon>
);

export const IconClose = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <line x1="4" y1="4" x2="16" y2="16" />
    <line x1="16" y1="4" x2="4" y2="16" />
  </Icon>
);

export const IconChevronDown = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <polyline points="5,7 10,13 15,7" />
  </Icon>
);

export const IconChevronRight = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <polyline points="7,4 13,10 7,16" />
  </Icon>
);

// ─── Actions (7) ─────────────────────────────────────────────────────────────

export const IconPlay = ({ size = 20, className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="currentColor"
    stroke="none"
    className={`gc-icon ${className}`}
    {...props}
  >
    <polygon points="6,3 6,17 16,10" />
  </svg>
);

export const IconPause = ({ size = 20, className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`gc-icon ${className}`}
    {...props}
  >
    <line x1="6" y1="4" x2="6" y2="16" />
    <line x1="14" y1="4" x2="14" y2="16" />
  </svg>
);

export const IconDownload = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <line x1="10" y1="3" x2="10" y2="13" />
    <polyline points="6,9 10,13 14,9" />
    <line x1="4" y1="17" x2="16" y2="17" />
  </Icon>
);

export const IconRefresh = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <path d="M16,10 A6,6 0 1,1 10,4" />
    <polyline points="13,4 16.5,4 16.5,7.5" />
  </Icon>
);

export const IconPlus = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <line x1="10" y1="4" x2="10" y2="16" />
    <line x1="4" y1="10" x2="16" y2="10" />
  </Icon>
);

export const IconSearch = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <circle cx="8.5" cy="8.5" r="5" />
    <line x1="12.5" y1="12.5" x2="17" y2="17" />
  </Icon>
);

export const IconExport = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <line x1="10" y1="3" x2="10" y2="11" />
    <polyline points="6,7 10,3 14,7" />
    <polyline points="4,12 4,17 16,17 16,12" />
  </Icon>
);

// ─── Dashboard Tabs (6) ─────────────────────────────────────────────────────

export const IconDiamond = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <path d="M10,3 L17,10 L10,17 L3,10 Z" />
  </Icon>
);

export const IconGrid = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <rect x="3" y="3" width="5.5" height="5.5" rx="0.5" />
    <rect x="11.5" y="3" width="5.5" height="5.5" rx="0.5" />
    <rect x="3" y="11.5" width="5.5" height="5.5" rx="0.5" />
    <rect x="11.5" y="11.5" width="5.5" height="5.5" rx="0.5" />
  </Icon>
);

export const IconEye = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <path d="M2,10 Q6,5 10,5 Q14,5 18,10 Q14,15 10,15 Q6,15 2,10 Z" />
    <circle cx="10" cy="10" r="2.5" />
  </Icon>
);

export const IconCompass = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <circle cx="10" cy="10" r="7" />
    <path d="M10,5 L12,10 L10,15 L8,10 Z" />
    <circle cx="10" cy="10" r="1.5" />
  </Icon>
);

export const IconScroll = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <rect x="4" y="2" width="12" height="16" rx="1.5" />
    <line x1="7" y1="7" x2="13" y2="7" />
    <line x1="7" y1="10" x2="13" y2="10" />
    <line x1="7" y1="13" x2="13" y2="13" />
  </Icon>
);

export const IconPackage = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <polyline points="3,6 10,2 17,6" />
    <rect x="3" y="6" width="14" height="11" />
    <line x1="10" y1="2" x2="10" y2="6" />
  </Icon>
);

// ─── Stages (5) ──────────────────────────────────────────────────────────────

export const IconSpark = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <polyline points="11,2 7,10 11,10 9,18" />
  </Icon>
);

export const IconScale = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <line x1="3" y1="6" x2="17" y2="6" />
    <line x1="10" y1="6" x2="10" y2="17" />
    <polyline points="3,6 5,12 7,6" />
    <polyline points="13,6 15,12 17,6" />
  </Icon>
);

export const IconFunnel = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <line x1="3" y1="3" x2="17" y2="3" />
    <polyline points="3,3 8,11 8,17" />
    <polyline points="17,3 12,11 12,17" />
  </Icon>
);

export const IconGem = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <path d="M10,2 L17,7 L10,18 L3,7 Z" />
    <line x1="3" y1="7" x2="17" y2="7" />
  </Icon>
);

export const IconPodium = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <rect x="7" y="5" width="6" height="12" />
    <rect x="2" y="9" width="5" height="8" />
    <rect x="13" y="7" width="5" height="10" />
  </Icon>
);

// ─── Status (4) ──────────────────────────────────────────────────────────────

export const IconCheck = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <polyline points="4,10 8,15 16,5" />
  </Icon>
);

export const IconWarning = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <path d="M10,2 L18,17 L2,17 Z" />
    <line x1="10" y1="8" x2="10" y2="12" />
    <circle cx="10" cy="14.5" r="0.8" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconError = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <circle cx="10" cy="10" r="7" />
    <line x1="7" y1="7" x2="13" y2="13" />
    <line x1="13" y1="7" x2="7" y2="13" />
  </Icon>
);

export const IconInfo = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <circle cx="10" cy="10" r="7" />
    <circle cx="10" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    <line x1="10" y1="9" x2="10" y2="14" />
  </Icon>
);

// ─── Objects (3) ─────────────────────────────────────────────────────────────

export const IconHelp = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <circle cx="10" cy="10" r="7" />
    <path d="M7.5,7 Q7.5,4.5 10,4.5 Q12.5,4.5 12.5,7 Q12.5,9 10,10.5" />
    <line x1="10" y1="10.5" x2="10" y2="12" />
    <circle cx="10" cy="14.5" r="0.8" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconSoul = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <circle cx="10" cy="5" r="3" />
    <path d="M4,17 Q4,11 10,11 Q16,11 16,17" />
  </Icon>
);

export const IconGear = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <circle cx="10" cy="10" r="3" />
    <circle cx="10" cy="10" r="7" />
    <line x1="10" y1="2" x2="10" y2="3" />
    <line x1="10" y1="17" x2="10" y2="18" />
    <line x1="3.07" y1="6" x2="3.93" y2="6.5" />
    <line x1="16.07" y1="13.5" x2="16.93" y2="14" />
    <line x1="3.07" y1="14" x2="3.93" y2="13.5" />
    <line x1="16.07" y1="6.5" x2="16.93" y2="6" />
  </Icon>
);

// ─── Media (3) ───────────────────────────────────────────────────────────────

export const IconImage = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <rect x="3" y="4" width="14" height="12" rx="1" />
    <polyline points="3,14 7,9 10,12 14,7 17,14" />
    <circle cx="14" cy="7" r="1.5" />
  </Icon>
);

export const IconVideo = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <rect x="2" y="5" width="12" height="10" rx="1" />
    <polygon points="14,8 18,10 14,12" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconPresentation = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <rect x="3" y="3" width="14" height="11" rx="1" />
    <line x1="10" y1="14" x2="10" y2="18" />
    <line x1="6" y1="18" x2="14" y2="18" />
  </Icon>
);

// ─── Presets (5) ─────────────────────────────────────────────────────────────

export const IconLightning = IconSpark;

export const IconMessage = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <path d="M3,3 L17,3 Q17,3 17,3 L17,13 L9,13 L5,13 L3,17 L3,3 Z" />
    <path d="M5,13 L3,17" />
  </Icon>
);

export const IconCrystalBall = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <circle cx="10" cy="10" r="6.5" />
    <path d="M5,15 Q10,17 15,15" />
    <line x1="8" y1="7" x2="9" y2="7" />
  </Icon>
);

export const IconFactory = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <rect x="3" y="8" width="7" height="9" />
    <rect x="5" y="3" width="2" height="5" />
    <rect x="10" y="5" width="7" height="12" />
    <rect x="13" y="2" width="2" height="3" />
  </Icon>
);

export const IconSparkle = ({ size, className, ...props }) => (
  <Icon size={size} className={className} {...props}>
    <path d="M10,2 L12,8 L18,10 L12,12 L10,18 L8,12 L2,10 L8,8 Z" />
  </Icon>
);

// ─── Additional Navigation & UI (6) ────────────────────────────────────────

export const IconChevronLeft = (props) => (
  <Icon {...props}><polyline points="12 15 7 10 12 5" /></Icon>
);

export const IconChip = (props) => (
  <Icon {...props}>
    <rect x="5" y="5" width="10" height="10" rx="1.5" />
    <line x1="5" y1="8" x2="3" y2="8" />
    <line x1="5" y1="12" x2="3" y2="12" />
    <line x1="15" y1="8" x2="17" y2="8" />
    <line x1="15" y1="12" x2="17" y2="12" />
    <line x1="8" y1="5" x2="8" y2="3" />
    <line x1="12" y1="5" x2="12" y2="3" />
    <line x1="8" y1="15" x2="8" y2="17" />
    <line x1="12" y1="15" x2="12" y2="17" />
  </Icon>
);

export const IconSend = (props) => (
  <Icon {...props}>
    <line x1="4" y1="10" x2="16" y2="4" />
    <line x1="16" y1="4" x2="10" y2="16" />
    <line x1="10" y1="16" x2="8" y2="11" />
    <line x1="8" y1="11" x2="4" y2="10" />
  </Icon>
);

export const IconArrowRight = (props) => (
  <Icon {...props}>
    <line x1="4" y1="10" x2="16" y2="10" />
    <polyline points="11 5 16 10 11 15" />
  </Icon>
);

export const IconCollapse = (props) => (
  <Icon {...props}>
    <polyline points="11 5 6 10 11 15" />
    <polyline points="15 5 10 10 15 15" />
  </Icon>
);

export const IconExpand = (props) => (
  <Icon {...props}>
    <polyline points="5 5 10 10 5 15" />
    <polyline points="9 5 14 10 9 15" />
  </Icon>
);

// ─── Upload & Clipboard ──────────────────────────────────────────────────────

export const IconUpload = (props) => (
  <Icon {...props}>
    <line x1="10" y1="14" x2="10" y2="4" />
    <polyline points="6 8 10 4 14 8" />
    <path d="M4 14v2a1 1 0 001 1h10a1 1 0 001-1v-2" />
  </Icon>
);

export const IconCopy = (props) => (
  <Icon {...props}>
    <rect x="7" y="7" width="9" height="10" rx="1" />
    <path d="M4 13V5a1 1 0 011-1h8" />
  </Icon>
);

export const IconColumns = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="6" height="14" rx="1" />
    <rect x="11" y="3" width="6" height="14" rx="1" />
  </Icon>
);

// ─── Convenience lookup object ──────────────────────────────────────────────

export const Icons = {
  // Navigation
  IconMenu,
  IconClose,
  IconChevronDown,
  IconChevronRight,
  // Actions
  IconPlay,
  IconPause,
  IconDownload,
  IconRefresh,
  IconPlus,
  IconSearch,
  IconExport,
  // Dashboard Tabs
  IconDiamond,
  IconGrid,
  IconEye,
  IconCompass,
  IconScroll,
  IconPackage,
  // Stages
  IconSpark,
  IconScale,
  IconFunnel,
  IconGem,
  IconPodium,
  // Status
  IconCheck,
  IconWarning,
  IconError,
  IconInfo,
  // Objects
  IconHelp,
  IconSoul,
  IconGear,
  // Media
  IconImage,
  IconVideo,
  IconPresentation,
  // Presets
  IconLightning,
  IconMessage,
  IconCrystalBall,
  IconFactory,
  IconSparkle,
  // Additional Navigation & UI
  IconChevronLeft,
  IconChip,
  IconSend,
  IconArrowRight,
  IconCollapse,
  IconExpand,
  IconUpload,
  IconCopy,
  IconColumns,
};
