// ============================================
// NoCharge Trial Detail Screen — DESIGN.md
// ============================================
// Specs:
// - LinearGradient background from --bg-gradient-start to --bg-gradient-end
// - Hero card with initial circle, status badge, big price (Display 40dp, 800)
// - "Open Cancel Page": 52dp height, 16dp radius, 24dp padding, filled --primary with --on-primary (#091B27) text
// - Decision buttons: 52dp height, 16dp radius
// - Cards with 20dp radius, --surface fill, --border border
// - Typography: Manrope

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import LinearGradient from '../../components/LinearGradient';
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
import { getServiceColor } from '../../constants/theme';

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
      <LinearGradient
        colors={[colors.bgGradientStart, colors.bgGradientEnd]}
        style={[styles.gradient, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: colors.textMuted }]}>
            Trial not found or deleted.
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backBtnText, { color: colors.onPrimary }]}>← Back to list</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const countdown = getCountdownInfo(trial.endDate);
  const initial = trial.serviceName.trim().charAt(0).toUpperCase() || '?';
  const svcColor = trial.color || getServiceColor(trial.serviceName);

  const handleOpenCancelPage = async () => {
    if (!trial.cancelLink) {
      Alert.alert(
        'No Cancel Link',
        'Wala pang nilagay na cancel link para sa trial na ito. Pindutin ang Edit para maglagay ng direct link.'
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
    <LinearGradient
      colors={[colors.bgGradientStart, colors.bgGradientEnd]}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 20) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.navBackBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={18} color={colors.text} />
            <Text style={[styles.navBackText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push(`/trials/add?editId=${trial.id}` as any)}
              style={[
                styles.navEditBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Edit trial"
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={isDark ? colors.primary : colors.primaryStrong}
              />
              <Text
                style={[
                  styles.navEditText,
                  { color: isDark ? colors.primary : colors.primaryStrong },
                ]}
              >
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              style={[
                styles.navDeleteBtn,
                {
                  backgroundColor: isDark ? colors.surface2 : 'rgba(217, 45, 32, 0.12)',
                },
              ]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Delete trial"
            >
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Initial Circle */}
          <View style={[styles.avatarCircle, { backgroundColor: svcColor }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <Text style={[styles.serviceName, { color: colors.text }]}>{trial.serviceName}</Text>

          {/* Status Badge */}
          {isCancelled ? (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isDark ? colors.surface2 : '#E8F8EE' },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={isDark ? colors.primary : colors.primaryStrong}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: isDark ? colors.primary : colors.primaryStrong },
                ]}
              >
                CANCELLED
              </Text>
            </View>
          ) : isKept ? (
            <View style={[styles.statusBadge, { backgroundColor: colors.surface2 }]}>
              <Ionicons
                name="checkmark"
                size={14}
                color={colors.text}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.statusBadgeText, { color: colors.text }]}>
                KEPT (SUBSCRIBED)
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: countdown.isUrgent
                    ? colors.accent
                    : isDark
                    ? colors.surface2
                    : '#E8F8EE',
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={
                  countdown.isUrgent
                    ? colors.onAccent
                    : isDark
                    ? colors.primary
                    : colors.primaryStrong
                }
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color: countdown.isUrgent
                      ? colors.onAccent
                      : isDark
                      ? colors.primary
                      : colors.primaryStrong,
                  },
                ]}
              >
                {countdown.label.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Big Price Display (Display 40dp, 800) */}
          <View style={styles.priceHeroRow}>
            <Text style={[styles.priceHero, { color: colors.text }]}>
              {formatCurrency(trial.priceAfterTrial)}
            </Text>
            <Text style={[styles.cycleHero, { color: colors.textMuted }]}>
              {trial.billingCycle === 'monthly'
                ? ' / month'
                : trial.billingCycle === 'yearly'
                ? ' / year'
                : ' one-time'}
            </Text>
          </View>
          <Text style={[styles.chargeNotice, { color: colors.textMuted }]}>
            {isCancelled
              ? 'No charges will be made. You cancelled this trial.'
              : isKept
              ? 'You chose to continue this paid subscription.'
              : `Charge occurs on ${formatReadableDate(trial.endDate)}`}
          </Text>
        </View>

        {/* Primary Action Button: Open Cancel Page (52dp, 16dp radius, filled --primary with --on-primary text) */}
        <TouchableOpacity
          style={[
            styles.primaryCancelPageBtn,
            {
              backgroundColor: trial.cancelLink ? colors.primary : colors.surface2,
              borderColor: trial.cancelLink ? colors.primary : colors.border,
            },
          ]}
          onPress={handleOpenCancelPage}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open cancel page"
        >
          <Ionicons
            name={trial.cancelLink ? 'open-outline' : 'link-outline'}
            size={18}
            color={trial.cancelLink ? colors.onPrimary : colors.textMuted}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.primaryCancelPageText,
              { color: trial.cancelLink ? colors.onPrimary : colors.textMuted },
            ]}
          >
            {trial.cancelLink ? 'Open Cancel Page' : 'No Cancel Link Added'}
          </Text>
        </TouchableOpacity>

        {/* Decision Buttons (52dp height) */}
        {!isCancelled && !isKept ? (
          <View style={styles.decisionRow}>
            <TouchableOpacity
              style={[
                styles.decisionBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.danger,
                },
              ]}
              onPress={handleMarkCancelled}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Mark as cancelled"
            >
              <Ionicons
                name="close-circle-outline"
                size={18}
                color={colors.danger}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.decisionBtnText, { color: colors.danger }]}>
                Cancelled na
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.decisionBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? colors.primary : colors.primaryStrong,
                },
              ]}
              onPress={handleMarkKept}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Keep subscription"
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={isDark ? colors.primary : colors.primaryStrong}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.decisionBtnText,
                  { color: isDark ? colors.primary : colors.primaryStrong },
                ]}
              >
                Itutuloy ko
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.reactivateBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={handleReactivate}
            activeOpacity={0.8}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={isDark ? colors.primary : colors.primaryStrong}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.reactivateBtnText,
                { color: isDark ? colors.primary : colors.primaryStrong },
              ]}
            >
              Re-activate Reminders
            </Text>
          </TouchableOpacity>
        )}

        {/* Details Card */}
        <View
          style={[
            styles.detailsCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.detailsSectionTitle, { color: colors.textMuted }]}>
            SUBSCRIPTION DETAILS
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Charge Date</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatReadableDate(trial.endDate)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {trial.startDate ? (
            <>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Started On</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatReadableDate(trial.startDate)}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </>
          ) : null}

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Payment Method</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {trial.paymentLabel || 'Not specified'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
              Reminders Scheduled
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {trial.status === 'active'
                ? `${trial.reminderOffsetsDays?.length || 3} alerts (3d, 1d, 0d)`
                : 'Turned off (Not active)'}
            </Text>
          </View>

          {trial.notes ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted, marginBottom: 4 }]}>
                  Notes
                </Text>
                <Text style={[styles.notesText, { color: colors.text }]}>{trial.notes}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
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
    fontFamily: 'Manrope_500Medium',
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
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
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  navBackText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  navEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  navEditText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  navDeleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Manrope_800ExtraBold',
    color: '#091B27',
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
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
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.5,
  },
  priceHeroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  priceHero: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -0.6,
  },
  cycleHero: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
    marginLeft: 6,
  },
  chargeNotice: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
  },
  primaryCancelPageBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryCancelPageText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  decisionBtn: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  decisionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  reactivateBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  reactivateBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  detailsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  detailsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
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
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Manrope_400Regular',
  },
});
