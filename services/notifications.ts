// ============================================
// NoCharge Notifications Service
// ============================================
// Handles real reminder scheduling, wording adaptation,
// and cancellation for all trials.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Trial, formatCurrency } from '../types/trial';

export const REMINDER_CHANNEL_ID = 'trial-reminders';

/**
 * Ensures the Android high-importance notification channel is registered.
 */
export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Trial Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
      description: 'Alerts before your free trials end and get charged',
    });
  }
}

/**
 * Computes trigger Date object for a given ISO 'YYYY-MM-DD' and offsetDays,
 * scheduled at 9:00 AM local time.
 */
function getTriggerDate(endDateStr: string, offsetDays: number, hour: number = 9, minute: number = 0): Date {
  const parts = endDateStr.split('-').map(Number);
  const [year, month, day] = parts;
  // Create target date at local time
  const target = new Date(year, month - 1, day, hour, minute, 0, 0);
  // Subtract offset days
  target.setDate(target.getDate() - offsetDays);
  return target;
}

/**
 * Schedules real reminders for an active trial.
 * Returns array of scheduled notification IDs.
 */
export async function scheduleTrialReminders(trial: Trial): Promise<string[]> {
  // If status is not active, do not schedule any reminder
  if (trial.status !== 'active') {
    return [];
  }

  // Ensure notification permission
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: requestedStatus } = await Notifications.requestPermissionsAsync();
    if (requestedStatus !== 'granted') {
      console.warn('Notification permission not granted. Skipping scheduling.');
      return [];
    }
  }

  await ensureNotificationChannel();

  const now = new Date();
  const scheduledIds: string[] = [];
  const offsets = trial.reminderOffsetsDays || [3, 1, 0];

  for (const offset of offsets) {
    const triggerDate = getTriggerDate(trial.endDate, offset, 9, 0);

    // Rule: Never schedule reminders in the past. Skip them.
    if (triggerDate.getTime() <= now.getTime()) {
      continue;
    }

    // Adapt wording according to offset
    let title = `🔔 ${trial.serviceName} Trial Ending`;
    let body = '';
    const formattedPrice = formatCurrency(trial.priceAfterTrial);

    if (offset === 0) {
      title = `🚨 Charge Today: ${trial.serviceName}`;
      body = `NoCharge: ${trial.serviceName} trial ends today! Cancel now to avoid ${formattedPrice} charge.`;
    } else if (offset === 1) {
      title = `⚠️ Charge Tomorrow: ${trial.serviceName}`;
      body = `NoCharge: ${trial.serviceName} trial ends tomorrow. ${formattedPrice} will be charged.`;
    } else {
      title = `🔔 Reminder: ${trial.serviceName}`;
      body = `NoCharge: ${trial.serviceName} trial ends in ${offset} days. ${formattedPrice} will be charged.`;
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            screen: 'trial-detail',
            trialId: trial.id,
          },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: REMINDER_CHANNEL_ID,
        },
      });

      scheduledIds.push(id);
    } catch (err) {
      console.warn(`Failed to schedule reminder for offset ${offset}d:`, err);
    }
  }

  return scheduledIds;
}

/**
 * Cancels all scheduled notifications given their IDs.
 */
export async function cancelTrialReminders(notificationIds?: string[]): Promise<void> {
  if (!notificationIds || notificationIds.length === 0) return;

  for (const id of notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (err) {
      console.warn(`Failed to cancel notification ${id}:`, err);
    }
  }
}
