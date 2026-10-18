// ============================================
// NoCharge Cashtra Accounts-Style Trials Screen
// ============================================

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
import { Ionicons } from '@expo/vector-icons';
import { Trial, getDaysLeft, formatCurrency } from '../../types/trial';
import { getTrials, deleteTrial, subscribeToTrials } from '../../services/storage';
import { useAppTheme } from '../../context/ThemeContext';
import TrialCard from '../../components/TrialCard';
import FloatingAddButton from '../../components/FloatingAddButton';

type FilterType = 'all' | 'ending_soon' | 'cancelled' | 'kept';

export default function TrialsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
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
    return true;
  });

  const sortedTrials = [...filteredTrials].sort((a, b) => {
    return getDaysLeft(a.endDate) - getDaysLeft(b.endDate);
  });

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
          {/* Header Row */}
          <View style={styles.cashtraHeader}>
            <View style={styles.headerTitleCol}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Trials</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Track charge dates and cancel on time.
              </Text>
            </View>

            <View style={styles.headerActionsRow}>
              <TouchableOpacity
                style={[styles.headerIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setShowSearch(!showSearch)}
                activeOpacity={0.7}
              >
                <Ionicons name="search-outline" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerIconBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => router.push('/trials/add')}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar Input */}
          {showSearch ? (
            <View style={[styles.searchBarWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search trial or payment card..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {/* Cashtra Total Balance Card */}
          <View style={[styles.totalBalanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.totalBalanceIconWrapper, { backgroundColor: colors.iconContainer, borderColor: colors.borderLight }]}>
              <Ionicons name="card-outline" size={22} color={colors.iconColor} />
            </View>
            <View style={styles.totalBalanceTextCol}>
              <Text style={[styles.totalBalanceLabel, { color: colors.textSecondary }]}>Active Plans Total</Text>
              <Text style={[styles.totalBalanceAmount, { color: colors.textPrimary }]}>{formatCurrency(totalActivePrice)}</Text>
            </View>
            <View style={[styles.totalBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.totalBadgeText, { color: colors.primary }]}>{activeTrials.length} active</Text>
            </View>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionLabel, { color: colors.textMuted }]}>FILTER</Text>
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
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: isActive
                          ? colors.primary
                          : isDark
                          ? colors.surfaceElevated
                          : colors.surface,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setFilter(tab.key as FilterType)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: isActive ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Cards List */}
          {sortedTrials.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="filter-outline" size={38} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No trials found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {searchQuery ? 'Subukan ang ibang search query.' : 'Walang trial sa napiling filter.'}
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
    paddingTop: 14,
  },
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
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  totalBalanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  totalBalanceIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  totalBalanceTextCol: {
    flex: 1,
  },
  totalBalanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  totalBalanceAmount: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  totalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  filterScroll: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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
  },
});
