// ============================================
// NoCharge Trials List Screen (Tab 2)
// ============================================
// Features:
// - Stack of colorful rounded wallet-style cards
// - Filter segmented tabs: All / Ending soon / Cancelled
// - Sorted by nearest deadline
// - Long press to delete with confirmation
// - Quick status toggle (Active / Cancelled / Kept)
// - Floating + button

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Trial, getDaysLeft } from '../../types/trial';
import { getTrials, deleteTrial, updateTrial, subscribeToTrials } from '../../services/storage';
import { Theme } from '../../constants/theme';
import TrialCard from '../../components/TrialCard';
import FloatingAddButton from '../../components/FloatingAddButton';

type FilterType = 'all' | 'ending_soon' | 'cancelled';

export default function TrialsScreen() {
  const router = useRouter();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
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

  const handleCardPress = (trial: Trial) => {
    // Quick action sheet for Phase 2
    Alert.alert(
      trial.serviceName,
      `Status: ${trial.status.toUpperCase()}\nCharge Date: ${trial.endDate}\nPrice: ₱${trial.priceAfterTrial}\n${trial.notes ? `\nNotes: ${trial.notes}` : ''}`,
      [
        {
          text: trial.status === 'cancelled' ? 'Set as Active' : 'Mark as Cancelled',
          onPress: async () => {
            const nextStatus = trial.status === 'cancelled' ? 'active' : 'cancelled';
            await updateTrial({ ...trial, status: nextStatus });
            await loadData();
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(trial.id),
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  // Filter & sort logic
  const filteredTrials = trials.filter((t) => {
    if (filter === 'cancelled') {
      return t.status === 'cancelled';
    }
    if (filter === 'ending_soon') {
      const days = getDaysLeft(t.endDate);
      return t.status === 'active' && days >= 0 && days <= 7;
    }
    // 'all'
    return true;
  });

  // Sort by nearest deadline first
  const sortedTrials = [...filteredTrials].sort((a, b) => {
    return getDaysLeft(a.endDate) - getDaysLeft(b.endDate);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Filter Segmented Bar */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}
            >
              All ({trials.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filter === 'ending_soon' && styles.filterButtonActive]}
            onPress={() => setFilter('ending_soon')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'ending_soon' && styles.filterButtonTextActive,
              ]}
            >
              Ending soon
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filter === 'cancelled' && styles.filterButtonActive]}
            onPress={() => setFilter('cancelled')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'cancelled' && styles.filterButtonTextActive,
              ]}
            >
              Cancelled
            </Text>
          </TouchableOpacity>
        </View>

        {/* List of Trials */}
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
                onPress={() => handleCardPress(trial)}
                onDelete={handleDelete}
              />
            ))
          )}

          {/* Padding so FAB does not overlap bottom card */}
          <View style={{ height: 90 }} />
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Theme.radius.md,
  },
  filterButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
  },
  emptyContainer: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginTop: Theme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 44,
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
