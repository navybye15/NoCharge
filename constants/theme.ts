// ============================================
// NoCharge Cashtra + Inspo Design System
// ============================================
// Combines Cashtra finance UI (stacked colorful wallet cards,
// circular gauges, clean bold typography) with Image 1 & 2
// (ambient mint glow, greeting pill, horizontal date strip).

export const Theme = {
  colors: {
    // Cashtra Mint Primary
    primary: '#10B981',         // Cashtra Green / Emerald
    primaryDark: '#047857',     // Deep emerald
    primaryLight: '#D1FAE5',    // Soft mint
    primaryGlow: '#A7F3D0',
    primarySubtle: '#ECFDF5',   // Translucent mint

    // Ambient backgrounds
    background: '#EEFDF3',       // Ambient light mint-lime glow
    backgroundAlt: '#F6FFF9',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceGlass: 'rgba(255, 255, 255, 0.85)',
    surfaceSubtle: '#F8FAFC',

    // Text hierarchy
    textPrimary: '#0F172A',      // Slate 900
    textSecondary: '#475569',    // Slate 600
    textMuted: '#94A3B8',        // Slate 400
    textInverse: '#FFFFFF',

    // Status chips
    urgent: '#EF4444',
    urgentBg: '#FEE2E2',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    safe: '#10B981',
    safeBg: '#D1FAE5',
    cancelled: '#64748B',
    cancelledBg: '#F1F5F9',
    kept: '#3B82F6',
    keptBg: '#DBEAFE',

    // Border lines
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderFocus: '#10B981',

    // Cashtra Stacked Wallet Card Color Themes
    cardThemes: {
      spotify: {
        bg: '#1DB954',
        text: '#FFFFFF',
        accent: '#128C3E',
      },
      netflix: {
        bg: '#E50914',
        text: '#FFFFFF',
        accent: '#B80710',
      },
      youtube: {
        bg: '#4F46E5', // Indigo
        text: '#FFFFFF',
        accent: '#3730A3',
      },
      bdo: {
        bg: '#1E40AF', // Deep blue
        text: '#FFFFFF',
        accent: '#172554',
      },
      canva: {
        bg: '#06B6D4', // Cyan
        text: '#FFFFFF',
        accent: '#0891B2',
      },
      apple: {
        bg: '#334155', // Slate dark
        text: '#FFFFFF',
        accent: '#1E293B',
      },
      amber: {
        bg: '#F59E0B', // Amber
        text: '#FFFFFF',
        accent: '#D97706',
      },
      emerald: {
        bg: '#10B981',
        text: '#FFFFFF',
        accent: '#059669',
      },
    },

    palette: [
      '#10B981', // Emerald
      '#06B6D4', // Cyan
      '#4F46E5', // Indigo
      '#E11D48', // Rose / Netflix Red
      '#8B5CF6', // Purple
      '#F59E0B', // Amber
      '#0284C7', // Sky Blue
      '#14B8A6', // Teal
      '#334155', // Dark Slate
    ],
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
  },

  radius: {
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },

  shadows: {
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
    walletCard: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    floating: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export default Theme;
