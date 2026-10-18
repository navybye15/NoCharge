// ============================================
// NoCharge Settings Screen (Tab 4)
// ============================================
// Features:
// - Notification permission status & button
// - Default reminder time (9:00 AM)
// - Currency info (PHP ₱)
// - Battery optimization guide for Xiaomi/Samsung/Oppo/Realme
// - Local storage data reset option & About info

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
import { Theme } from '../../constants/theme';

export default function SettingsScreen() {
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
      Alert.alert('Allowed! 🎉', 'Naka-enable na ang notifications para sa NoCharge.');
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
          title: '🔔 NoCharge: 5s Quick Test',
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
        'Offline Data Backup',
        `May ${JSON.parse(raw).length} trials na naka-store sa device storage mo.\n\nLahat ng data ay nananatili sa loob lamang ng iyong telepono.`,
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section: Notification Status */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS & ALERTS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Notification Permission</Text>
              <Text style={styles.rowSubtitle}>
                {permissionGranted === true
                  ? 'Active and Allowed ✅'
                  : permissionGranted === false
                  ? 'Denied ❌ (Tap to fix)'
                  : 'Checking...'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                permissionGranted ? styles.actionBtnAllowed : styles.actionBtnFix,
              ]}
              onPress={requestPermission}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  permissionGranted ? styles.actionBtnTextAllowed : styles.actionBtnTextFix,
                ]}
              >
                {permissionGranted ? 'Check' : 'Allow'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Default Reminder Time</Text>
              <Text style={styles.rowSubtitle}>Time of day notifications arrive</Text>
            </View>
            <Text style={styles.badgeValue}>9:00 AM</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Default Reminder Days</Text>
              <Text style={styles.rowSubtitle}>Days before charge date</Text>
            </View>
            <Text style={styles.badgeValue}>3, 1, 0 days</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.row, { paddingVertical: 4 }]}
            onPress={handleTestQuickReminder}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, { color: Theme.colors.primaryDark }]}>
                🔔 Test 5s Quick Alert
              </Text>
              <Text style={styles.rowSubtitle}>Schedules a test alarm in 5 seconds</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Theme.colors.primary }}>
              Trigger →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section: Battery Optimization Guide */}
        <Text style={styles.sectionHeader}>BATTERY OPTIMIZATION (IMPORTANT)</Text>
        <View style={styles.card}>
          <Text style={styles.batteryTitle}>⚠️ Bakit kailangan ito?</Text>
          <Text style={styles.batteryText}>
            Ang mga phone tulad ng <Text style={styles.bold}>Xiaomi / Redmi, Realme, Oppo, at Samsung</Text> ay madalas mag-kill ng background apps. Para siguradong mag-ring ang reminders:
          </Text>
          <View style={styles.stepBox}>
            <Text style={styles.stepText}>1. Pumunta sa Phone Settings → Apps → NoCharge</Text>
            <Text style={styles.stepText}>2. Piliin ang Battery Saver o Battery Usage</Text>
            <Text style={styles.stepText}>3. I-set sa "No restrictions" (Walang limitasyon)</Text>
            <Text style={styles.stepText}>4. I-enable ang "Autostart" (kung Xiaomi/Redmi)</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsLink}
            onPress={() => Linking.openSettings()}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsLinkText}>Open App Settings ↗</Text>
          </TouchableOpacity>
        </View>

        {/* Section: General Preferences */}
        <Text style={styles.sectionHeader}>PREFERENCES & DATA</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Currency</Text>
              <Text style={styles.rowSubtitle}>Default currency symbol</Text>
            </View>
            <Text style={styles.badgeValue}>PHP (₱)</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Data Storage</Text>
              <Text style={styles.rowSubtitle}>All data stays on this device only</Text>
            </View>
            <Text style={styles.badgeValue}>100% Offline</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.row, { paddingVertical: 4 }]}
            onPress={handleBackupData}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>📦 Backup Data Summary</Text>
              <Text style={styles.rowSubtitle}>Check local offline storage status</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: Theme.colors.primary }}>
              View →
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.row, { paddingVertical: 4 }]}
            onPress={handleResetData}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Text style={[styles.rowTitle, { color: '#EF4444' }]}>Reset Sample Data</Text>
              <Text style={styles.rowSubtitle}>Restore default sample trials</Text>
            </View>
            <Text style={{ fontSize: 16 }}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* About App */}
        <View style={styles.aboutBox}>
          <Text style={styles.aboutTitle}>NoCharge v1.0.0</Text>
          <Text style={styles.aboutDesc}>
            Never get charged by surprise. Track your free trials and cancel on time.
          </Text>
          <Text style={styles.aboutPrivacy}>
            Privacy: Walang account, walang server, walang cloud sync. Lahat ng data mo ay nasa loob lang ng phone mo.
          </Text>
        </View>

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
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadows.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowLeft: {
    flex: 1,
    paddingRight: Theme.spacing.md,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  badgeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Theme.radius.md,
  },
  actionBtnAllowed: {
    backgroundColor: '#F1F5F9',
  },
  actionBtnFix: {
    backgroundColor: '#FEE2E2',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnTextAllowed: {
    color: '#0F172A',
  },
  actionBtnTextFix: {
    color: '#DC2626',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.borderLight,
    marginVertical: Theme.spacing.sm,
  },
  batteryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
    marginBottom: 6,
  },
  batteryText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  stepBox: {
    backgroundColor: '#F8FAFC',
    padding: Theme.spacing.sm + 4,
    borderRadius: Theme.radius.md,
    gap: 4,
    marginBottom: 10,
  },
  stepText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
  },
  settingsLink: {
    alignSelf: 'flex-start',
  },
  settingsLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  aboutBox: {
    marginTop: Theme.spacing.xl,
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  aboutDesc: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  aboutPrivacy: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 15,
  },
});
