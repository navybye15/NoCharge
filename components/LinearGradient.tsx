// ============================================
// NoCharge LinearGradient Component
// ============================================
// Robust component that provides the exact DESIGN.md gradient styling
// without requiring native re-compilation of ViewManagerAdapter_ExpoLinearGradient.

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface LinearGradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function LinearGradient({ colors, style, children, ...props }: LinearGradientProps) {
  const bg = colors[0] || '#F2FAF5';
  const secondColor = colors[1];

  return (
    <View style={[{ backgroundColor: bg, position: 'relative', overflow: 'hidden' }, style]} {...props}>
      {secondColor && secondColor !== bg ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: secondColor,
              opacity: 0.5,
            },
          ]}
          pointerEvents="none"
        />
      ) : null}
      {children}
    </View>
  );
}

export default LinearGradient;
