// ============================================
// NoCharge Sleek Fintech Trial Card Component
// ============================================
// Professional, non-slop card inspired by Cashtra:
// Monochromatic theme-tinted icon container (green in light & dark mode),
// crisp typography, payment label, bold ₱ amount, and clean countdown badge.

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Trial, formatReadableDate, formatCurrency, getCountdownInfo } from '../types/trial';
import { useAppTheme } from '../context/ThemeContext';

interface TrialCardProps {
  trial: Trial;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

/**
 * Returns a tasteful vector icon name tailored to the subscription name
 */
function getServiceIconName(name: string): keyof typeof Ionicons.glyphMap {
  const lower = name.toLowerCase();
  if (lower.includes('netflix') || lower.includes('disney') || lower.includes('hbo') || lower.includes('prime') || lower.includes('tv')) {
    return 'film-outline';
  }
  if (lower.includes('spotify') || lower.includes('apple music') || lower.includes('youtube music') || lower.includes('audio')) {
    return 'musical-notes-outline';
  }
  if (lower.includes('youtube') || lower.includes('video') || lower.includes('twitch')) {
    return 'play-outline';
  }
  if (lower.includes('claude') || lower.includes('chatgpt') || lower.includes('ai') || lower.includes('openai') || lower.includes('gemini')) {
    return 'sparkles-outline';
  }
  if (lower.includes('cloud') || lower.includes('drive') || lower.includes('dropbox') || lower.includes('icloud')) {
    return 'cloud-outline';
  }
  if (lower.includes('canva') || lower.includes('adobe') || lower.includes('figma') || lower.includes('photo')) {
    return 'color-palette-outline';
  }
  return 'card-outline';
}

export default function TrialCard({ trial, onPress, onDelete }: TrialCardProps) {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const countdown = getCountdownInfo(trial.endDate);
  const iconName = getServiceIconName(trial.serviceName);

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

  const isCancelled = trial.status === 'cancelled';
  const isKept = trial.status === 'kept';

  // Badge colors based on urgency
  let badgeBg = colors.safeBg;
  let badgeText = colors.safe;
  let badgeIcon: keyof typeof Ionicons.glyphMap = 'time-outline';

  if (isCancelled) {
    badgeBg = colors.cancelledBg;
    badgeText = colors.cancelled;
    badgeIcon = 'close-circle-outline';
  } else if (isKept) {
    badgeBg = colors.keptBg;
    badgeText = colors.kept;
    badgeIcon = 'checkmark-circle-outline';
  } else if (countdown.isUrgent) {
    badgeBg = colors.urgentBg;
    badgeText = colors.urgent;
    badgeIcon = 'alert-circle-outline';
  } else if (countdown.daysLeft <= 7) {
    badgeBg = colors.warningBg;
    badgeText = colors.warning;
    badgeIcon = 'time-outline';
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        isCancelled && styles.cardCancelled,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        {/* Themed Monochromatic Icon Squircle (Matching user Cashtra green theme) */}
        <View
          style={[
            styles.iconSquircle,
            {
              backgroundColor: isCancelled ? colors.iconContainerMuted : colors.iconContainer,
              borderColor: colors.borderLight,
            },
          ]}
        >
          <Ionicons
            name={iconName}
            size={22}
            color={isCancelled ? colors.textMuted : colors.iconColor}
          />
        </View>

        {/* Subscription Info */}
        <View style={styles.infoCol}>
          <Text
            style={[
              styles.serviceName,
              { color: colors.textPrimary },
              isCancelled && styles.textStrikethrough,
            ]}
            numberOfLines={1}
          >
            {trial.serviceName}
          </Text>
          <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
            {trial.paymentLabel ? `${trial.paymentLabel.toUpperCase()} • ` : ''}
            {trial.billingCycle ? trial.billingCycle.toUpperCase() : 'MONTHLY'}
          </Text>
        </View>

        {/* Price Column */}
        <View style={styles.priceCol}>
          <Text style={[styles.priceAmount, { color: colors.textPrimary }]}>
            {formatCurrency(trial.priceAfterTrial)}
          </Text>
          <Text style={[styles.priceCycle, { color: colors.textMuted }]}>
            {trial.billingCycle === 'monthly' ? '/ mo' : trial.billingCycle === 'yearly' ? '/ yr' : 'once'}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

      {/* Bottom Row: Due date & Countdown pill */}
      <View style={styles.bottomRow}>
        <View style={styles.dueDateRow}>
          <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
          <Text style={[styles.dueDateText, { color: colors.textMuted }]}>
            Due {formatReadableDate(trial.endDate)}
          </Text>
        </View>

        {/* Status / Countdown Badge */}
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Ionicons name={badgeIcon} size={13} color={badgeText} style={{ marginRight: 4 }} />
          <Text style={[styles.badgeText, { color: badgeText }]}>
            {isCancelled ? 'Cancelled' : isKept ? 'Kept' : countdown.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardCancelled: {
    opacity: 0.65,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSquircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  priceCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceAmount: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  priceCycle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
  },
});
