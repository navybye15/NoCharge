// ============================================
// NoCharge Cashtra Fintech Home Screen
// ============================================
// Features:
// - Top Header with official 3D Logo mark & Ionicons notification bell
// - Cashtra / Image 1 Hero Card with Circular Gauge Arc & Split Stats
// - Horizontal Week Calendar Strip with dot indicators
// - Monochromatic Theme-tinted Trial Cards
// - Adaptive Dark / Light / System Mode

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Trial, formatCurrency, getDaysLeft } from '../../types/trial';
import { getTrials, deleteTrial, subscribeToTrials } from '../../services/storage';
import { useAppTheme } from '../../context/ThemeContext';
import TrialCard from '../../components/TrialCard';
import FloatingAddButton from '../../components/FloatingAddButton';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(new Date().getDay()); // 0 = Sun

  const loadData = useCallback(async () => {
    const list = await getTrials();
    setTrials(list);
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToTrials(loadData);
    return () => unsubscribe();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTrial(id);
    await loadData();
  };

  // Calculations
  const activeTrials = trials.filter((t) => t.status === 'active');
  const cancelledTrials = trials.filter((t) => t.status === 'cancelled');

  // Trials ending within 7 days
  const endingIn7Days = activeTrials.filter((t) => {
    const days = getDaysLeft(t.endDate);
    return days >= 0 && days <= 7;
  });

  const totalAtRisk7Days = endingIn7Days.reduce(
    (sum, t) => sum + (t.priceAfterTrial || 0),
    0
  );

  const totalActiveMonthly = activeTrials.reduce(
    (sum, t) => sum + (t.priceAfterTrial || 0),
    0
  );

  const estimatedSaved = cancelledTrials.reduce(
    (sum, t) => sum + (t.priceAfterTrial || 0),
    0
  );

  // Sorted by nearest deadline
  const activeSorted = [...activeTrials].sort(
    (a, b) => getDaysLeft(a.endDate) - getDaysLeft(b.endDate)
  );

  const nearestDays = activeSorted.length > 0 ? getDaysLeft(activeSorted[0].endDate) : null;
  const nearestTrial = activeSorted.length > 0 ? activeSorted[0] : null;

  // Current Week Days (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const now = new Date();
    const currDay = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - currDay);

    const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const isoStr = d.toISOString().split('T')[0];

      const hasTrialEnding = activeTrials.some((t) => t.endDate === isoStr);

      days.push({
        dayName: labels[i],
        dateNum: d.getDate(),
        isToday: i === currDay,
        hasTrialEnding,
        isoStr,
      });
    }
    return days;
  }, [activeTrials]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Top Bar: Official Logo + App Title & Notification Button */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={[styles.logoContainer, { backgroundColor: colors.iconContainer, borderColor: colors.borderLight }]}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>NoCharge</Text>
                <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                  Smart Free Trial Tracker
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.bellButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/notification-result')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
              <View style={[styles.bellDot, { backgroundColor: colors.primary }]} />
            </TouchableOpacity>
          </View>

          {/* Cashtra Hero Card with Circular Gauge */}
          <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextCol}>
                <View style={[styles.heroTagBadge, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="flash" size={11} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.heroTagText, { color: colors.primary }]}>AT RISK IN 7 DAYS</Text>
                </View>
                <Text style={[styles.heroAmount, { color: colors.textPrimary }]}>
                  {formatCurrency(totalAtRisk7Days)}
                </Text>
                <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                  {nearestTrial
                    ? `Next: ${nearestTrial.serviceName} (${getDaysLeft(nearestTrial.endDate)}d left)`
                    : 'No upcoming charges due'}
                </Text>
              </View>

              {/* Circular Gauge Arc */}
              <View style={styles.gaugeContainer}>
                <View
                  style={[
                    styles.gaugeArc,
                    {
                      borderColor: nearestDays !== null && nearestDays <= 1 ? colors.urgent : colors.primary,
                      backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.gaugePercent,
                      { color: nearestDays !== null && nearestDays <= 1 ? colors.urgent : colors.textPrimary },
                    ]}
                  >
                    {nearestDays !== null ? (nearestDays < 0 ? '0' : nearestDays) : '0'}
                  </Text>
                  <Text style={[styles.gaugeLabel, { color: colors.textMuted }]}>
                    {nearestDays === 1 ? 'DAY' : 'DAYS'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Split Stat Row (Cashtra Style) */}
            <View style={[styles.statSplitRow, { backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceSubtle, borderColor: colors.borderLight }]}>
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Plans</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {formatCurrency(totalActiveMonthly)}
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Saved</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {formatCurrency(estimatedSaved)}
                </Text>
              </View>
            </View>
          </View>

          {/* Week Schedule Strip */}
          <View style={[styles.weekStripContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.weekStripHeader}>
              <Text style={[styles.weekStripTitle, { color: colors.textPrimary }]}>This Week</Text>
              <TouchableOpacity onPress={() => router.push('/calendar')} activeOpacity={0.7}>
                <Text style={[styles.calendarLink, { color: colors.primary }]}>Calendar →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {weekDays.map((item, idx) => {
                const isSelected = selectedDayIdx === idx;
                return (
                  <TouchableOpacity
                    key={`day-${idx}`}
                    style={[
                      styles.dayPill,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? colors.surfaceElevated
                          : colors.surfaceSubtle,
                      },
                    ]}
                    onPress={() => setSelectedDayIdx(idx)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayPillName,
                        { color: isSelected ? '#FFFFFF' : colors.textMuted },
                      ]}
                    >
                      {item.dayName}
                    </Text>
                    <Text
                      style={[
                        styles.dayPillNumber,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {item.dateNum}
                    </Text>
                    {item.hasTrialEnding ? (
                      <View
                        style={[
                          styles.dotIndicator,
                          { backgroundColor: isSelected ? '#FFFFFF' : colors.urgent },
                        ]}
                      />
                    ) : (
                      <View style={{ height: 4 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section: Ending Soon */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ending Soon</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Cancel before charge date
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/trials')} activeOpacity={0.7}>
              <Text style={[styles.seeAllBtn, { color: colors.primary }]}>
                See all ({activeTrials.length}) →
              </Text>
            </TouchableOpacity>
          </View>

          {activeSorted.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Walang active free trials!</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                I-tap ang floating '+' button para mag-record ng bagong free trial at mag-set ng reminders.
              </Text>
            </View>
          ) : (
            activeSorted.map((trial) => (
              <TrialCard
                key={trial.id}
                trial={trial}
                onDelete={handleDelete}
              />
            ))
          )}

          {/* Bottom spacing for FAB */}
          <View style={{ height: 95 }} />
        </ScrollView>

        <FloatingAddButton />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 38,
    height: 38,
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  heroTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 8,
  },
  heroTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeArc: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugePercent: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  gaugeLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  statSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  weekStripContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  weekStripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekStripTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  calendarLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPill: {
    width: 40,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  dayPillName: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  dayPillNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  seeAllBtn: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
