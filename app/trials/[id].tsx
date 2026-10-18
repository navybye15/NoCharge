// ============================================
// NoCharge Trial Detail Screen
// ============================================
// Features:
// - Big countdown display ("X days left" / "Tomorrow" / "Today")
// - Big primary button: "Open cancel page" (opens in browser)
// - Actions: "Cancelled na" & "Itutuloy ko" (Kept)
// - Edit details & Delete with confirmation
// - Reminder schedule info (offsets and notification status)

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  SafeAreaView,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Trial,
  formatReadableDate,
  formatCurrency,
  getCountdownInfo,
  getDaysLeft,
} from '../../types/trial';
import { getTrialById, updateTrial, deleteTrial, subscribeToTrials } from '../../services/storage';
import { Theme } from '../../constants/theme';

export default function TrialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trial, setTrial] = useState<Trial | null>(null);

  const loadTrial = async () => {
    if (!id) return;
    const found = await getTrialById(id);
    setTrial(found);
  };

  useEffect(() => {
    loadTrial();
    const unsubscribe = subscribeToTrials(loadTrial);
    return () => unsubscribe();
  }, [id]);

  if (!trial) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Trial not found or already deleted.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back to list</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const countdown = getCountdownInfo(trial.endDate);
  const initial = trial.serviceName.trim().charAt(0).toUpperCase() || '?';

  // Open cancel page link
  const handleOpenCancelPage = async () => {
    if (!trial.cancelLink) {
      Alert.alert(
        'No Cancel Link',
        'Wala pang nilagay na cancel link para sa trial na ito. I-edit ang trial para maglagay ng direct link.'
      );
      return;
    }

    try {
      const url = trial.cancelLink.startsWith('http')
        ? trial.cancelLink
        : `https://${trial.cancelLink}`;

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to Open URL', `Hindi mabuksan ang link: ${url}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Nagkaproblema sa pagbukas ng browser.');
    }
  };

  // Mark as Cancelled
  const handleMarkCancelled = async () => {
    Alert.alert(
      'Cancelled na?',
      `I-mark ba natin ang "${trial.serviceName}" bilang cancelled? Ika-cancel din ang lahat ng nakatakdang reminders para dito.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Oo, Cancelled na!',
          onPress: async () => {
            await updateTrial({ ...trial, status: 'cancelled' });
            Alert.alert(
              'Galing! 🎉',
              `Na-save mo ang ${formatCurrency(trial.priceAfterTrial)}! Na-update na ang iyong Estimated Saved balance.`
            );
          },
        },
      ]
    );
  };

  // Mark as Kept (Itutuloy ko)
  const handleMarkKept = async () => {
    Alert.alert(
      'Itutuloy mo ang subscription?',
      `Gusto mo bang ituloy ang "${trial.serviceName}" pagkatapos ng free trial? Ika-cancel ang reminders para hindi ka na maistorbo.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Oo, Itutuloy ko',
          onPress: async () => {
            await updateTrial({ ...trial, status: 'kept' });
            Alert.alert(
              'Noted! 👍',
              `Naka-mark na bilang Kept ang subscription. Matagumpay na na-cancel ang reminders.`
            );
          },
        },
      ]
    );
  };

  // Reactivate trial if already cancelled/kept
  const handleReactivate = async () => {
    await updateTrial({ ...trial, status: 'active' });
    Alert.alert('Reactivated', 'Active na ulit ang trial at naka-schedule na ang reminders.');
  };

  // Delete trial
  const handleDelete = () => {
    Alert.alert(
      'Delete Trial',
      `Sigurado ka bang gusto mong burahin nang tuluyan ang "${trial.serviceName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTrial(trial.id);
            router.back();
          },
        },
      ]
    );
  };

  const isCancelled = trial.status === 'cancelled';
  const isKept = trial.status === 'kept';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBackBtn} activeOpacity={0.7}>
            <Text style={styles.navBackText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.navDeleteBtn} activeOpacity={0.7}>
            <Text style={styles.navDeleteText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Big Countdown Hero Card */}
        <View style={styles.heroCard}>
          <View style={[styles.avatarCircle, { backgroundColor: trial.color || Theme.colors.primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <Text style={styles.serviceName}>{trial.serviceName}</Text>

          {/* Status badge */}
          {isCancelled ? (
            <View style={[styles.statusBadge, { backgroundColor: Theme.colors.cancelledBg }]}>
              <Text style={[styles.statusBadgeText, { color: Theme.colors.cancelled }]}>
                🚫 CANCELLED
              </Text>
            </View>
          ) : isKept ? (
            <View style={[styles.statusBadge, { backgroundColor: Theme.colors.keptBg }]}>
              <Text style={[styles.statusBadgeText, { color: Theme.colors.kept }]}>
                ✅ PLAN KEPT (SUBSCRIBED)
              </Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: countdown.bgColor }]}>
              <Text style={[styles.statusBadgeText, { color: countdown.color }]}>
                ⏳ {countdown.label.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Big price display */}
          <View style={styles.priceHeroRow}>
            <Text style={styles.priceHero}>{formatCurrency(trial.priceAfterTrial)}</Text>
            <Text style={styles.cycleHero}>
              {trial.billingCycle === 'monthly' ? ' / month' : trial.billingCycle === 'yearly' ? ' / year' : ' one-time'}
            </Text>
          </View>
          <Text style={styles.chargeNotice}>
            {isCancelled
              ? 'No charges will be made. You cancelled this trial.'
              : isKept
              ? 'You chose to continue this paid subscription.'
              : `Charge occurs on ${formatReadableDate(trial.endDate)}`}
          </Text>
        </View>

        {/* Primary Action Button: Open Cancel Page */}
        <TouchableOpacity
          style={[styles.primaryCancelPageBtn, !trial.cancelLink && styles.btnDisabled]}
          onPress={handleOpenCancelPage}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryCancelPageText}>
            {trial.cancelLink ? '🌐 Open Cancel Page' : '🔗 No Cancel Link Added'}
          </Text>
        </TouchableOpacity>

        {/* Two Status Decision Buttons */}
        {!isCancelled && !isKept ? (
          <View style={styles.decisionRow}>
            <TouchableOpacity
              style={[styles.decisionBtn, styles.cancelledBtn]}
              onPress={handleMarkCancelled}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelledBtnText}>🚫 Cancelled na</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.decisionBtn, styles.keptBtn]}
              onPress={handleMarkKept}
              activeOpacity={0.8}
            >
              <Text style={styles.keptBtnText}>👍 Itutuloy ko</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.reactivateBtn}
            onPress={handleReactivate}
            activeOpacity={0.8}
          >
            <Text style={styles.reactivateBtnText}>🔄 Re-activate Reminders</Text>
          </TouchableOpacity>
        )}

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsSectionTitle}>SUBSCRIPTION DETAILS</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Charge Date</Text>
            <Text style={styles.detailValue}>{formatReadableDate(trial.endDate)}</Text>
          </View>

          <View style={styles.divider} />

          {trial.startDate ? (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Started On</Text>
                <Text style={styles.detailValue}>{formatReadableDate(trial.startDate)}</Text>
              </View>
              <View style={styles.divider} />
            </>
          ) : null}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{trial.paymentLabel || 'Not specified'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reminders Scheduled</Text>
            <Text style={styles.detailValue}>
              {trial.status === 'active'
                ? `${trial.reminderOffsetsDays?.length || 0} alerts (3d, 1d, 0d)`
                : 'Turned off (Not active)'}
            </Text>
          </View>

          {trial.notes ? (
            <>
              <View style={styles.divider} />
              <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={[styles.detailLabel, { marginBottom: 4 }]}>Notes</Text>
                <Text style={styles.notesText}>{trial.notes}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  navBackBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  navBackText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  navDeleteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: Theme.radius.full,
  },
  navDeleteText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },

  /* Hero Card */
  heroCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.card,
    marginBottom: Theme.spacing.lg,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Theme.radius.full,
    marginBottom: Theme.spacing.md,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  priceHeroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  priceHero: {
    fontSize: 34,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
  },
  cycleHero: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    marginLeft: 4,
  },
  chargeNotice: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },

  /* Primary Action Button */
  primaryCancelPageBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.floating,
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
  },
  primaryCancelPageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  /* Decision Action Buttons */
  decisionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Theme.spacing.lg,
  },
  decisionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelledBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EF4444',
  },
  cancelledBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '800',
  },
  keptBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#3B82F6',
  },
  keptBtnText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '800',
  },
  reactivateBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    paddingVertical: 12,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  reactivateBtnText: {
    color: Theme.colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },

  /* Details Card */
  detailsCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.card,
  },
  detailsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  notesText: {
    fontSize: 13,
    color: Theme.colors.textPrimary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.borderLight,
    marginVertical: 10,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Theme.radius.md,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
