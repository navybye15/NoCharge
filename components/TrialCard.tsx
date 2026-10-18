// ============================================
// NoCharge Apple-Style Trial Card
// ============================================
// Matches Apple-like design aesthetics:
// - Premium surface card (white in Light Mode, dark slate in Dark Mode)
// - Cohesive theme-green accents (no random rainbow colors)
// - High-contrast typography with Manrope
// - Crisp status chip & initial squircle

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Trial, formatReadableDate, formatCurrency, getDaysLeft } from '../types/trial';
import { useAppTheme } from '../context/ThemeContext';
import { safeNavigate } from '../services/navigation';

interface TrialCardProps {
  trial: Trial;
  cardWidth?: number;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

export default function TrialCard({ trial, cardWidth, onPress, onDelete }: TrialCardProps) {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const daysLeft = getDaysLeft(trial.endDate);
  const initial = trial.serviceName.trim().charAt(0).toUpperCase() || '?';
  const isCancelled = trial.status === 'cancelled';
  const isKept = trial.status === 'kept';

  // Countdown chip logic per DESIGN.md & Apple aesthetics
  let chipBg = isDark ? 'rgba(47, 209, 120, 0.16)' : 'rgba(34, 197, 94, 0.12)';
  let chipText = colors.primary;
  let chipLabel = `${daysLeft} days left`;
  let chipIcon: keyof typeof Ionicons.glyphMap | null = null;

  if (isCancelled) {
    chipBg = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)';
    chipText = colors.textMuted;
    chipLabel = 'Cancelled';
    chipIcon = 'checkmark-circle';
  } else if (isKept) {
    chipBg = isDark ? 'rgba(47, 209, 120, 0.20)' : 'rgba(34, 197, 94, 0.16)';
    chipText = colors.primary;
    chipLabel = 'Subscribed';
    chipIcon = 'checkmark';
  } else if (daysLeft < 0) {
    chipBg = 'rgba(239, 68, 68, 0.18)';
    chipText = colors.danger;
    chipLabel = 'Overdue';
    chipIcon = 'alert-circle';
  } else if (daysLeft === 0) {
    chipBg = 'rgba(239, 68, 68, 0.18)';
    chipText = colors.danger;
    chipLabel = 'Today';
    chipIcon = 'alert-circle';
  } else if (daysLeft === 1) {
    chipBg = 'rgba(255, 235, 26, 0.20)';
    chipText = isDark ? '#FFE855' : '#8A7700';
    chipLabel = 'Tomorrow';
    chipIcon = 'time-outline';
  } else if (daysLeft <= 7) {
    chipBg = 'rgba(255, 235, 26, 0.20)';
    chipText = isDark ? '#FFE855' : '#8A7700';
    chipLabel = `${daysLeft} days left`;
  }

  const handlePress = () => {
    safeNavigate(() => {
      if (onPress) {
        onPress();
      } else {
        router.push(`/trials/${trial.id}` as any);
      }
    });
  };

  const handleLongPress = () => {
    if (!onDelete) return;
    Alert.alert(
      'Delete Trial',
      `Sigurado ka bang gusto mong tanggalin ang "${trial.serviceName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(trial.id),
        },
      ]
    );
  };

  const accessibilitySentence = `${trial.serviceName}, ${
    daysLeft >= 0 ? `${daysLeft} days remaining` : 'overdue'
  }, ${trial.priceAfterTrial} pesos will be charged on ${formatReadableDate(trial.endDate)}.`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        cardWidth ? { width: cardWidth } : { width: '100%' },
        isCancelled && styles.cardCancelled,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilitySentence}
    >
      {/* Subtle Depth Overlay Glow */}
      <View
        style={[
          styles.depthOverlay,
          {
            backgroundColor: isDark ? 'rgba(47, 209, 120, 0.06)' : 'rgba(34, 197, 94, 0.05)',
          },
        ]}
        pointerEvents="none"
      />

      {/* Top Row: Initial Squircle + Service Name & Countdown Chip */}
      <View style={styles.topRow}>
        <View style={styles.serviceIdentity}>
          <View
            style={[
              styles.initialCircle,
              {
                backgroundColor: isDark ? 'rgba(47, 209, 120, 0.16)' : 'rgba(34, 197, 94, 0.12)',
              },
            ]}
          >
            <Text style={[styles.initialText, { color: colors.primary }]}>{initial}</Text>
          </View>
          <Text style={[styles.serviceName, { color: colors.text }]} numberOfLines={1}>
            {trial.serviceName}
          </Text>
        </View>

        <View style={[styles.countdownChip, { backgroundColor: chipBg }]}>
          {chipIcon ? (
            <Ionicons
              name={chipIcon}
              size={13}
              color={chipText}
              style={{ marginRight: 4 }}
            />
          ) : null}
          <Text
            style={[styles.countdownText, { color: chipText }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {chipLabel}
          </Text>
        </View>
      </View>

      {/* Middle: Big Price / Countdown */}
      <View style={styles.middleRow}>
        <Text style={[styles.priceHero, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
          {formatCurrency(trial.priceAfterTrial)}
        </Text>
        <Text style={[styles.cycleText, { color: colors.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>
          {trial.billingCycle === 'monthly' ? '/ month' : trial.billingCycle === 'yearly' ? '/ year' : 'one-time'}
        </Text>
      </View>

      {/* Bottom Row: Charge Date & Payment Method */}
      <View style={styles.bottomRow}>
        <View style={styles.dateCol}>
          <Text style={[styles.bottomLabel, { color: colors.textMuted }]}>CHARGE DATE</Text>
          <Text style={[styles.bottomValue, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
            {formatReadableDate(trial.endDate)}
          </Text>
        </View>

        {trial.paymentLabel ? (
          <View style={styles.paymentCol}>
            <Text style={[styles.bottomLabel, { color: colors.textMuted }]}>PAYMENT</Text>
            <Text style={[styles.bottomValue, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
              {trial.paymentLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 14,
  },
  cardCancelled: {
    opacity: 0.65,
  },
  depthOverlay: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  initialCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  initialText: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: 'Manrope_800ExtraBold',
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.3,
    flex: 1,
  },
  countdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.2,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 6,
  },
  priceHero: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -0.6,
  },
  cycleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'Manrope_600SemiBold',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
  },
  dateCol: {
    flex: 1,
  },
  paymentCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  bottomLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
    fontFamily: 'Manrope_700Bold',
  },
  bottomValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
});
