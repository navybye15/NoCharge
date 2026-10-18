// ============================================
// NoCharge High-Fidelity LinearGradient Engine
// ============================================
// Provides smooth, continuous Apple-style gradients without native crashes.
// Uses 48-slice multi-stop color interpolation with universal #RRGGBB hex output.

import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface LinearGradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

function parseHex(c: string): [number, number, number] {
  if (!c) return [0, 0, 0];
  let h = c.replace('#', '').trim();
  if (h.length === 3) {
    h = h.split('').map((x) => x + x).join('');
  }
  if (h.length >= 6) {
    return [
      parseInt(h.slice(0, 2), 16) || 0,
      parseInt(h.slice(2, 4), 16) || 0,
      parseInt(h.slice(4, 6), 16) || 0,
    ];
  }
  return [0, 0, 0];
}

function lerpHex(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = parseHex(c1);
  const [r2, g2, b2] = parseHex(c2);
  const r = r1 + (r2 - r1) * t;
  const g = g1 + (g2 - g1) * t;
  const b = b1 + (b2 - b1) * t;
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getMultiColor(colors: string[], t: number): string {
  if (!colors || colors.length === 0) return '#000000';
  if (colors.length === 1) return colors[0];
  const clampedT = Math.max(0, Math.min(1, t));
  const pos = clampedT * (colors.length - 1);
  const idx = Math.min(Math.floor(pos), colors.length - 2);
  const fraction = pos - idx;
  // Natural cubic ease curve for Apple-like soft rolloff
  const easeF = fraction * fraction * (3 - 2 * fraction);
  return lerpHex(colors[idx], colors[idx + 1], easeF);
}

const SLICES = 48;

export function LinearGradient({ colors, start, end, style, children, ...props }: LinearGradientProps) {
  const baseColor = colors[0] || '#0E4F2C';

  // Check if orientation is horizontal
  const isHorizontal = Boolean(
    start && end && Math.abs(end.x - start.x) > Math.abs(end.y - start.y)
  );

  const sliceColors = useMemo(() => {
    const list: string[] = [];
    for (let i = 0; i < SLICES; i++) {
      const t = i / (SLICES - 1);
      list.push(getMultiColor(colors, t));
    }
    return list;
  }, [colors]);

  return (
    <View style={[{ backgroundColor: baseColor, position: 'relative', overflow: 'hidden' }, style]} {...props}>
      {/* Background Multi-Slice Gradient Layer */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            flexDirection: isHorizontal ? 'row' : 'column',
          },
        ]}
        pointerEvents="none"
      >
        {sliceColors.map((color, idx) => (
          <View
            key={`slice-${idx}`}
            style={{
              flex: 1,
              backgroundColor: color,
            }}
          />
        ))}
      </View>

      {children}
    </View>
  );
}

export default LinearGradient;
