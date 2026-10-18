// ============================================
// NoCharge Trial Detail Screen
// ============================================

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Trial,
  formatReadableDate,
  formatCurrency,
  getCountdownInfo,
} from '../../types/trial';
import { getTrialById, updateTrial, deleteTrial, subscribeToTrials } from '../../services/storage';
import { useAppTheme } from '../../context/ThemeContext';

export default function TrialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
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
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Trial not found or deleted.</Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>← Back to list</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const countdown = getCountdownInfo(trial.endDate);

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

  const handleMarkCancelled = async () => {
    Alert.alert(
      'Mark as Cancelled',
      'Sigurado ka bang na-cancel mo na ito? Kakanselahin na ang lahat ng upcoming reminders at idadagdag ito sa iyong "Total Saved" tracker.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Cancelled',
          onPress: async () => {
            const updated: Trial = {
              ...trial,
              status: 'cancelled',
              updatedAt: new Date().toISOString(),
            };
            await updateTrial(updated);
            setTrial(updated);
            Alert.alert('Saved!', `Na-record na bilang Cancelled ang ${trial.serviceName}.`);
          },
        },
      ]
    );
  };

  const handleMarkKept = async () => {
    Alert.alert(
      'Itutuloy ang Subscription',
      'Itutuloy mo ba ang paid subscription pagkatapos ng trial?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Kept',
          onPress: async () => {
            const updated: Trial = {
              ...trial,
              status: 'kept',
              updatedAt: new Date().toISOString(),
            };
            await updateTrial(updated);
            setTrial(updated);
          },
        },
      ]
    );
  };

  const handleReactivate = async () => {
    const updated: Trial = {
      ...trial,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };
    await updateTrial(updated);
    setTrial(updated);
    Alert.alert('Re-activated', 'Naka-schedule na ulit ang reminders bago ang charge date.');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Trial',
      `Sigurado ka bang gusto mong tanggalin ang "${trial.serviceName}"?`,
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
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 24) }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.navBackBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
            <Text style={[styles.navBackText, { color: colors.textPrimary }]}>Back</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push(`/trials/add?editId=${trial.id}` as any)}
              style={[styles.navEditBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} />
              <Text style={[styles.navEditText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.navDeleteBtn, { backgroundColor: colors.urgentBg }]}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color={colors.urgent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.iconContainer, borderColor: colors.borderLight }]}>
            <Ionicons name="card-outline" size={32} color={colors.iconColor} />
          </View>

          <Text style={[styles.serviceName, { color: colors.textPrimary }]}>{trial.serviceName}</Text>

          {/* Status badge */}
          {isCancelled ? (
            <View style={[styles.statusBadge, { backgroundColor: colors.cancelledBg }]}>
              <Ionicons name="close-circle-outline" size={14} color={colors.cancelled} style={{ marginRight: 4 }} />
              <Text style={[styles.statusBadgeText, { color: colors.cancelled }]}>CANCELLED</Text>
            </View>
          ) : isKept ? (
            <View style={[styles.statusBadge, { backgroundColor: colors.keptBg }]}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.kept} style={{ marginRight: 4 }} />
              <Text style={[styles.statusBadgeText, { color: colors.kept }]}>KEPT (SUBSCRIBED)</Text>
            </View>
          ) : (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: countdown.isUrgent ? colors.urgentBg : colors.primaryLight },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={countdown.isUrgent ? colors.urgent : colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: countdown.isUrgent ? colors.urgent : colors.primary },
                ]}
              >
                {countdown.label.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Big price display */}
          <View style={styles.priceHeroRow}>
            <Text style={[styles.priceHero, { color: colors.textPrimary }]}>
              {formatCurrency(trial.priceAfterTrial)}
            </Text>
            <Text style={[styles.cycleHero, { color: colors.textMuted }]}>
              {trial.billingCycle === 'monthly' ? ' / month' : trial.billingCycle === 'yearly' ? ' / year' : ' one-time'}
            </Text>
          </View>
          <Text style={[styles.chargeNotice, { color: colors.textSecondary }]}>
            {isCancelled
              ? 'No charges will be made. You cancelled this trial.'
              : isKept
              ? 'You chose to continue this paid subscription.'
              : `Charge occurs on ${formatReadableDate(trial.endDate)}`}
          </Text>
        </View>

        {/* Primary Action Button: Open Cancel Page */}
        <TouchableOpacity
          style={[
            styles.primaryCancelPageBtn,
            { backgroundColor: trial.cancelLink ? colors.primary : colors.surfaceSubtle },
            !trial.cancelLink && { borderColor: colors.border, borderWidth: 1 },
          ]}
          onPress={handleOpenCancelPage}
          activeOpacity={0.8}
        >
          <Ionicons
            name={trial.cancelLink ? 'open-outline' : 'link-outline'}
            size={18}
            color={trial.cancelLink ? '#FFFFFF' : colors.textMuted}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.primaryCancelPageText,
              { color: trial.cancelLink ? '#FFFFFF' : colors.textMuted },
            ]}
          >
            {trial.cancelLink ? 'Open Cancel Page' : 'No Cancel Link Added'}
          </Text>
        </TouchableOpacity>

        {/* Decision Buttons */}
        {!isCancelled && !isKept ? (
          <View style={styles.decisionRow}>
            <TouchableOpacity
              style={[styles.decisionBtn, { backgroundColor: colors.urgentBg, borderColor: colors.urgent }]}
              onPress={handleMarkCancelled}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={17} color={colors.urgent} style={{ marginRight: 6 }} />
              <Text style={[styles.decisionBtnText, { color: colors.urgent }]}>Cancelled na</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.decisionBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
              onPress={handleMarkKept}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={17} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.decisionBtnText, { color: colors.primary }]}>Itutuloy ko</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.reactivateBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleReactivate}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.reactivateBtnText, { color: colors.primary }]}>Re-activate Reminders</Text>
          </TouchableOpacity>
        )}

        {/* Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.detailsSectionTitle, { color: colors.textMuted }]}>SUBSCRIPTION DETAILS</Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Charge Date</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatReadableDate(trial.endDate)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          {trial.startDate ? (
            <>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Started On</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatReadableDate(trial.startDate)}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            </>
          ) : null}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Payment Method</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{trial.paymentLabel || 'Not specified'}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Reminders Scheduled</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              {trial.status === 'active'
                ? `${trial.reminderOffsetsDays?.length || 3} alerts (3d, 1d, 0d)`
                : 'Turned off (Not active)'}
            </Text>
          </View>

          {trial.notes ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
              <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary, marginBottom: 4 }]}>Notes</Text>
                <Text style={[styles.notesText, { color: colors.textPrimary }]}>{trial.notes}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notFoundContainer: {
    padding: 30,
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingTop: 4,
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  navBackText: {
    fontSize: 14,
    fontWeight: '700',
  },
  navEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  navEditText: {
    fontSize: 14,
    fontWeight: '700',
  },
  navDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    marginBottom: 16,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  priceHeroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  priceHero: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  cycleHero: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  chargeNotice: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  primaryCancelPageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCancelPageText: {
    fontSize: 15,
    fontWeight: '800',
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  decisionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  decisionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  reactivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  reactivateBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  detailsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
