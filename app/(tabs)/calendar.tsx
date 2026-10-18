// ============================================
// NoCharge Calendar Screen (Tab 3) — DESIGN.md
// ============================================
// Specs:
// - LinearGradient background from --bg-gradient-start to --bg-gradient-end
// - Manrope typography
// - Days with expiring trials have small dot indicators using the service's color
// - Selected date is highlighted in --accent (#FFEB1A) with --on-accent (#091B27) text
// - Selected date trials list uses TrialCard
// - Bottom padding 110dp to clear the 64dp tab bar + 24dp button overhang

import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from '../../components/LinearGradient';
import { Ionicons } from '@expo/vector-icons';
import { Trial, formatReadableDate } from '../../types/trial';
import { getTrials, subscribeToTrials } from '../../services/storage';
import { useAppTheme } from '../../context/ThemeContext';
import { getServiceColor } from '../../constants/theme';
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

  const insets = useSafeAreaInsets();
  const selectedTrials = trialsByDate[selectedDateStr] || [];
  const topInset = Math.max(insets.top, StatusBar.currentHeight || 0, 16) + 12;

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.bg }]}>
      <LinearGradient
        colors={[colors.bgGradientStart, colors.bg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topBackdropGradient}
      />
      <View style={[styles.container, { paddingTop: topInset }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Calendar</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Plan ahead and spot upcoming charge dates.
            </Text>
          </View>

          {/* Month Navigation Card */}
          <View
            style={[
              styles.calendarCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.monthHeader}>
              <TouchableOpacity
                onPress={prevMonth}
                style={[
                  styles.navButton,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
              >
                <Ionicons name="chevron-back" size={18} color={colors.text} />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.monthTitle, { color: colors.text }]}>{monthName}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const now = new Date();
                    setCurrentDate(now);
                    setSelectedDateStr(now.toISOString().split('T')[0]);
                  }}
                  style={[
                    styles.todayBtn,
                    { backgroundColor: isDark ? colors.surface2 : '#E8F8EE' },
                  ]}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Jump to today"
                >
                  <Text
                    style={[
                      styles.todayBtnText,
                      { color: isDark ? colors.primary : colors.primaryStrong },
                    ]}
                  >
                    Today
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={nextMonth}
                style={[
                  styles.navButton,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Next month"
              >
                <Ionicons name="chevron-forward" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Weekday Labels (7 columns, 14.2857% each) */}
            <View style={styles.weekRow}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <Text key={d} style={[styles.weekLabel, { color: colors.textMuted }]}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Calendar Day Grid (7 columns, 14.2857% each) */}
            <View style={styles.daysGrid}>
              {daysGrid.map((day, idx) => {
                if (day === null) {
                  return <View key={`empty-${idx}`} style={styles.dayCellWrapper} />;
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
                    style={styles.dayCellWrapper}
                    onPress={() => setSelectedDateStr(cellDateStr)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${monthName} ${day}${
                      hasTrials ? `, ${cellTrials.length} trials due` : ''
                    }`}
                  >
                    <View
                      style={[
                        styles.dayInner,
                        isSelected && [styles.dayInnerSelected, { backgroundColor: colors.accent }],
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          { color: isSelected ? colors.onAccent : colors.text },
                          isSelected && styles.dayNumberSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                    {hasTrials ? (
                      <View style={styles.dotsRow}>
                        {cellTrials.slice(0, 3).map((t, dotIdx) => (
                          <View
                            key={dotIdx}
                            style={[
                              styles.dot,
                              {
                                backgroundColor: isSelected
                                  ? colors.accent
                                  : t.color || getServiceColor(t.serviceName),
                              },
                            ]}
                          />
                        ))}
                      </View>
                    ) : (
                      <View style={{ height: 5 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected Date Details */}
          <View style={styles.detailsHeader}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              Due on {formatReadableDate(selectedDateStr)}
            </Text>
            <View
              style={[
                styles.detailsBadge,
                { backgroundColor: isDark ? colors.surface2 : '#E8F8EE' },
              ]}
            >
              <Text
                style={[
                  styles.detailsBadgeText,
                  { color: isDark ? colors.primary : colors.primaryStrong },
                ]}
              >
                {selectedTrials.length} {selectedTrials.length === 1 ? 'trial' : 'trials'}
              </Text>
            </View>
          </View>

          {selectedTrials.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons name="calendar-outline" size={36} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Walang trial na matatapos sa araw na ito.
              </Text>
            </View>
          ) : (
            selectedTrials.map((t) => <TrialCard key={t.id} trial={t} />)
          )}

          {/* 110dp clearance for raised bottom tab bar */}
          {/* 110dp clearance for raised bottom tab bar */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
  },
  topBackdropGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    marginBottom: 16,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.2,
  },
  todayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  todayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekLabel: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCellWrapper: {
    width: '14.2857%',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayInner: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInnerSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
  },
  dayNumberSelected: {
    fontWeight: '800',
    fontFamily: 'Manrope_800ExtraBold',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    height: 5,
    alignItems: 'center',
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
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  detailsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  detailsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
  },
});
