// ============================================
// NoCharge Home Screen (Tab 1)
// ============================================
// Features:
// - "₱X at risk in the next 7 days" card
// - Nearest charge days indicator
// - "Ending soon" horizontal/vertical cards
// - "Estimated saved" badge
// - Floating + button to Add Trial

import React, { useState, useEffect, useCallback } from 'react';
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

  const loadData = useCallback(async () => {
    const list = await getTrials();
    setTrials(list);
  }, []);

  useEffect(() => {
    loadData();
    // Subscribe to changes from other screens (e.g. Add Trial)
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

  // Calculations for Home dashboard
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

  // Total estimated saved from cancelled trials
  const estimatedSaved = cancelledTrials.reduce(
    (sum, t) => sum + (t.priceAfterTrial || 0),
    0
  );

  // Nearest active charge in days
  const activeSorted = [...activeTrials].sort(
    (a, b) => getDaysLeft(a.endDate) - getDaysLeft(b.endDate)
  );
  const nearestDays = activeSorted.length > 0 ? getDaysLeft(activeSorted[0].endDate) : null;

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
          {/* Header Title & Subtitle */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Home</Text>
              <Text style={styles.subtitle}>Don't get charged by surprise.</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationTestBadge}
              onPress={() => router.push('/notification-result')}
              activeOpacity={0.7}
            >
              <Text style={styles.notificationTestText}>🔔 Test Screen</Text>
            </TouchableOpacity>
          </View>

          {/* Big Highlight Card: At Risk in Next 7 Days */}
          <View style={styles.atRiskCard}>
            <View style={styles.atRiskTop}>
              <View style={styles.atRiskTextCol}>
                <Text style={styles.atRiskLabel}>AT RISK IN THE NEXT 7 DAYS</Text>
                <Text style={styles.atRiskAmount}>{formatCurrency(totalAtRisk7Days)}</Text>
                <Text style={styles.atRiskSub}>
                  {endingIn7Days.length === 0
                    ? 'No charges due this week 🎉'
                    : `${endingIn7Days.length} active trial${endingIn7Days.length > 1 ? 's' : ''} ending soon`}
                </Text>
              </View>

              {/* Nearest charge badge/ring */}
              {nearestDays !== null ? (
                <View
                  style={[
                    styles.gaugeCircle,
                    nearestDays <= 1 && styles.gaugeUrgent,
                    nearestDays > 1 && nearestDays <= 3 && styles.gaugeWarning,
                  ]}
                >
                  <Text style={styles.gaugeNumber}>
                    {nearestDays < 0 ? '0' : nearestDays}
                  </Text>
                  <Text style={styles.gaugeUnit}>
                    {nearestDays === 1 ? 'day left' : 'days left'}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Estimated Saved Banner inside highlight */}
            <View style={styles.savedBanner}>
              <Text style={styles.savedIcon}>🛡️</Text>
              <View style={styles.savedTextCol}>
                <Text style={styles.savedAmount}>{formatCurrency(estimatedSaved)}</Text>
                <Text style={styles.savedLabel}>Estimated Saved from Cancelled Trials</Text>
              </View>
            </View>
          </View>

          {/* Section: Ending Soon */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ending Soon</Text>
            <TouchableOpacity onPress={() => router.push('/trials')} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See all ({activeTrials.length}) →</Text>
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
            activeSorted.slice(0, 5).map((trial) => (
              <TrialCard
                key={trial.id}
                trial={trial}
                onPress={() => router.push('/trials')}
                onDelete={handleDelete}
              />
            ))
          )}

          {/* Bottom spacing so FAB does not block last item */}
          <View style={{ height: 90 }} />
        </ScrollView>

        {/* Floating Green + Button */}
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
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  notificationTestBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  notificationTestText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B5E20',
  },

  /* At Risk Highlight Card */
  atRiskCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    ...Theme.shadows.card,
  },
  atRiskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  atRiskTextCol: {
    flex: 1,
    paddingRight: Theme.spacing.md,
  },
  atRiskLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  atRiskAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  atRiskSub: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginTop: 4,
  },

  /* Gauge Ring */
  gaugeCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Theme.colors.primaryLight,
    borderWidth: 3,
    borderColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeUrgent: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  gaugeWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  gaugeNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    lineHeight: 24,
  },
  gaugeUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
  },

  /* Estimated Saved Banner */
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primarySubtle,
    marginTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm + 2,
    borderRadius: Theme.radius.md,
  },
  savedIcon: {
    fontSize: 22,
    marginRight: Theme.spacing.sm,
  },
  savedTextCol: {
    flex: 1,
  },
  savedAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.primaryDark,
  },
  savedLabel: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.primary,
  },

  /* Empty State */
  emptyCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginTop: Theme.spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
