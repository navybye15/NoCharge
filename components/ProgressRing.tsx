// ============================================
// NoCharge Progress Ring Component (DESIGN.md)
// ============================================
// Specs (Section 6):
// - 10dp stroke
// - Track in --surface-2
// - Fill in --primary; switches to --accent when <= 3 days, --danger when today/0 days.

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

interface ProgressRingProps {
  daysLeft: number | null;
  size?: number;
}

export default function ProgressRing({ daysLeft, size = 80 }: ProgressRingProps) {
  const { colors } = useAppTheme();

  // Determine indicator color
  let strokeColor = colors.primary;
  let labelColor = colors.onPrimary;

  if (daysLeft !== null) {
    if (daysLeft <= 0) {
      strokeColor = colors.danger;
      labelColor = colors.danger;
    } else if (daysLeft <= 3) {
      strokeColor = colors.accent;
      labelColor = colors.onAccent;
    }
  }

  const radius = size / 2;
  const strokeWidth = 10;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Track Ring */}
      <View
        style={[
          styles.trackRing,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: colors.surface2,
          },
        ]}
      />

      {/* Progress Arc Indicator */}
      <View
        style={[
          styles.indicatorRing,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: strokeColor,
          },
        ]}
      >
        <Text style={[styles.daysNumber, { color: labelColor }]}>
          {daysLeft !== null ? (daysLeft < 0 ? '0' : daysLeft) : '0'}
        </Text>
        <Text style={[styles.daysLabel, { color: colors.onPrimary }]}>
          {daysLeft === 1 ? 'DAY' : 'DAYS'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  trackRing: {
    position: 'absolute',
  },
  indicatorRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: 'transparent', // Arc opening
  },
  daysNumber: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
    fontFamily: 'Manrope_800ExtraBold',
  },
  daysLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 1,
    fontFamily: 'Manrope_700Bold',
  },
});
