// ============================================
// NoCharge Cashtra Accounts-Style Trials Screen
// ============================================
// Features:
// - Cashtra Accounts header with search & add action
// - Total Active Subscriptions balance card
// - Cashtra horizontal filter pills [All | Ending Soon | Cancelled | Kept]
// - Stack of colorful wallet cards
// - Floating + action button

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Trial, getDaysLeft, formatCurrency } from '../../types/trial';
import { getTrials, deleteTrial, subscribeToTrials } from '../../services/storage';
import { Theme } from '../../constants/theme';
import TrialCard from '../../components/TrialCard';
import FloatingAddButton from '../../components/FloatingAddButton';

type FilterType = 'all' | 'ending_soon' | 'cancelled' | 'kept';

export default function TrialsScreen() {
  const router = useRouter();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  // Active trials total sum
  const activeTrials = trials.filter((t) => t.status === 'active');
  const totalActivePrice = activeTrials.reduce((sum, t) => sum + (t.priceAfterTrial || 0), 0);

  // Filter & sort logic
  const filteredTrials = trials.filter((t) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.serviceName.toLowerCase().includes(q);
      const matchPayment = t.paymentLabel?.toLowerCase().includes(q);
      if (!matchName && !matchPayment) return false;
    }

    if (filter === 'cancelled') {
      return t.status === 'cancelled';
    }
    if (filter === 'kept') {
      return t.status === 'kept';
    }
    if (filter === 'ending_soon') {
      const days = getDaysLeft(t.endDate);
      return t.status === 'active' && days >= 0 && days <= 7;
    }
    return true; // 'all'
  });

  // Sort by nearest deadline
  const sortedTrials = [...filteredTrials].sort((a, b) => {
    return getDaysLeft(a.endDate) - getDaysLeft(b.endDate);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
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
          {/* Cashtra Accounts Header */}
          <View style={styles.cashtraHeader}>
            <View style={styles.headerTitleCol}>
              <Text style={styles.headerTitle}>Trials</Text>
              <Text style={styles.headerSubtitle}>
                Manage free trials, charge dates, and subscriptions.
              </Text>
            </View>

            {/* Quick Actions (Search & Add) */}
            <View style={styles.headerActionsRow}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => setShowSearch(!showSearch)}
                activeOpacity={0.7}
              >
                <Text style={styles.headerIconText}>🔍</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerIconBtn, styles.headerAddBtn]}
                onPress={() => router.push('/trials/add')}
                activeOpacity={0.7}
              >
                <Text style={styles.headerAddIconText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar Input (toggleable) */}
          {showSearch ? (
            <View style={styles.searchBarWrapper}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search trial or payment method..."
                placeholderTextColor={Theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {/* Cashtra Total Balance Card */}
          <View style={styles.totalBalanceCard}>
            <View style={styles.totalBalanceIconWrapper}>
              <Text style={styles.totalBalanceIcon}>💳</Text>
            </View>
            <View style={styles.totalBalanceTextCol}>
              <Text style={styles.totalBalanceLabel}>Total Active Monthly</Text>
              <Text style={styles.totalBalanceAmount}>{formatCurrency(totalActivePrice)}</Text>
            </View>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>{activeTrials.length} Trials</Text>
            </View>
          </View>

          {/* Cashtra Filter Pills (All | Ending Soon | Cancelled | Kept) */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionLabel}>TRIALS FILTER</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {[
                { key: 'all', label: `All (${trials.length})` },
                { key: 'ending_soon', label: 'Ending soon' },
                { key: 'cancelled', label: 'Cancelled' },
                { key: 'kept', label: 'Kept' },
              ].map((tab) => {
                const isActive = filter === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                    onPress={() => setFilter(tab.key as FilterType)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isActive && styles.filterPillTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Cashtra Stacked Cards List */}
          <View style={styles.cardsList}>
            {sortedTrials.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🔎</Text>
                <Text style={styles.emptyTitle}>Walang trials dito</Text>
                <Text style={styles.emptySubtitle}>
                  {filter === 'cancelled'
                    ? 'Wala ka pang kinacancel na trials.'
                    : filter === 'ending_soon'
                    ? 'Walang active trials na matatapos sa susunod na 7 araw.'
                    : 'Mag-add ng free trial gamit ang "+" button sa ibaba.'}
                </Text>
              </View>
            ) : (
              sortedTrials.map((trial) => (
                <TrialCard
                  key={trial.id}
                  trial={trial}
                  onDelete={handleDelete}
                />
              ))
            )}
          </View>

          {/* Spacing for FAB */}
          <View style={{ height: 95 }} />
        </ScrollView>

        {/* Floating Add Button */}
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

  /* Cashtra Header */
  cashtraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerIconText: {
    fontSize: 15,
  },
  headerAddBtn: {
    backgroundColor: Theme.colors.primaryLight,
    borderColor: Theme.colors.primary,
  },
  headerAddIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
    lineHeight: 22,
  },

  /* Search Input */
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: Theme.colors.textPrimary,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  },

  /* Cashtra Total Balance Card */
  totalBalanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Theme.shadows.card,
    marginBottom: 16,
  },
  totalBalanceIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  totalBalanceIcon: {
    fontSize: 22,
  },
  totalBalanceTextCol: {
    flex: 1,
  },
  totalBalanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.4,
  },
  totalBalanceAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    marginTop: 2,
  },
  totalBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },

  /* Cashtra Filter Section */
  filterSection: {
    marginBottom: 14,
  },
  filterSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  /* Cards List */
  cardsList: {
    marginTop: 2,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: Theme.radius.lg,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
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
