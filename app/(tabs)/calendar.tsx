// ============================================
// NoCharge Calendar Screen (Tab 3)
// ============================================
// Features:
// - Monthly interactive calendar
// - Dot markers on days with ending free trials
// - Day selection to inspect trials ending on that specific date

import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Trial, formatReadableDate } from '../../types/trial';
import { getTrials, subscribeToTrials } from '../../services/storage';
import { Theme } from '../../constants/theme';
import TrialCard from '../../components/TrialCard';

export default function CalendarScreen() {
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

  // Mapping of date string 'YYYY-MM-DD' -> trials ending on that date
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

  // Calendar grid calculation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

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

  // Selected date trials
  const selectedTrials = trialsByDate[selectedDateStr] || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Navigation */}
        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.navButton} activeOpacity={0.7}>
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.monthTitle}>{monthName}</Text>
              <TouchableOpacity
                onPress={() => {
                  const now = new Date();
                  setCurrentDate(now);
                  setSelectedDateStr(now.toISOString().split('T')[0]);
                }}
                style={styles.todayBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.todayBtnText}>Today</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={nextMonth} style={styles.navButton} activeOpacity={0.7}>
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <Text key={d} style={styles.weekLabel}>
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
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  onPress={() => setSelectedDateStr(cellDateStr)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                    {day}
                  </Text>
                  {hasTrials ? (
                    <View style={styles.dotsRow}>
                      {cellTrials.slice(0, 3).map((t, dotIdx) => (
                        <View
                          key={dotIdx}
                          style={[
                            styles.dot,
                            { backgroundColor: isSelected ? '#FFFFFF' : t.color || Theme.colors.primary },
                          ]}
                        />
                      ))}
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Details */}
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>
            Trials ending on {formatReadableDate(selectedDateStr)}
          </Text>
          <Text style={styles.detailsBadge}>{selectedTrials.length}</Text>
        </View>

        {selectedTrials.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Walang trial na matatapos sa araw na ito.</Text>
          </View>
        ) : (
          selectedTrials.map((trial) => (
            <TrialCard key={trial.id} trial={trial} />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
  calendarCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.card,
    marginBottom: Theme.spacing.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  todayBtn: {
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
  },
  todayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    lineHeight: 24,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textMuted,
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Theme.spacing.sm,
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: Theme.colors.primary,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 4,
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  detailsBadge: {
    backgroundColor: Theme.colors.primaryLight,
    color: Theme.colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.radius.full,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
});
