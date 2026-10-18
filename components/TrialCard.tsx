// ============================================
// NoCharge Wallet-Style Trial Card (DESIGN.md)
// ============================================
// Specs (Section 6):
// - 16:10 aspect ratio, 20dp radius
// - Filled with trial's --svc-* color (subtle lighter overlay shape for depth)
// - Dark --on-primary (#091B27) text throughout
// - Initial-letter circle and service name (H3) at top left
// - Countdown chip at top right (neutral, --accent, --danger, or cancelled)
// - Big price or countdown in the middle (Display/H2)
// - End date, billing cycle, and payment label along the bottom
// - Accessible TalkBack sentence label

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Trial, formatReadableDate, formatCurrency, getDaysLeft } from '../types/trial';
import { useAppTheme } from '../context/ThemeContext';
import { getServiceColor } from '../constants/theme';

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

  // Base background color from trial's service color or fallback
  const svcBg = isCancelled ? (isDark ? '#24383F' : '#D9E2DE') : trial.color || getServiceColor(trial.serviceName);

  // Countdown chip logic per DESIGN.md section 6
  let chipBg = 'rgba(9, 27, 39, 0.12)';
  let chipText = colors.onPrimary;
  let chipLabel = `${daysLeft} days left`;
  let chipIcon: keyof typeof Ionicons.glyphMap | null = null;

  if (isCancelled) {
    chipBg = 'rgba(50, 207, 122, 0.25)';
    chipText = colors.onPrimary;
    chipLabel = 'Cancelled';
    chipIcon = 'checkmark-circle';
  } else if (isKept) {
    chipBg = 'rgba(9, 27, 39, 0.15)';
    chipText = colors.onPrimary;
    chipLabel = 'Subscribed';
    chipIcon = 'checkmark';
  } else if (daysLeft < 0) {
    chipBg = colors.danger;
    chipText = '#FFFFFF';
    chipLabel = 'Overdue';
    chipIcon = 'alert-circle';
  } else if (daysLeft === 0) {
    chipBg = colors.danger;
    chipText = '#FFFFFF';
    chipLabel = 'Today';
    chipIcon = 'alert-circle';
  } else if (daysLeft === 1) {
    chipBg = colors.accent;
    chipText = colors.onAccent;
    chipLabel = 'Tomorrow';
    chipIcon = 'time-outline';
  } else if (daysLeft <= 7) {
    chipBg = colors.accent;
    chipText = colors.onAccent;
    chipLabel = `${daysLeft} days left`;
  }

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/trials/${trial.id}` as any);
    }
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

  // Accessibility reading sentence (DESIGN.md section 9)
  const accessibilitySentence = `${trial.serviceName}, ${
    isCancelled ? 'cancelled' : `${daysLeft} days left`
  }, ${trial.priceAfterTrial} pesos will be charged on ${formatReadableDate(trial.endDate)}.`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: svcBg },
        cardWidth ? { width: cardWidth } : { width: '100%' },
        isCancelled && styles.cardCancelled,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilitySentence}
    >
      {/* Subtle Lighter Overlay Shape for depth (Section 6) */}
      <View style={styles.depthOverlay} pointerEvents="none" />

      {/* Top Row: Initial Circle + Service Name & Countdown Chip */}
      <View style={styles.topRow}>
        <View style={styles.serviceIdentity}>
          <View style={styles.initialCircle}>
            <Text style={styles.initialText}>{initial}</Text>
          </View>
          <Text style={styles.serviceName} numberOfLines={1}>
            {trial.serviceName}
          </Text>
        </View>

        <View style={[styles.countdownChip, { backgroundColor: chipBg }]}>
          {chipIcon ? (
            <Ionicons
              name={chipIcon}
              size={14}
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

      {/* Middle: Big Price / Countdown (Display / H2) */}
      <View style={styles.middleRow}>
        <Text style={styles.priceHero} numberOfLines={1} adjustsFontSizeToFit>
          {formatCurrency(trial.priceAfterTrial)}
        </Text>
        <Text style={styles.cycleText} numberOfLines={1} adjustsFontSizeToFit>
          {trial.billingCycle === 'monthly' ? '/ month' : trial.billingCycle === 'yearly' ? '/ year' : 'one-time'}
        </Text>
      </View>

      {/* Bottom Row: Charge Date & Payment Method */}
      <View style={styles.bottomRow}>
        <View style={styles.dateCol}>
          <Text style={styles.bottomLabel}>CHARGE DATE</Text>
          <Text style={styles.bottomValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatReadableDate(trial.endDate)}
          </Text>
        </View>

        {trial.paymentLabel ? (
          <View style={styles.paymentCol}>
            <Text style={styles.bottomLabel}>PAYMENT</Text>
            <Text style={styles.bottomValue} numberOfLines={1} adjustsFontSizeToFit>
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
    borderRadius: 20,
    aspectRatio: 16 / 10,
    minHeight: 180,
    padding: 18,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 14,
  },
  cardCancelled: {
    opacity: 0.7,
  },
  depthOverlay: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    borderRadius: 19,
    backgroundColor: 'rgba(9, 27, 39, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  initialText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#091B27',
    fontFamily: 'Manrope_800ExtraBold',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#091B27',
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
    marginVertical: 4,
  },
  priceHero: {
    fontSize: 32,
    fontWeight: '800',
    color: '#091B27',
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -0.6,
  },
  cycleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#091B27',
    opacity: 0.8,
    marginLeft: 6,
    fontFamily: 'Manrope_600SemiBold',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(9, 27, 39, 0.12)',
    paddingTop: 8,
  },
  dateCol: {
    flex: 1,
  },
  paymentCol: {
    alignItems: 'flex-end',
    flex: 1,
  },
  bottomLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#091B27',
    opacity: 0.65,
    letterSpacing: 0.6,
    marginBottom: 2,
    fontFamily: 'Manrope_700Bold',
  },
  bottomValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#091B27',
    fontFamily: 'Manrope_700Bold',
  },
});
