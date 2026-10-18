// ============================================
// NoCharge Settings Screen (Tab 4) — DESIGN.md
// ============================================
// Specs:
// - LinearGradient background from --bg-gradient-start to --bg-gradient-end
// - Manrope typography
// - Theme mode selection (System / Dark / Light) with --primary fill and --on-primary (#091B27) text
// - Cards with 20dp radius, --surface fill, --border border
// - Destructive reset with --danger text/outline
// - Bottom clearance 110dp for raised tab bar

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  SafeAreaView,
} from 'react-native';
import LinearGradient from '../../components/LinearGradient';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, ThemePreference } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const { colors, isDark, themePreference, setThemePreference } = useAppTheme();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted(status === 'granted');
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setPermissionGranted(true);
      Alert.alert('Allowed', 'Naka-enable na ang notifications para sa NoCharge.');
    } else {
      setPermissionGranted(false);
      Alert.alert(
        'Permission Denied',
        'Buksan ang Android App Settings para i-allow ang Notifications.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const handleTestQuickReminder = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'NoCharge Test Alert',
          body: 'Gumagana ang instant reminder! Lahat ng notifications ay active.',
          data: { screen: 'notification-test' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          channelId: 'trial-reminders',
        },
      });
      Alert.alert(
        'Scheduled!',
        'Mag-a-alarm ang test notification pagkalipas ng 5 segundo. Pwede mong i-lock ang screen para subukan.'
      );
    } catch (err) {
      Alert.alert('Error', 'Hindi ma-schedule ang notification. Paki-check ang permissions.');
    }
  };

  const handleBackupData = async () => {
    try {
      const raw = await AsyncStorage.getItem('@nocharge_trials_v1');
      if (!raw) {
        Alert.alert('Backup', 'Walang trials na naka-save.');
        return;
      }
      Alert.alert(
        'Offline Data Storage',
        `May ${JSON.parse(raw).length} trials na naka-store sa device storage mo.\n\n100% offline at walang lumalabas na data sa phone mo.`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', 'Nagkaproblema sa pagbasa ng storage.');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Trials',
      'Gusto mo bang i-clear ang storage at ibalik sa default sample trials?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Success', 'Na-reset na ang local data. I-restart o i-refresh ang app.');
          },
        },
      ]
    );
  };

  const themeOptions: { key: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' },
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
  ];

  return (
    <LinearGradient
      colors={[colors.bgGradientStart, colors.bgGradientEnd]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Preferences, alerts, and offline data storage.
            </Text>
          </View>

          {/* Section: Appearance / Theme */}
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>APPEARANCE & THEME</Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.themeHeaderRow}>
              <View
                style={[
                  styles.sectionIconSquircle,
                  { backgroundColor: isDark ? colors.surface2 : '#E8F8EE' },
                ]}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={20}
                  color={isDark ? colors.primary : colors.primaryStrong}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Theme Mode</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Default follows your phone's dark mode
                </Text>
              </View>
            </View>

            {/* Theme Selector Segmented Row */}
            <View
              style={[
                styles.themeSegmentWrapper,
                { backgroundColor: colors.surface2, borderColor: colors.border },
              ]}
            >
              {themeOptions.map((opt) => {
                const isSelected = themePreference === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.themeSegmentBtn,
                      isSelected && [styles.themeSegmentBtnActive, { backgroundColor: colors.primary }],
                    ]}
                    onPress={() => setThemePreference(opt.key)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={15}
                      color={isSelected ? colors.onPrimary : colors.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.themeSegmentText,
                        { color: isSelected ? colors.onPrimary : colors.textMuted },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section: Notification Status */}
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>NOTIFICATIONS & ALERTS</Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Notification Permission</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  {permissionGranted === true
                    ? 'Active and Allowed'
                    : permissionGranted === false
                    ? 'Denied (Tap to allow)'
                    : 'Checking...'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: permissionGranted
                      ? (isDark ? colors.surface2 : '#E8F8EE')
                      : 'rgba(217, 45, 32, 0.15)',
                  },
                ]}
                onPress={requestPermission}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    {
                      color: permissionGranted
                        ? (isDark ? colors.primary : colors.primaryStrong)
                        : colors.danger,
                    },
                  ]}
                >
                  {permissionGranted ? 'Allowed' : 'Allow'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Default Reminder Time</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Time of day notifications arrive
                </Text>
              </View>
              <View style={[styles.badgePill, { backgroundColor: colors.surface2 }]}>
                <Text style={[styles.badgeText, { color: colors.text }]}>9:00 AM</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Default Reminder Days</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Days before charge date
                </Text>
              </View>
              <View style={[styles.badgePill, { backgroundColor: colors.surface2 }]}>
                <Text style={[styles.badgeText, { color: colors.text }]}>3, 1, 0 days</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={[styles.row, { paddingVertical: 4 }]}
              onPress={handleTestQuickReminder}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Text
                  style={[
                    styles.rowTitle,
                    { color: isDark ? colors.primary : colors.primaryStrong },
                  ]}
                >
                  Test 5s Quick Alert
                </Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Schedules a test alarm in 5 seconds
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? colors.primary : colors.primaryStrong}
              />
            </TouchableOpacity>
          </View>

          {/* Section: Battery Optimization Guide */}
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
            BATTERY OPTIMIZATION (IMPORTANT)
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
              <Ionicons name="warning-outline" size={18} color={colors.accent} />
              <Text
                style={[
                  styles.batteryTitle,
                  { color: isDark ? colors.accent : colors.primaryStrong },
                ]}
              >
                Bakit kailangan ito?
              </Text>
            </View>
            <Text style={[styles.batteryText, { color: colors.textMuted }]}>
              Ang mga phone tulad ng{' '}
              <Text style={{ color: colors.text, fontWeight: '700' }}>
                Xiaomi / Redmi / POCO, Realme, Oppo, at Samsung
              </Text>{' '}
              ay madalas mag-kill ng background apps. Para siguradong mag-ring ang reminders:
            </Text>
            <View
              style={[
                styles.stepBox,
                { backgroundColor: colors.surface2, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.stepText, { color: colors.textMuted }]}>
                1. Pumunta sa Phone Settings → Apps → NoCharge
              </Text>
              <Text style={[styles.stepText, { color: colors.textMuted }]}>
                2. Piliin ang Battery Saver o Battery Usage
              </Text>
              <Text style={[styles.stepText, { color: colors.textMuted }]}>
                3. I-set sa "No restrictions" (Walang limitasyon)
              </Text>
              <Text style={[styles.stepText, { color: colors.textMuted }]}>
                4. I-enable ang "Autostart" (kung Xiaomi/Redmi/POCO)
              </Text>
            </View>
            <TouchableOpacity
              style={styles.settingsLink}
              onPress={() => Linking.openSettings()}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.settingsLinkText,
                  { color: isDark ? colors.primary : colors.primaryStrong },
                ]}
              >
                Open App Settings ↗
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section: Preferences & Data */}
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>PREFERENCES & DATA</Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Currency</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Default currency symbol
                </Text>
              </View>
              <View style={[styles.badgePill, { backgroundColor: colors.surface2 }]}>
                <Text style={[styles.badgeText, { color: colors.text }]}>PHP (₱)</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Data Privacy</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  All data stays offline on this phone
                </Text>
              </View>
              <View
                style={[
                  styles.badgePill,
                  { backgroundColor: isDark ? colors.surface2 : '#E8F8EE' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: isDark ? colors.primary : colors.primaryStrong },
                  ]}
                >
                  100% Offline
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={[styles.row, { paddingVertical: 4 }]}
              onPress={handleBackupData}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>Backup Summary</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Check local offline storage status
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? colors.primary : colors.primaryStrong}
              />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={[styles.row, { paddingVertical: 4 }]}
              onPress={handleResetData}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Text style={[styles.rowTitle, { color: colors.danger }]}>Clear All Local Data</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Reset storage to default state
                </Text>
              </View>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>

          {/* 110dp clearance for raised bottom tab bar */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  themeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sectionIconSquircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeSegmentWrapper: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  themeSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  themeSegmentBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  themeSegmentText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 10,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  batteryTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
  batteryText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 10,
  },
  stepBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
    marginBottom: 12,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
    lineHeight: 17,
  },
  settingsLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  settingsLinkText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
  },
});
