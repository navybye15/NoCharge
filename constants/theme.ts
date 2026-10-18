// ============================================
// NoCharge Design System (Cashtra Fintech Edition)
// ============================================
// Supports System Default, Pure Dark (Obsidian + Emerald),
// and Crisp Light (Sage + Forest) inspired by Cashtra.

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryGlow: string;
  primarySubtle: string;

  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;
  surfaceGlass: string;
  surfaceSubtle: string;

  // Icons
  iconContainer: string;
  iconColor: string;
  iconContainerMuted: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Status indicators
  urgent: string;
  urgentBg: string;
  warning: string;
  warningBg: string;
  safe: string;
  safeBg: string;
  cancelled: string;
  cancelledBg: string;
  kept: string;
  keptBg: string;

  // Borders & Dividers
  border: string;
  borderLight: string;
  borderFocus: string;

  // Tab bar
  tabBarBg: string;
  tabBarBorder: string;

  // Palette
  palette: string[];
}

export const darkTheme: ThemeColors = {
  // Cashtra Emerald Primary
  primary: '#00C06A',
  primaryDark: '#008C4D',
  primaryLight: 'rgba(0, 192, 106, 0.15)',
  primaryGlow: 'rgba(0, 192, 106, 0.25)',
  primarySubtle: '#09261B',

  // Obsidian / Slate Dark Backgrounds (Image 1 & 2 inspo)
  background: '#0B0F12',
  backgroundAlt: '#10161C',
  surface: '#131A21',
  surfaceElevated: '#1A242E',
  surfaceGlass: 'rgba(19, 26, 33, 0.85)',
  surfaceSubtle: '#161F27',

  // Monochromatic Theme-tinted Icons (No rainbow, matches green theme)
  iconContainer: '#0D271D',
  iconColor: '#00C06A',
  iconContainerMuted: '#1A242E',

  // High-contrast clean typography
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0B0F12',

  // Status
  urgent: '#EF4444',
  urgentBg: '#2D1416',
  warning: '#F59E0B',
  warningBg: '#2D2111',
  safe: '#00C06A',
  safeBg: '#09261B',
  cancelled: '#64748B',
  cancelledBg: '#1A242E',
  kept: '#38BDF8',
  keptBg: '#0F2636',

  // Crisp slate borders
  border: '#1F2C37',
  borderLight: '#18222B',
  borderFocus: '#00C06A',

  // Navigation
  tabBarBg: '#0D1318',
  tabBarBorder: '#18222B',

  palette: [
    '#00C06A',
    '#10B981',
    '#059669',
    '#047857',
    '#022C22',
  ],
};

export const lightTheme: ThemeColors = {
  // Forest Emerald Primary
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#D1FAE5',
  primaryGlow: '#A7F3D0',
  primarySubtle: '#ECFDF5',

  // Crisp Mint / Sage Backgrounds
  background: '#F0FAF5',
  backgroundAlt: '#F7FCF9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceGlass: 'rgba(255, 255, 255, 0.90)',
  surfaceSubtle: '#F4FAF6',

  // Monochromatic Theme-tinted Icons (Clean Forest Green)
  iconContainer: '#E6F7EF',
  iconColor: '#059669',
  iconContainerMuted: '#F1F5F9',

  // Text
  textPrimary: '#0B1319',
  textSecondary: '#4A5B53',
  textMuted: '#84968D',
  textInverse: '#FFFFFF',

  // Status
  urgent: '#DC2626',
  urgentBg: '#FEE2E2',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  safe: '#059669',
  safeBg: '#D1FAE5',
  cancelled: '#64748B',
  cancelledBg: '#F1F5F9',
  kept: '#0284C7',
  keptBg: '#E0F2FE',

  // Borders
  border: '#E1EDE6',
  borderLight: '#EDF5F0',
  borderFocus: '#059669',

  // Navigation
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E1EDE6',

  palette: [
    '#059669',
    '#10B981',
    '#047857',
    '#065F46',
    '#064E3B',
  ],
};

// Fallback / legacy alias
export const Theme = {
  colors: lightTheme,
  spacing: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 26,
    pill: 9999,
  },
  typography: {
    hero: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
    titleLarge: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.4 },
    titleMedium: { fontSize: 18, fontWeight: '700' as const },
    body: { fontSize: 14, fontWeight: '400' as const },
    caption: { fontSize: 12, fontWeight: '600' as const },
  },
};
