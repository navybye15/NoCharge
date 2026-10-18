// ============================================
// NoCharge Data Models & Helpers
// ============================================

export type BillingCycle = 'monthly' | 'yearly' | 'one-time';
export type TrialStatus = 'active' | 'cancelled' | 'kept';

export interface Trial {
  id: string;
  serviceName: string;
  startDate?: string;             // ISO 'YYYY-MM-DD'
  endDate: string;                // ISO 'YYYY-MM-DD' (Charge date)
  priceAfterTrial: number;        // in PHP (₱)
  billingCycle: BillingCycle;
  cancelLink?: string;            // Validated URL to cancel/manage page
  paymentLabel?: string;          // e.g. "GCash", "BPI Card", "Maya"
  notes?: string;
  reminderOffsetsDays: number[];  // default [3, 1, 0]
  notificationIds?: string[];     // IDs of scheduled notifications in expo-notifications
  status: TrialStatus;
  color: string;                  // Hex string from palette
  createdAt: number;              // Timestamp
}

/**
 * Calculates days remaining between today and an ISO 'YYYY-MM-DD' date string.
 * Uses local midnight for accurate calendar-day calculation without timezone drift.
 */
export function getDaysLeft(endDateStr: string): number {
  const parts = endDateStr.split('-').map(Number);
  if (parts.length !== 3) return 0;
  const [year, month, day] = parts;
  
  const end = new Date(year, month - 1, day, 0, 0, 0);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  
  const diffTime = end.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export interface CountdownChipInfo {
  label: string;
  isUrgent: boolean; // <= 1 day or past
  isWarning: boolean; // 2-3 days
  isToday: boolean;
  isPast: boolean;
  color: string;
  bgColor: string;
}

/**
 * Computes human-friendly countdown label & styling
 */
export function getCountdownInfo(endDateStr: string): CountdownChipInfo {
  const days = getDaysLeft(endDateStr);

  if (days < 0) {
    return {
      label: `${Math.abs(days)}d ago`,
      isUrgent: true,
      isWarning: false,
      isToday: false,
      isPast: true,
      color: '#EF4444',
      bgColor: '#FEF2F2',
    };
  }

  if (days === 0) {
    return {
      label: 'Today!',
      isUrgent: true,
      isWarning: false,
      isToday: true,
      isPast: false,
      color: '#EF4444',
      bgColor: '#FEF2F2',
    };
  }

  if (days === 1) {
    return {
      label: 'Tomorrow',
      isUrgent: true,
      isWarning: false,
      isToday: false,
      isPast: false,
      color: '#EF4444',
      bgColor: '#FEF2F2',
    };
  }

  if (days <= 3) {
    return {
      label: `${days} days left`,
      isUrgent: false,
      isWarning: true,
      isToday: false,
      isPast: false,
      color: '#D97706',
      bgColor: '#FFFBEB',
    };
  }

  return {
    label: `${days} days left`,
    isUrgent: false,
    isWarning: false,
    isToday: false,
    isPast: false,
    color: '#059669',
    bgColor: '#ECFDF5',
  };
}

/**
 * Formats ISO date to readable string (e.g. "Oct 25, 2026")
 */
export function formatReadableDate(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats price in Philippine Peso (e.g. "₱549.00" or "₱549")
 */
export function formatCurrency(amount: number): string {
  const rounded = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  return `₱${rounded.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
