// ============================================
// NoCharge Design System — DESIGN.md Specification
// ============================================

export interface ThemeColors {
  bg: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  primaryStrong: string;
  accent: string;
  onAccent: string;
  danger: string;

  // Shared Tokens
  heroStart: string;
  heroEnd: string;
  svc: string[];
  palette: string[];
}

export const lightTheme: ThemeColors = {
  bg: '#FFFFFF',
  bgGradientStart: '#6BE05D', // Vibrant fresh Apple spring/lime green
  bgGradientEnd: '#FFFFFF',
  surface: '#FFFFFF',
  surface2: '#F4F7F5',
  border: '#E3ECE6',
  text: '#091A11',
  textMuted: '#52695E',
  primary: '#22C55E',
  onPrimary: '#05180D',
  primaryStrong: '#0D8040',
  accent: '#FFEB1A',
  onAccent: '#06190E',
  danger: '#EF4444',

  heroStart: '#3DE682',
  heroEnd: '#13B85E',
  svc: ['#22C55E', '#16A34A', '#10B981', '#059669', '#34D399', '#15803D'],
  palette: ['#22C55E', '#16A34A', '#10B981', '#059669', '#34D399', '#15803D'],
};

export const darkTheme: ThemeColors = {
  bg: '#070A0D', // Deep Apple obsidian/black
  bgGradientStart: '#125633', // Rich Apple dark emerald/forest green
  bgGradientEnd: '#070A0D', // Pitch midnight
  surface: '#141D22', // Dark slate rounded cards
  surface2: '#19242B',
  border: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
  textMuted: '#8E9FA8',
  primary: '#2FD178',
  onPrimary: '#05180D',
  primaryStrong: '#2FD178',
  accent: '#FFEB1A',
  onAccent: '#06190E',
  danger: '#F87171',

  heroStart: '#25CE72',
  heroEnd: '#0D8E48',
  svc: ['#2FD178', '#20B865', '#16A34A', '#10B981', '#059669', '#34D399'],
  palette: ['#2FD178', '#20B865', '#16A34A', '#10B981', '#059669', '#34D399'],
};

// Spacing & Typography based on DESIGN.md
export const DesignTokens = {
  spacing: {
    base: 4,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    huge: 48,
    giant: 64,
  },
  radius: {
    input: 14,
    btn: 16,
    card: 20,
    sheet: 24,
    full: 9999,
  },
  typography: {
    fontFamily: {
      regular: 'Manrope_400Regular',
      medium: 'Manrope_500Medium',
      semiBold: 'Manrope_600SemiBold',
      bold: 'Manrope_700Bold',
      extraBold: 'Manrope_800ExtraBold',
    },
    displayNumber: {
      fontSize: 40,
      lineHeight: 48,
      fontWeight: '800' as const,
      fontFamily: 'Manrope_800ExtraBold',
    },
    h1: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700' as const,
      fontFamily: 'Manrope_700Bold',
    },
    h2: {
      fontSize: 22,
      lineHeight: 30,
      fontWeight: '700' as const,
      fontFamily: 'Manrope_700Bold',
    },
    h3: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '600' as const,
      fontFamily: 'Manrope_600SemiBold',
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500' as const,
      fontFamily: 'Manrope_500Medium',
    },
    small: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
      fontFamily: 'Manrope_400Regular',
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as const,
      fontFamily: 'Manrope_500Medium',
    },
  },
};

/**
 * Returns a deterministic service color from the 6 svc tokens based on string hash
 */
export function getServiceColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % lightTheme.svc.length;
  return lightTheme.svc[index];
}

// Compatibility alias
export const Theme = {
  colors: lightTheme,
  ...DesignTokens,
};
