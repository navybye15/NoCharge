// ============================================
// NoCharge Trials Screen (Tab 2) — DESIGN.md
// ============================================
// Specs:
// - LinearGradient background from --bg-gradient-start to --bg-gradient-end
// - H1 title with muted subtitle
// - Filter tabs: All, Ending soon, Cancelled (40dp height, fully rounded pill,
//   filled with --primary when active with --on-primary (#091B27) text)
// - Full-width vertical list of the SAME TrialCard
// - No floating action button (+ button is exclusively in center tab bar)
// - Bottom padding 110dp to clear the raised center button

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from '../../components/LinearGradient';
import { Ionicons } from '@expo/vector-icons';
import { Trial, getDaysLeft, formatCurrency } from '../../types/trial';
import { getTrials, deleteTrial, subscribeToTrials } from '../../services/storage';
import { useAppTheme } from '../../context/ThemeContext';
import TrialCard from '../../components/TrialCard';

type FilterType = 'all' | 'ending_soon' | 'cancelled';

export default function TrialsScreen() {
  const insets = useSafeAreaInsets();
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
    if (filter === 'ending_soon') {
      const days = getDaysLeft(t.endDate);
      return t.status === 'active' && days >= 0 && days <= 7;
    }
    return true;
  });

  const sortedTrials = [...filteredTrials].sort((a, b) => {
    return getDaysLeft(a.endDate) - getDaysLeft(b.endDate);
  });

  const topInset = Math.max(insets.top, StatusBar.currentHeight || 0, 16) + 12;

  return (
    <LinearGradient
      colors={[colors.bgGradientStart, colors.bgGradientEnd]}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: topInset }]}>
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
          <View style={styles.header}>
            <View style={styles.headerTitleCol}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Trials</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                Track charge dates and cancel on time.
              </Text>
            </View>

              <TouchableOpacity
                style={[
                  styles.searchToggleBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowSearch(!showSearch)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Toggle search"
              >
                <Ionicons name="search-outline" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Bar Input */}
            {showSearch ? (
              <View
                style={[
                  styles.searchBarWrapper,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={16}
                  color={colors.textMuted}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
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

            {/* Active Plans Summary Card */}
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.summaryIconWrapper,
                  { backgroundColor: isDark ? colors.surface2 : '#E8F8EE' },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color={isDark ? colors.primary : colors.primaryStrong}
                />
              </View>
              <View style={styles.summaryTextCol}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                  ESTIMATED ACTIVE CHARGE
                </Text>
                <Text style={[styles.summaryAmount, { color: colors.text }]}>
                  {formatCurrency(totalActivePrice)}
                </Text>
              </View>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: isDark ? colors.surface2 : '#E8F8EE' },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    { color: isDark ? colors.primary : colors.primaryStrong },
                  ]}
                >
                  {activeTrials.length} active
                </Text>
              </View>
            </View>

            {/* Filter Tabs (40dp height, fully rounded, primary fill with on-primary text) */}
            <View style={styles.filterSection}>
              <View style={styles.filterTabsRow}>
                {[
                  { key: 'all', label: `All (${trials.length})` },
                  { key: 'ending_soon', label: 'Ending soon' },
                  { key: 'cancelled', label: 'Cancelled' },
                ].map((tab) => {
                  const isActive = filter === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: isActive ? colors.primary : colors.surface,
                          borderColor: isActive ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setFilter(tab.key as FilterType)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          { color: isActive ? colors.onPrimary : colors.textMuted },
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Vertical List of Trial Cards */}
            {sortedTrials.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Ionicons name="folder-open-outline" size={40} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No trials found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                  {searchQuery
                    ? 'Subukan ang ibang search keyword.'
                    : 'Wala pang trials sa filter na ito. Tap + sa baba para mag-add.'}
                </Text>
              </View>
            ) : (
              sortedTrials.map((trial) => (
                <TrialCard key={trial.id} trial={trial} onDelete={handleDelete} />
              ))
            )}

            {/* Bottom spacer to clear the 64dp tab bar + 24dp raised button overhang */}
            <View style={{ height: 110 }} />
          </ScrollView>
        </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },
  searchToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    height: 52,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
  },
  clearBtn: {
    padding: 6,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  summaryIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -0.4,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
