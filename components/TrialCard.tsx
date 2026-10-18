// ============================================
// Trial Card Component
// ============================================
// Rounded white card representing a trial with
// colored initial circle, price, and countdown chip.

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Trial, formatReadableDate, formatCurrency, getCountdownInfo } from '../types/trial';
import { Theme } from '../constants/theme';

interface TrialCardProps {
  trial: Trial;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

export default function TrialCard({ trial, onPress, onDelete }: TrialCardProps) {
  const countdown = getCountdownInfo(trial.endDate);
  const initial = trial.serviceName.trim().charAt(0).toUpperCase() || '?';

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

  return (
    <TouchableOpacity
      style={[styles.card, isCancelled && styles.cardCancelled]}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        {/* Left: Service Avatar circle with initial */}
        <View style={[styles.avatar, { backgroundColor: trial.color || Theme.colors.primary }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        {/* Center: Service info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.serviceName, isCancelled && styles.textStrikethrough]} numberOfLines={1}>
            {trial.serviceName}
          </Text>
          <View style={styles.metaRow}>
            {trial.paymentLabel ? (
              <Text style={styles.metaText}>{trial.paymentLabel} • </Text>
            ) : null}
            <Text style={styles.metaText}>
              Ends {formatReadableDate(trial.endDate)}
            </Text>
          </View>
        </View>

        {/* Right: Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{formatCurrency(trial.priceAfterTrial)}</Text>
          <Text style={styles.cycleText}>
            {trial.billingCycle === 'monthly' ? '/ mo' : trial.billingCycle === 'yearly' ? '/ yr' : 'once'}
          </Text>
        </View>
      </View>

      {/* Card Footer: Status Chip and Quick Details */}
      <View style={styles.cardFooter}>
        {isCancelled ? (
          <View style={[styles.chip, { backgroundColor: Theme.colors.cancelledBg }]}>
            <Text style={[styles.chipText, { color: Theme.colors.cancelled }]}>
              🚫 Cancelled
            </Text>
          </View>
        ) : isKept ? (
          <View style={[styles.chip, { backgroundColor: Theme.colors.keptBg }]}>
            <Text style={[styles.chipText, { color: Theme.colors.kept }]}>
              ✅ Keeping Plan
            </Text>
          </View>
        ) : (
          <View style={[styles.chip, { backgroundColor: countdown.bgColor }]}>
            <Text style={[styles.chipText, { color: countdown.color }]}>
              ⏳ {countdown.label}
            </Text>
          </View>
        )}

        {trial.cancelLink ? (
          <View style={styles.linkBadge}>
            <Text style={styles.linkBadgeText}>🔗 Cancel Link</Text>
          </View>
        ) : (
          <Text style={styles.hintText}>Hold to delete</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.card,
  },
  cardCancelled: {
    opacity: 0.7,
    backgroundColor: '#FAFAFA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: Theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 3,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: Theme.colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginLeft: Theme.spacing.sm,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  cycleText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.sm + 2,
    paddingTop: Theme.spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderLight,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  linkBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  linkBadgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  hintText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontStyle: 'italic',
  },
});
