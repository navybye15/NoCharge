// ============================================
// NoCharge Home Screen (DESIGN.md)
// ============================================
// Features:
// - Background gradient: --bg-gradient-start to --bg-gradient-end
// - Top Bar: Official Bell + Shield Logo, H1 title + small muted subtitle, glass bell button
// - Highlight Hero Card: LinearGradient (--hero-start #4EE08F to --hero-end #1DB86A) with
//   Display Number (40/48 Manrope 800), Progress Ring (10dp stroke), and Split Stats (Active vs Estimated Saved)
// - Horizontal Snap Carousel for "My Trials" (85% card width, peek effect, dots indicator, "View all" end card)
// - Week Schedule strip with deadline dots
// - Single entry point for add: Raised Center Button in TabBar (no floating button)

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from '../../components/LinearGradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Trial, formatCurrency, getDaysLeft } from '../../types/trial';
import { getTrials, deleteTrial, subscribeToTrials } from '../../services/storage';
import { useAppTheme } from '../../context/ThemeContext';
import TrialCard from '../../components/TrialCard';
import ProgressRing from '../../components/ProgressRing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.84);
const CAROUSEL_GAP = 12;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedDayIdx, setSelectedDayIdx] = useState(new Date().getDay());
  const carouselRef = useRef<ScrollView>(null);

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

  // Active & Cancelled trials
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

  // Active trials sorted by nearest deadline (max 8 for carousel)
  const activeSorted = useMemo(() => {
    return [...activeTrials]
      .sort((a, b) => getDaysLeft(a.endDate) - getDaysLeft(b.endDate))
      .slice(0, 8);
  }, [activeTrials]);

  const nearestDays = activeSorted.length > 0 ? getDaysLeft(activeSorted[0].endDate) : null;
  const nearestTrial = activeSorted.length > 0 ? activeSorted[0] : null;

  // Handle Carousel Scroll Snap Index
  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / (CAROUSEL_CARD_WIDTH + CAROUSEL_GAP));
    setCarouselIndex(index);
  };

  // Week Schedule
  const weekDays = useMemo(() => {
    const now = new Date();
    const currDay = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - currDay);

    const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const fullLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const isoStr = d.toISOString().split('T')[0];
      const hasTrialEnding = activeTrials.some((t) => t.endDate === isoStr);

      days.push({
        dayName: labels[i],
        fullDayName: fullLabels[i],
        dateNum: d.getDate(),
        isToday: i === currDay,
        hasTrialEnding,
        isoStr,
      });
    }
    return days;
  }, [activeTrials]);

  // Handle clicking a day in the week schedule
  const handleSelectDay = (idx: number) => {
    setSelectedDayIdx(idx);
    const day = weekDays[idx];
    if (day && day.hasTrialEnding) {
      const matchIdx = activeSorted.findIndex((t) => t.endDate === day.isoStr);
      if (matchIdx !== -1) {
        carouselRef.current?.scrollTo({
          x: matchIdx * (CAROUSEL_CARD_WIDTH + CAROUSEL_GAP),
          animated: true,
        });
        setCarouselIndex(matchIdx);
      }
    }
  };

  const topInset = Math.max(insets.top, StatusBar.currentHeight || 0, 16) + 12;

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.bg }]}>
      {/* Apple-grade Top Gradient Wash Header (Height 340dp) */}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Top Bar: Frosted Glass Capsule & Frosted Bell */}
          <View style={styles.topBar}>
            <View
              style={[
                styles.brandCapsule,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.72)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
            >
              <View style={[styles.logoSquircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                  accessibilityLabel="NoCharge logo"
                />
              </View>
              <View style={styles.brandTextCol}>
                <Text style={[styles.brandTitle, { color: colors.text }]}>NoCharge</Text>
                <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>
                  Trial Tracker
                </Text>
              </View>
            </View>

            {/* Frosted Glass Bell Button */}
            <TouchableOpacity
              style={[
                styles.glassPill,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.72)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
              onPress={() => router.push('/notification-result')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View notifications"
            >
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
              {endingIn7Days.length > 0 ? (
                <View style={[styles.notifDot, { backgroundColor: colors.accent }]} />
              ) : null}
            </TouchableOpacity>
          </View>

          {/* Highlight Hero Card with LinearGradient (Inspired by Image 5) */}
          <LinearGradient
            colors={[colors.heroStart, colors.heroEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.heroCard}
          >
            {/* Luminous Apple-Style Glowing Radial Aura (Image 5) */}
            <View style={styles.heroGlowHalo} pointerEvents="none" />

            <View style={styles.heroTopRow}>
              <View style={styles.heroTextCol}>
                <View style={styles.heroTagBadge}>
                  <Ionicons name="flash" size={12} color="#091B27" style={{ marginRight: 4 }} />
                  <Text style={styles.heroTagText}>
                    {nearestTrial ? 'NEXT DUE' : 'ALL SAFE'}
                  </Text>
                </View>
                <Text
                  style={styles.heroDisplayTitle}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {nearestTrial ? nearestTrial.serviceName : 'No Charges Due'}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {nearestTrial
                    ? `${formatCurrency(nearestTrial.priceAfterTrial)}/mo • Renews in ${getDaysLeft(nearestTrial.endDate)}d`
                    : 'Tap + below to add and track a new trial'}
                </Text>
              </View>

              {/* Progress Ring with 10dp stroke */}
              <View style={styles.ringWrapper}>
                <ProgressRing daysLeft={nearestDays} size={82} />
              </View>
            </View>

            {/* Split Stats: Active Count vs Monthly Risk (Section 10) */}
            <View style={styles.splitStatRow}>
              <View style={styles.splitBox}>
                <Text style={styles.splitLabel}>ACTIVE TRIALS</Text>
                <Text style={styles.splitValue} numberOfLines={1} adjustsFontSizeToFit>
                  {activeTrials.length} {activeTrials.length === 1 ? 'Trial' : 'Trials'}
                </Text>
              </View>
              <View style={styles.splitDivider} />
              <View style={styles.splitBox}>
                <Text style={styles.splitLabel}>TOTAL AT RISK</Text>
                <Text style={styles.splitValueRisk} numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(totalActiveMonthly)}
                  <Text style={styles.splitValueUnit}>/mo</Text>
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Home Trial Carousel: "My Trials" Section */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>My Trials</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                Ending soonest shown first
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/trials')} activeOpacity={0.7}>
              <Text style={[styles.viewAllLink, { color: isDark ? colors.primary : colors.primaryStrong }]}>
                View All ({activeTrials.length}) →
              </Text>
            </TouchableOpacity>
          </View>

          {activeSorted.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="shield-checkmark-outline" size={44} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Wala ka pang active trial</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                I-tap ang center '+' button sa ibaba para mag-record ng bagong free trial at mag-set ng reminders bago ang charge date.
              </Text>
            </View>
          ) : (
            <View>
              {/* Horizontal Snap Carousel */}
              <ScrollView
                ref={carouselRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CAROUSEL_CARD_WIDTH + CAROUSEL_GAP}
                decelerationRate="fast"
                contentContainerStyle={styles.carouselContainer}
                onScroll={onCarouselScroll}
                scrollEventThrottle={16}
              >
                {activeSorted.map((trial) => (
                  <View key={trial.id} style={{ width: CAROUSEL_CARD_WIDTH, marginRight: CAROUSEL_GAP }}>
                    <TrialCard
                      trial={trial}
                      cardWidth={CAROUSEL_CARD_WIDTH}
                      onDelete={handleDelete}
                    />
                  </View>
                ))}

                {/* Final "View All" Card */}
                <TouchableOpacity
                  style={[
                    styles.viewAllCard,
                    {
                      width: CAROUSEL_CARD_WIDTH * 0.75,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => router.push('/trials')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.viewAllIconCircle, { backgroundColor: colors.surface2 }]}>
                    <Ionicons
                      name="arrow-forward"
                      size={28}
                      color={isDark ? colors.primary : colors.primaryStrong}
                    />
                  </View>
                  <Text style={[styles.viewAllCardTitle, { color: colors.text }]}>View All Trials</Text>
                  <Text style={[styles.viewAllCardSub, { color: colors.textMuted }]}>
                    Manage all {trials.length} trials & subscriptions
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Page Indicator Dots below Carousel */}
              <View style={styles.dotsRow}>
                {activeSorted.map((_, idx) => (
                  <View
                    key={`dot-${idx}`}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          carouselIndex === idx
                            ? colors.primary
                            : isDark
                            ? 'rgba(255,255,255,0.2)'
                            : 'rgba(9,27,39,0.2)',
                        width: carouselIndex === idx ? 16 : 6,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Week Schedule Strip with Interactive Trial Selector */}
          <View style={[styles.weekStripCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.weekStripHeader}>
              <View>
                <Text style={[styles.weekStripTitle, { color: colors.text }]}>This Week's Schedule</Text>
                <Text style={[styles.weekStripSub, { color: colors.textMuted }]}>Tap a day to inspect ending trials</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/calendar')} activeOpacity={0.7}>
                <Text style={[styles.calendarLink, { color: isDark ? colors.primary : colors.primaryStrong }]}>
                  Calendar →
                </Text>
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
                          : colors.surface2,
                      },
                    ]}
                    onPress={() => handleSelectDay(idx)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayName,
                        { color: isSelected ? colors.onPrimary : colors.textMuted },
                      ]}
                    >
                      {item.dayName}
                    </Text>
                    <Text
                      style={[
                        styles.dayNumber,
                        { color: isSelected ? colors.onPrimary : colors.text },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {item.dateNum}
                    </Text>
                    {item.hasTrialEnding ? (
                      <View
                        style={[
                          styles.scheduleDot,
                          { backgroundColor: isSelected ? colors.onPrimary : colors.danger },
                        ]}
                      />
                    ) : (
                      <View style={{ height: 4 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Interactive Selected Day Breakdown */}
            {(() => {
              const selectedDay = weekDays[selectedDayIdx];
              if (!selectedDay) return null;
              const trialsOnDay = activeTrials.filter((t) => t.endDate === selectedDay.isoStr);

              if (trialsOnDay.length > 0) {
                return (
                  <View style={styles.selectedDayPanel}>
                    <View style={styles.selectedDayBadgeRow}>
                      <View style={[styles.dayAlertDot, { backgroundColor: colors.danger }]} />
                      <Text style={[styles.selectedDayLabel, { color: colors.text }]}>
                        {selectedDay.isToday ? 'Today' : `${selectedDay.fullDayName}, ${selectedDay.isoStr}`}:
                      </Text>
                    </View>
                    {trialsOnDay.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.selectedDayTrialRow,
                          { backgroundColor: colors.surface2, borderColor: colors.border },
                        ]}
                        onPress={() => router.push(`/trials/${t.id}`)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.selectedTrialLeft}>
                          <Text style={[styles.selectedTrialName, { color: colors.text }]}>{t.serviceName}</Text>
                          <Text style={[styles.selectedTrialSub, { color: colors.textMuted }]}>
                            {formatCurrency(t.priceAfterTrial)}/mo • {t.paymentLabel || 'Card'}
                          </Text>
                        </View>
                        <View style={[styles.manageBtn, { backgroundColor: colors.primary }]}>
                          <Text style={[styles.manageBtnText, { color: colors.onPrimary }]}>Manage →</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              }

              return (
                <View style={[styles.selectedDayEmpty, { backgroundColor: colors.surface2 }]}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.selectedDayEmptyText, { color: colors.textMuted }]}>
                    Walang trial na magcha-charge sa {selectedDay.fullDayName} (Ligtas)
                  </Text>
                </View>
              );
            })()}
          </View>

          {/* Bottom spacing for CustomTabBar + Raised Center Button (Section 5) */}
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
    height: 340,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 18,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
  },
  brandTextCol: {
    paddingRight: 4,
    justifyContent: 'center',
  },
  logoSquircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -0.1,
    includeFontPadding: false,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
    includeFontPadding: false,
  },
  glassPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#1DB86A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  heroGlowHalo: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FFE855',
    opacity: 0.28,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  heroTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(9, 27, 39, 0.14)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 8,
  },
  heroTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#091B27',
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: 0.6,
  },
  heroDisplayTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#091B27',
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#091B27',
    opacity: 0.88,
    fontFamily: 'Manrope_600SemiBold',
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 27, 39, 0.12)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  splitBox: {
    flex: 1,
    alignItems: 'center',
  },
  splitDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(9, 27, 39, 0.15)',
  },
  splitLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#091B27',
    opacity: 0.7,
    letterSpacing: 0.5,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 3,
  },
  splitValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#091B27',
    fontFamily: 'Manrope_800ExtraBold',
  },
  splitValueRisk: {
    fontSize: 16,
    fontWeight: '800',
    color: '#091B27',
    fontFamily: 'Manrope_800ExtraBold',
  },
  splitValueUnit: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  carouselContainer: {
    paddingRight: 16,
  },
  viewAllCard: {
    borderRadius: 20,
    borderWidth: 1,
    aspectRatio: 16 / 10,
    minHeight: 180,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  viewAllIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  viewAllCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    marginBottom: 4,
  },
  viewAllCardSub: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Manrope_400Regular',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginBottom: 18,
    marginTop: 2,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  weekStripCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  weekStripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekStripTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  weekStripSub: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },
  calendarLink: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayPill: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    marginBottom: 3,
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Manrope_800ExtraBold',
  },
  scheduleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  selectedDayPanel: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
    gap: 8,
  },
  selectedDayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayAlertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  selectedDayLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  selectedDayTrialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  selectedTrialLeft: {
    flex: 1,
    paddingRight: 8,
  },
  selectedTrialName: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    marginBottom: 2,
  },
  selectedTrialSub: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
  },
  manageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  selectedDayEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
  },
  selectedDayEmptyText: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Manrope_400Regular',
  },
});
