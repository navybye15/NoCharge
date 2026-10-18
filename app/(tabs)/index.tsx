// ============================================
// NoCharge Cashtra + Image 1 & 2 Home Screen
// ============================================
// Features:
// - Top Greeting Pill [👋 Hello, Saver!] + Notification Bell [🔔]
// - Cashtra / Image 1 Hero Card with Circular Gauge Arc
// - Horizontal Week Calendar Strip (Image 2)
// - Cashtra Signature Stacked Colorful Wallet Cards
// - Floating + Action Button

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Trial, formatCurrency, getDaysLeft } from '../../types/trial';
import { getTrials, deleteTrial, subscribeToTrials } from '../../services/storage';
import { Theme } from '../../constants/theme';
import TrialCard from '../../components/TrialCard';
import FloatingAddButton from '../../components/FloatingAddButton';

export default function HomeScreen() {
  const router = useRouter();
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

  // Calculations for Cashtra Dashboard
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

  // Percentage safe vs risk
  const riskPercentage = totalActiveMonthly > 0
    ? Math.min(100, Math.round((totalAtRisk7Days / totalActiveMonthly) * 100))
    : 0;

  // Current Week Days (Sunday to Saturday) - Image 2 inspo
  const weekDays = useMemo(() => {
    const now = new Date();
    const currDay = now.getDay(); // 0 = Sun
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - currDay);

    const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const isoStr = d.toISOString().split('T')[0];

      // Check if any trial ends on this date
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Theme.colors.primary]}
            />
          }
        >
          {/* Top Bar: Inspo 1 & 2 User Greeting Pill + Notification Bell */}
          <View style={styles.topBar}>
            <View style={styles.userPill}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>🛡️</Text>
              </View>
              <View>
                <Text style={styles.userGreeting}>Hello, Saver!</Text>
                <Text style={styles.userSubtitle}>Don't get charged</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => router.push('/notification-result')}
              activeOpacity={0.7}
            >
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

          {/* Cashtra + Inspo 1: Highlight Hero Card with Circular Gauge */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextCol}>
                <View style={styles.heroTagBadge}>
                  <Text style={styles.heroTagText}>⚡ AT RISK IN 7 DAYS</Text>
                </View>
                <Text style={styles.heroAmount}>{formatCurrency(totalAtRisk7Days)}</Text>
                <Text style={styles.heroSubtitle}>
                  {nearestTrial
                    ? `Next: ${nearestTrial.serviceName} (${getDaysLeft(nearestTrial.endDate)}d left)`
                    : 'No upcoming charges due 🎉'}
                </Text>
              </View>

              {/* Cashtra Circular Gauge Arc */}
              <View style={styles.gaugeContainer}>
                <View
                  style={[
                    styles.gaugeArc,
                    nearestDays !== null && nearestDays <= 1 && styles.gaugeArcUrgent,
                  ]}
                >
                  <Text style={styles.gaugePercent}>
                    {nearestDays !== null ? (nearestDays < 0 ? '0' : nearestDays) : '0'}
                  </Text>
                  <Text style={styles.gaugeLabel}>
                    {nearestDays === 1 ? 'DAY LEFT' : 'DAYS'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Split Stat Row (Cashtra Style: Remaining vs Spent / Saved) */}
            <View style={styles.statSplitRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Active Plans</Text>
                <Text style={styles.statValue}>{formatCurrency(totalActiveMonthly)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Estimated Saved</Text>
                <Text style={[styles.statValue, { color: '#047857' }]}>
                  {formatCurrency(estimatedSaved)}
                </Text>
              </View>
            </View>
          </View>

          {/* Inspo 2: Horizontal Week Date Strip */}
          <View style={styles.weekStripContainer}>
            <View style={styles.weekStripHeader}>
              <Text style={styles.weekStripTitle}>This Week's Schedule</Text>
              <TouchableOpacity onPress={() => router.push('/calendar')} activeOpacity={0.7}>
                <Text style={styles.calendarLink}>View Calendar →</Text>
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
                      isSelected && styles.dayPillSelected,
                    ]}
                    onPress={() => setSelectedDayIdx(idx)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayPillName,
                        isSelected && styles.dayPillNameSelected,
                      ]}
                    >
                      {item.dayName}
                    </Text>
                    <Text
                      style={[
                        styles.dayPillNumber,
                        isSelected && styles.dayPillNumberSelected,
                      ]}
                    >
                      {item.dateNum}
                    </Text>
                    {item.hasTrialEnding ? (
                      <View
                        style={[
                          styles.dotIndicator,
                          isSelected && styles.dotIndicatorSelected,
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

          {/* Section: Cashtra Stacked Accounts / Ending Soon */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Ending Soon</Text>
              <Text style={styles.sectionSubtitle}>Cancel before charge date</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/trials')} activeOpacity={0.7}>
              <Text style={styles.seeAllBtn}>See all ({activeTrials.length}) →</Text>
            </TouchableOpacity>
          </View>

          {activeSorted.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyTitle}>Walang active free trials!</Text>
              <Text style={styles.emptySubtitle}>
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

          {/* Spacing for FAB */}
          <View style={{ height: 95 }} />
        </ScrollView>

        {/* Floating Green + Action Button */}
        <FloatingAddButton />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  /* Top Bar (Inspo 1 & 2) */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.card,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  userGreeting: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  userSubtitle: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    ...Theme.shadows.card,
  },
  bellIcon: {
    fontSize: 18,
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  /* Hero Card (Cashtra + Inspo 1 Gradient Card) */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    ...Theme.shadows.card,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  heroTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
    marginBottom: 6,
  },
  heroTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 4,
  },

  /* Cashtra Circular Gauge Arc */
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeArc: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primaryLight,
    borderWidth: 4,
    borderColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeArcUrgent: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  gaugePercent: {
    fontSize: 22,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    lineHeight: 24,
  },
  gaugeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.4,
  },

  /* Stat Split Row (Cashtra Style) */
  statSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.lg,
    marginTop: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#BBF7D0',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
  },

  /* Horizontal Week Date Strip (Image 2) */
  weekStripContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radius.lg,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.card,
  },
  weekStripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  weekStripTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  calendarLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Theme.radius.md,
    backgroundColor: '#F8FAFC',
    minWidth: 40,
  },
  dayPillSelected: {
    backgroundColor: Theme.colors.primary,
  },
  dayPillName: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textMuted,
    marginBottom: 4,
  },
  dayPillNameSelected: {
    color: '#FFFFFF',
  },
  dayPillNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  dayPillNumberSelected: {
    color: '#FFFFFF',
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EF4444',
    marginTop: 4,
  },
  dotIndicatorSelected: {
    backgroundColor: '#FFFFFF',
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  seeAllBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.primary,
  },

  /* Empty State */
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
