// ============================================
// NoCharge Theme & Design Tokens
// ============================================
// Light mint-green theme: soft mint gradient background,
// crisp white rounded cards, and an emerald green primary accent.

export const Theme = {
  colors: {
    // Primary green brand colors
    primary: '#10B981',       // Emerald green
    primaryDark: '#059669',   // Deep emerald for pressed states/headers
    primaryLight: '#D1FAE5',  // Mint tint for badges and highlights
    primarySubtle: '#ECFDF5', // Ultra light mint background

    // Backgrounds
    background: '#F0FDF4',     // Soft mint page background
    surface: '#FFFFFF',        // White card background
    surfaceElevated: '#FFFFFF',
    surfaceSubtle: '#F8FAFC',  // Light grey-tinted surface

    // Text colors
    textPrimary: '#0F172A',    // Slate 900 - high contrast
    textSecondary: '#475569',  // Slate 600 - readability
    textMuted: '#94A3B8',      // Slate 400 - placeholders/hints
    textInverse: '#FFFFFF',

    // Status & Badges
    urgent: '#EF4444',         // Red (1 day left or today)
    urgentBg: '#FEF2F2',
    warning: '#F59E0B',        // Amber (2-3 days left)
    warningBg: '#FFFBEB',
    safe: '#10B981',           // Green (>3 days)
    safeBg: '#ECFDF5',
    cancelled: '#64748B',      // Slate
    cancelledBg: '#F1F5F9',
    kept: '#3B82F6',           // Blue
    keptBg: '#EFF6FF',

    // Borders & Dividers
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderFocus: '#10B981',

    // Service icon palette (assigned to trials)
    palette: [
      '#10B981', // Emerald
      '#06B6D4', // Cyan
      '#6366F1', // Indigo
      '#EC4899', // Pink
      '#8B5CF6', // Purple
      '#F59E0B', // Amber
      '#14B8A6', // Teal
      '#3B82F6', // Blue
      '#F97316', // Orange
    ],
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  shadows: {
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    floating: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
  },
};

export default Theme;
