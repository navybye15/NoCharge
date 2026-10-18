// ============================================
// NoCharge Settings Screen (Tab 4)
// ============================================
// Features:
// - Theme mode selection: System (Default) | Dark | Light
// - Notification permission status & check
// - Default reminder preferences
// - Battery optimization guidance for Android manufacturers
// - Local data backup check & storage reset

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section: Appearance / Theme */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>APPEARANCE & THEME</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.themeHeaderRow}>
            <View style={[styles.sectionIconSquircle, { backgroundColor: colors.iconContainer, borderColor: colors.borderLight }]}>
              <Ionicons name="color-palette-outline" size={20} color={colors.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Theme Mode</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                Default follows your phone's dark mode
              </Text>
            </View>
          </View>

          {/* Theme Selector Segmented Row */}
          <View style={[styles.themeSegmentWrapper, { backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceSubtle, borderColor: colors.borderLight }]}>
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
                >
                  <Ionicons
                    name={opt.icon}
                    size={15}
                    color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.themeSegmentText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary },
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
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Notification Permission</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
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
                  backgroundColor: permissionGranted ? colors.primaryLight : colors.urgentBg,
                },
              ]}
              onPress={requestPermission}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  { color: permissionGranted ? colors.primary : colors.urgent },
                ]}
              >
                {permissionGranted ? 'Allowed' : 'Allow'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Default Reminder Time</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Time of day notifications arrive</Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceSubtle }]}>
              <Text style={[styles.badgeText, { color: colors.textPrimary }]}>9:00 AM</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Default Reminder Days</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Days before charge date</Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceSubtle }]}>
              <Text style={[styles.badgeText, { color: colors.textPrimary }]}>3, 1, 0 days</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <TouchableOpacity
            style={[styles.row, { paddingVertical: 4 }]}
            onPress={handleTestQuickReminder}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, { color: colors.primary }]}>
                Test 5s Quick Alert
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Schedules a test alarm in 5 seconds</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Section: Battery Optimization Guide */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>BATTERY OPTIMIZATION (IMPORTANT)</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
            <Ionicons name="warning-outline" size={18} color={colors.warning} />
            <Text style={[styles.batteryTitle, { color: colors.warning }]}>Bakit kailangan ito?</Text>
          </View>
          <Text style={[styles.batteryText, { color: colors.textSecondary }]}>
            Ang mga phone tulad ng <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Xiaomi / Redmi, Realme, Oppo, at Samsung</Text> ay madalas mag-kill ng background apps. Para siguradong mag-ring ang reminders:
          </Text>
          <View style={[styles.stepBox, { backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceSubtle, borderColor: colors.borderLight }]}>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>1. Pumunta sa Phone Settings → Apps → NoCharge</Text>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>2. Piliin ang Battery Saver o Battery Usage</Text>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>3. I-set sa "No restrictions" (Walang limitasyon)</Text>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>4. I-enable ang "Autostart" (kung Xiaomi/Redmi)</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsLink}
            onPress={() => Linking.openSettings()}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingsLinkText, { color: colors.primary }]}>Open App Settings ↗</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Preferences & Data */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>PREFERENCES & DATA</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Currency</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Default currency symbol</Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceSubtle }]}>
              <Text style={[styles.badgeText, { color: colors.textPrimary }]}>PHP (₱)</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Data Privacy</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>All data stays offline on this phone</Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>100% Offline</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <TouchableOpacity
            style={[styles.row, { paddingVertical: 4 }]}
            onPress={handleBackupData}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Backup Summary</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Check local offline storage status</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <TouchableOpacity
            style={[styles.row, { paddingVertical: 4 }]}
            onPress={handleResetData}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, { color: colors.urgent }]}>Clear All Local Data</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>Reset storage to default state</Text>
            </View>
            <Ionicons name="trash-outline" size={18} color={colors.urgent} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
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
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 18,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeSegmentWrapper: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  themeSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
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
    fontWeight: '700',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 12,
    fontWeight: '500',
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
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  batteryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  batteryText: {
    fontSize: 13,
    lineHeight: 18,
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
    lineHeight: 17,
  },
  settingsLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  settingsLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
