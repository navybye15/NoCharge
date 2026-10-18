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
  bg: '#F2FAF5',
  bgGradientStart: '#D9F5E5',
  bgGradientEnd: '#F7FBF8',
  surface: '#FFFFFF',
  surface2: '#F1F5F3',
  border: '#D9D9D9',
  text: '#091B27',
  textMuted: '#4F625C',
  primary: '#32CF7A',
  onPrimary: '#091B27',
  primaryStrong: '#0F7A3F',
  accent: '#FFEB1A',
  onAccent: '#091B27',
  danger: '#D92D20',

  heroStart: '#4EE08F',
  heroEnd: '#1DB86A',
  svc: ['#32CF7A', '#2BB8C7', '#FFEB1A', '#FF9F43', '#4C8DFF', '#F472B6'],
  palette: ['#32CF7A', '#2BB8C7', '#FFEB1A', '#FF9F43', '#4C8DFF', '#F472B6'],
};

export const darkTheme: ThemeColors = {
  bg: '#091B27',
  bgGradientStart: '#0B3B2A',
  bgGradientEnd: '#091B27',
  surface: '#13262E',
  surface2: '#1B323B',
  border: '#24383F',
  text: '#FFFFFF',
  textMuted: '#A9B8B3',
  primary: '#32CF7A',
  onPrimary: '#091B27',
  primaryStrong: '#32CF7A',
  accent: '#FFEB1A',
  onAccent: '#091B27',
  danger: '#FF6B5E',

  heroStart: '#4EE08F',
  heroEnd: '#1DB86A',
  svc: ['#32CF7A', '#2BB8C7', '#FFEB1A', '#FF9F43', '#4C8DFF', '#F472B6'],
  palette: ['#32CF7A', '#2BB8C7', '#FFEB1A', '#FF9F43', '#4C8DFF', '#F472B6'],
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
