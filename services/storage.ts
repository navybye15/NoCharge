// ============================================
// NoCharge Local Storage Module (AsyncStorage)
// ============================================
// All storage operations are centralized here.
// If we switch to expo-sqlite or another engine later,
// only this file needs to be updated.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trial } from '../types/trial';
import { Theme } from '../constants/theme';
import {
  scheduleTrialReminders,
  cancelTrialReminders,
  rescheduleAllActiveReminders,
} from './notifications';

const STORAGE_KEY = '@nocharge_trials_v1';

// In-memory subscribers for instant UI synchronization across tabs
type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export function subscribeToTrials(callback: StorageListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifySubscribers() {
  listeners.forEach((callback) => {
    try {
      callback();
    } catch (err) {
      console.warn('Error in storage subscriber:', err);
    }
  });
}

/**
 * Returns helper to pick a color from the mint-friendly palette
 */
export function getPaletteColor(index: number = 0): string {
  const palette = Theme.colors.palette;
  return palette[index % palette.length];
}

/**
 * Sample initial trials so the user has immediate visual cards and
 * ending soon data to inspect upon launching Phase 2.
 */
function createSampleTrials(): Trial[] {
  const now = new Date();
  
  // Trial 1: Spotify Premium (Ends in 2 days)
  const d1 = new Date(now);
  d1.setDate(now.getDate() + 2);
  const end1 = d1.toISOString().split('T')[0];

  // Trial 2: Netflix Standard (Ends in 6 days)
  const d2 = new Date(now);
  d2.setDate(now.getDate() + 6);
  const end2 = d2.toISOString().split('T')[0];

  // Trial 3: YouTube Premium (Ends in 24 days)
  const d3 = new Date(now);
  d3.setDate(now.getDate() + 24);
  const end3 = d3.toISOString().split('T')[0];

  // Trial 4: Adobe Lightroom (Cancelled trial - estimated saved)
  const d4 = new Date(now);
  d4.setDate(now.getDate() - 5);
  const end4 = d4.toISOString().split('T')[0];

  return [
    {
      id: 'trial_seed_1',
      serviceName: 'Spotify Premium',
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28).toISOString().split('T')[0],
      endDate: end1,
      priceAfterTrial: 149,
      billingCycle: 'monthly',
      cancelLink: 'https://www.spotify.com/ph/account/overview/',
      paymentLabel: 'GCash',
      notes: 'Remember to cancel before renewal! Switched to Student plan soon.',
      reminderOffsetsDays: [3, 1, 0],
      status: 'active',
      color: Theme.colors.palette[0], // Emerald
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
    },
    {
      id: 'trial_seed_2',
      serviceName: 'Netflix Standard',
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 24).toISOString().split('T')[0],
      endDate: end2,
      priceAfterTrial: 549,
      billingCycle: 'monthly',
      cancelLink: 'https://www.netflix.com/youraccount',
      paymentLabel: 'BPI Card',
      notes: 'Free trial promo from credit card reward.',
      reminderOffsetsDays: [3, 1, 0],
      status: 'active',
      color: Theme.colors.palette[3], // Pink/Red
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 24,
    },
    {
      id: 'trial_seed_3',
      serviceName: 'YouTube Premium',
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString().split('T')[0],
      endDate: end3,
      priceAfterTrial: 159,
      billingCycle: 'monthly',
      cancelLink: 'https://www.youtube.com/paid_memberships',
      paymentLabel: 'Maya',
      notes: '30-day student trial promo.',
      reminderOffsetsDays: [7, 3, 1, 0],
      status: 'active',
      color: Theme.colors.palette[2], // Indigo
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
    },
    {
      id: 'trial_seed_4',
      serviceName: 'Canva Pro',
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 35).toISOString().split('T')[0],
      endDate: end4,
      priceAfterTrial: 299,
      billingCycle: 'monthly',
      cancelLink: 'https://www.canva.com/settings/billing-and-teams',
      paymentLabel: 'GCash',
      notes: 'Na-cancel ko na ito noong nakaraang linggo!',
      reminderOffsetsDays: [3, 1, 0],
      status: 'cancelled',
      color: Theme.colors.palette[1], // Cyan
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
    },
  ];
}

/**
 * Fetch all trials from storage. Seeds sample trials on first run.
 */
export async function getTrials(): Promise<Trial[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createSampleTrials();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed: Trial[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load trials from AsyncStorage:', error);
    return [];
  }
}

/**
 * Save a newly created trial
 */
export async function saveTrial(
  trialData: Omit<Trial, 'id' | 'createdAt'> & { id?: string }
): Promise<Trial> {
  const current = await getTrials();
  const newTrial: Trial = {
    ...trialData,
    id: trialData.id || `trial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
  };

  // Schedule real reminders if active
  if (newTrial.status === 'active') {
    const notifIds = await scheduleTrialReminders(newTrial);
    newTrial.notificationIds = notifIds;
  }

  const updated = [newTrial, ...current];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifySubscribers();
  return newTrial;
}

/**
 * Update an existing trial
 */
export async function updateTrial(updatedTrial: Trial): Promise<void> {
  const current = await getTrials();
  const index = current.findIndex((t) => t.id === updatedTrial.id);
  if (index === -1) {
    throw new Error(`Trial with id ${updatedTrial.id} not found.`);
  }

  // Cancel old scheduled notifications to avoid duplicates or orphans
  const oldTrial = current[index];
  if (oldTrial.notificationIds && oldTrial.notificationIds.length > 0) {
    await cancelTrialReminders(oldTrial.notificationIds);
  }

  // Reschedule if still active
  if (updatedTrial.status === 'active') {
    const newNotifIds = await scheduleTrialReminders(updatedTrial);
    updatedTrial.notificationIds = newNotifIds;
  } else {
    updatedTrial.notificationIds = [];
  }

  current[index] = updatedTrial;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  notifySubscribers();
}

/**
 * Delete a trial by ID
 */
export async function deleteTrial(id: string): Promise<void> {
  const current = await getTrials();
  const toDelete = current.find((t) => t.id === id);
  if (toDelete && toDelete.notificationIds && toDelete.notificationIds.length > 0) {
    await cancelTrialReminders(toDelete.notificationIds);
  }

  const filtered = current.filter((t) => t.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  notifySubscribers();
}

/**
 * Fetch a single trial by ID
 */
export async function getTrialById(id: string): Promise<Trial | null> {
  const current = await getTrials();
  return current.find((t) => t.id === id) || null;
}

/**
 * Reconciles all active reminders upon application launch, ensuring scheduled
 * notifications survive phone restarts.
 */
export async function reconcileRemindersOnLaunch(): Promise<void> {
  try {
    const trials = await getTrials();
    const reconciled = await rescheduleAllActiveReminders(trials);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reconciled));
  } catch (err) {
    console.warn('Failed to reconcile reminders on launch:', err);
  }
}
