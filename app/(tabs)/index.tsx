import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import * as Notifications from 'expo-notifications';

// ============================================
// PHASE 1: Notification Proof of Concept
// ============================================
// Ang screen na ito ay para i-test kung gumagana ang notifications.
// May isang button na mag-sschedule ng notification 1 minute later.
// Kapag nag-tap ka sa notification, dapat mag-open yung "notification-result" screen.

export default function NotificationTestScreen() {
  const [scheduledCount, setScheduledCount] = useState(0);
  const [lastScheduled, setLastScheduled] = useState<string | null>(null);

  // Ito ang main function: mag-schedule ng notification na mag-fire after 60 seconds.
  const scheduleTestNotification = async () => {
    try {
      // Check muna kung may permission
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        // Kung wala, humingi ulit
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Kailangan mo i-allow ang notifications sa Settings para gumana ang NoCharge reminders.'
          );
          return;
        }
      }

      // Schedule the notification — 60 seconds from now
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 NoCharge Test Reminder',
          body: 'Ito ang test notification! Tap mo ito para ma-verify na gumagana ang navigation.',
          data: { screen: 'notification-test', testId: Date.now() },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 60,
          channelId: 'trial-reminders',
        },
      });

      const count = scheduledCount + 1;
      setScheduledCount(count);
      const timeStr = new Date().toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastScheduled(timeStr);

      Alert.alert(
        '✅ Scheduled!',
        `Notification #${count} will arrive in 60 seconds.\n\nTime now: ${timeStr}\n\nYou can close the app completely — the notification should still arrive!\n\nNotification ID: ${notifId}`
      );
    } catch (error: any) {
      Alert.alert('Error', `May error sa scheduling: ${error.message}`);
      console.error('Notification scheduling error:', error);
    }
  };

  // Cancel all pending notifications (for cleanup)
  const cancelAll = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    setScheduledCount(0);
    setLastScheduled(null);
    Alert.alert('🗑️ Cleared', 'All scheduled notifications cancelled.');
  };

  // Check how many notifications are currently scheduled
  const checkPending = async () => {
    const pending =
      await Notifications.getAllScheduledNotificationsAsync();
    Alert.alert(
      '📋 Pending Notifications',
      `May ${pending.length} na scheduled notification(s) ngayon.\n\n${pending.map((n, i) => `${i + 1}. ${n.content.title}`).join('\n')}`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>NoCharge</Text>
        <Text style={styles.subtitle}>Phase 1: Notification Test</Text>
      </View>

      {/* Instructions Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📱 Paano i-test:</Text>
        <Text style={styles.instruction}>
          1. Tap the green button below
        </Text>
        <Text style={styles.instruction}>
          2. Wait 60 seconds (pwede mo i-close ang app!)
        </Text>
        <Text style={styles.instruction}>
          3. Kapag dumating ang notification, tap it
        </Text>
        <Text style={styles.instruction}>
          4. Dapat mag-open ang "Notification Clicked!" screen
        </Text>
      </View>

      {/* Schedule Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={scheduleTestNotification}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          🔔 Schedule Notification (60s)
        </Text>
      </TouchableOpacity>

      {/* Status */}
      {lastScheduled && (
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>
            ✅ Last scheduled: {lastScheduled}
          </Text>
          <Text style={styles.statusText}>
            Total scheduled: {scheduledCount}
          </Text>
        </View>
      )}

      {/* Secondary Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={checkPending}
        >
          <Text style={styles.secondaryButtonText}>📋 Check Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, styles.dangerButton]}
          onPress={cancelAll}
        >
          <Text style={styles.secondaryButtonText}>🗑️ Cancel All</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>⚠️ Important Notes:</Text>
        <Text style={styles.infoText}>
          • Kung Xiaomi, Oppo, Realme, or Samsung ka — check mo na hindi
          naka-restrict ang NoCharge sa battery optimization.
        </Text>
        <Text style={styles.infoText}>
          • Android 13+ will ask for notification permission — tap "Allow".
        </Text>
        <Text style={styles.infoText}>
          • This is a development build test. Expo Go does NOT support
          reliable local notifications.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B5E20',
  },
  subtitle: {
    fontSize: 16,
    color: '#66BB6A',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  statusCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
  },
  dangerButton: {
    borderColor: '#FFCDD2',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F57F17',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 20,
    marginBottom: 6,
  },
});
