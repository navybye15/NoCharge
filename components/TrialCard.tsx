// ============================================
// Cashtra-Style Wallet Trial Card Component
// ============================================
// Signature Cashtra stacked wallet card design:
// Rich colored cards, initial badge, payment method tag,
// bold ₱ amount, and countdown badge.

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Trial, formatReadableDate, formatCurrency, getCountdownInfo } from '../types/trial';
import { Theme } from '../constants/theme';

interface TrialCardProps {
  trial: Trial;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

export default function TrialCard({ trial, onPress, onDelete }: TrialCardProps) {
  const router = useRouter();
  const countdown = getCountdownInfo(trial.endDate);
  const initial = trial.serviceName.trim().charAt(0).toUpperCase() || '?';

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

  // Card color background (Cashtra signature style)
  const cardColor = isCancelled ? '#64748B' : trial.color || Theme.colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.walletCard,
        { backgroundColor: cardColor },
        isCancelled && styles.cardCancelled,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
    >
      {/* Background card texture/shading for depth */}
      <View style={styles.cardShine} />

      <View style={styles.cardContent}>
        {/* Top Row: Service info and Price */}
        <View style={styles.topRow}>
          {/* Service Initial Badge */}
          <View style={styles.iconBadge}>
            <Text style={styles.iconInitial}>{initial}</Text>
          </View>

          {/* Name & Payment label */}
          <View style={styles.nameCol}>
            <Text
              style={[styles.serviceName, isCancelled && styles.textStrikethrough]}
              numberOfLines={1}
            >
              {trial.serviceName}
            </Text>
            <Text style={styles.paymentSub}>
              {trial.paymentLabel ? `${trial.paymentLabel.toUpperCase()} • ` : ''}
              {trial.billingCycle ? trial.billingCycle.toUpperCase() : 'MONTHLY'}
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceCol}>
            <Text style={styles.priceAmount}>{formatCurrency(trial.priceAfterTrial)}</Text>
            <Text style={styles.priceCycle}>
              {trial.billingCycle === 'monthly' ? '/ mo' : trial.billingCycle === 'yearly' ? '/ yr' : 'once'}
            </Text>
          </View>
        </View>

        {/* Bottom Row: Countdown Pill & Deadline Date */}
        <View style={styles.bottomRow}>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>
              Charge date: <Text style={styles.dateBold}>{formatReadableDate(trial.endDate)}</Text>
            </Text>
          </View>

          {/* Status Chip */}
          {isCancelled ? (
            <View style={[styles.chip, styles.chipCancelled]}>
              <Text style={styles.chipTextCancelled}>🚫 CANCELLED</Text>
            </View>
          ) : isKept ? (
            <View style={[styles.chip, styles.chipKept]}>
              <Text style={styles.chipTextKept}>✅ KEPT</Text>
            </View>
          ) : (
            <View
              style={[
                styles.chip,
                countdown.isUrgent ? styles.chipUrgent : countdown.isWarning ? styles.chipWarning : styles.chipSafe,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  countdown.isUrgent ? styles.chipTextUrgent : countdown.isWarning ? styles.chipTextWarning : styles.chipTextSafe,
                ]}
              >
                ⏳ {countdown.label}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  walletCard: {
    borderRadius: Theme.radius.lg,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    ...Theme.shadows.walletCard,
  },
  cardCancelled: {
    opacity: 0.75,
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardContent: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  iconInitial: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nameCol: {
    flex: 1,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  paymentSub: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  priceCycle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dateBold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  chipUrgent: {
    backgroundColor: '#FEF2F2',
  },
  chipTextUrgent: {
    color: '#DC2626',
  },
  chipWarning: {
    backgroundColor: '#FFFBEB',
  },
  chipTextWarning: {
    color: '#B45309',
  },
  chipSafe: {
    backgroundColor: '#ECFDF5',
  },
  chipTextSafe: {
    color: '#047857',
  },
  chipCancelled: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  chipTextCancelled: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  chipKept: {
    backgroundColor: '#DBEAFE',
  },
  chipTextKept: {
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '800',
  },
});
