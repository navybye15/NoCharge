// ============================================
// NoCharge Calendar Screen (Tab 3)
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trial, formatReadableDate } from '../../types/trial';
import { getTrials, subscribeToTrials } from '../../services/storage';
import { useAppTheme } from '../../context/ThemeContext';
import TrialCard from '../../components/TrialCard';

export default function CalendarScreen() {
  const { colors, isDark } = useAppTheme();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const loadData = async () => {
    const list = await getTrials();
    setTrials(list);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToTrials(loadData);
    return () => unsubscribe();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const trialsByDate = useMemo(() => {
    const map: Record<string, Trial[]> = {};
    trials.forEach((t) => {
      if (!map[t.endDate]) {
        map[t.endDate] = [];
      }
      map[t.endDate].push(t);
    });
    return map;
  }, [trials]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const daysGrid = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const selectedTrials = trialsByDate[selectedDateStr] || [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Navigation Card */}
        <View style={[styles.calendarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.monthHeader}>
            <TouchableOpacity
              onPress={prevMonth}
              style={[styles.navButton, { backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceSubtle, borderColor: colors.borderLight }]}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>{monthName}</Text>
              <TouchableOpacity
                onPress={() => {
                  const now = new Date();
                  setCurrentDate(now);
                  setSelectedDateStr(now.toISOString().split('T')[0]);
                }}
                style={[styles.todayBtn, { backgroundColor: colors.primaryLight }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.todayBtnText, { color: colors.primary }]}>Today</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={nextMonth}
              style={[styles.navButton, { backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceSubtle, borderColor: colors.borderLight }]}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <Text key={d} style={[styles.weekLabel, { color: colors.textMuted }]}>
                {d}
              </Text>
            ))}
          </View>

          {/* Calendar Day Grid */}
          <View style={styles.daysGrid}>
            {daysGrid.map((day, idx) => {
              if (day === null) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }

              const mStr = String(month + 1).padStart(2, '0');
              const dStr = String(day).padStart(2, '0');
              const cellDateStr = `${year}-${mStr}-${dStr}`;

              const isSelected = selectedDateStr === cellDateStr;
              const cellTrials = trialsByDate[cellDateStr] || [];
              const hasTrials = cellTrials.length > 0;

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[
                    styles.dayCell,
                    isSelected && [styles.dayCellSelected, { backgroundColor: colors.primary }],
                  ]}
                  onPress={() => setSelectedDateStr(cellDateStr)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      isSelected && styles.dayNumberSelected,
                    ]}
                  >
                    {day}
                  </Text>
                  {hasTrials ? (
                    <View style={styles.dotsRow}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: isSelected ? '#FFFFFF' : colors.urgent },
                        ]}
                      />
                    </View>
                  ) : (
                    <View style={{ height: 4 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Details */}
        <View style={styles.detailsHeader}>
          <Text style={[styles.detailsTitle, { color: colors.textPrimary }]}>
            Due on {formatReadableDate(selectedDateStr)}
          </Text>
          <View style={[styles.detailsBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.detailsBadgeText, { color: colors.primary }]}>{selectedTrials.length}</Text>
          </View>
        </View>

        {selectedTrials.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Walang trial na matatapos sa araw na ito.
            </Text>
          </View>
        ) : (
          selectedTrials.map((t) => <TrialCard key={t.id} trial={t} />)
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  calendarCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  todayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  dayCellSelected: {
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayNumberSelected: {
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  detailsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  detailsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
