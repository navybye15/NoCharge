// ============================================
// NoCharge Add / Edit Free Trial Screen (Modal)
// ============================================

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BillingCycle, getDaysLeft, Trial, formatReadableDate } from '../../types/trial';
import { saveTrial, updateTrial, getTrialById, getPaletteColor } from '../../services/storage';
import { useAppTheme } from '../../context/ThemeContext';

export default function AddTrialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const [existingTrial, setExistingTrial] = useState<Trial | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [serviceName, setServiceName] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');
  const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);
  const [priceStr, setPriceStr] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [cancelLink, setCancelLink] = useState('');
  const [paymentLabel, setPaymentLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderOffsets, setReminderOffsets] = useState<number[]>([3, 1, 0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const found = await getTrialById(editId);
      if (found) {
        setExistingTrial(found);
        setServiceName(found.serviceName);
        if (found.startDate) setStartDate(found.startDate);
        setEndDate(found.endDate);
        setPriceStr(found.priceAfterTrial ? found.priceAfterTrial.toString() : '');
        setBillingCycle(found.billingCycle);
        if (found.cancelLink) setCancelLink(found.cancelLink);
        if (found.paymentLabel) setPaymentLabel(found.paymentLabel);
        if (found.notes) setNotes(found.notes);
        if (found.reminderOffsetsDays) setReminderOffsets(found.reminderOffsetsDays);
      }
    })();
  }, [editId]);

  const applyShortcut = (label: string, days: number, months: number = 0, years: number = 0) => {
    setSelectedShortcut(label);
    const base = startDate ? new Date(startDate) : new Date();
    const d = new Date(base);
    
    if (days > 0) d.setDate(d.getDate() + days);
    if (months > 0) d.setMonth(d.getMonth() + months);
    if (years > 0) d.setFullYear(d.getFullYear() + years);

    setEndDate(d.toISOString().split('T')[0]);
  };

  const toggleReminderOffset = (days: number) => {
    if (reminderOffsets.includes(days)) {
      if (reminderOffsets.length === 1) {
        Alert.alert('Reminder', 'Kailangan ng kahit isang alert bago ang charge date.');
        return;
      }
      setReminderOffsets(reminderOffsets.filter((d) => d !== days));
    } else {
      setReminderOffsets([...reminderOffsets, days].sort((a, b) => b - a));
    }
  };

  const handleSave = async () => {
    if (!serviceName.trim()) {
      Alert.alert('Missing Field', 'Ilagay ang pangalan ng service o subscription.');
      return;
    }

    if (!endDate) {
      Alert.alert('Missing Field', 'Piliin ang petsa kung kailan matatapos ang trial.');
      return;
    }

    const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

    setIsSubmitting(true);
    try {
      if (existingTrial) {
        const updated: Trial = {
          ...existingTrial,
          serviceName: serviceName.trim(),
          startDate: startDate || undefined,
          endDate,
          priceAfterTrial: price,
          billingCycle,
          cancelLink: cancelLink.trim() || undefined,
          paymentLabel: paymentLabel.trim() || undefined,
          notes: notes.trim() || undefined,
          reminderOffsetsDays: reminderOffsets,
          updatedAt: new Date().toISOString(),
        };
        await updateTrial(updated);
      } else {
        const newTrial: Omit<Trial, 'id' | 'createdAt' | 'updatedAt'> = {
          serviceName: serviceName.trim(),
          startDate: startDate || undefined,
          endDate,
          priceAfterTrial: price,
          billingCycle,
          status: 'active',
          cancelLink: cancelLink.trim() || undefined,
          paymentLabel: paymentLabel.trim() || undefined,
          notes: notes.trim() || undefined,
          reminderOffsetsDays: reminderOffsets,
          color: getPaletteColor(Math.floor(Math.random() * 8)),
        };
        await saveTrial(newTrial);
      }

      router.back();
    } catch (err) {
      Alert.alert('Error', 'Nagkaproblema sa pag-save. Subukan muli.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysLeft = endDate ? getDaysLeft(endDate) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 20) }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Row */}
          <View style={[styles.headerRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {existingTrial ? 'Edit Free Trial' : 'Add Free Trial'}
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.closeBtn, { backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceSubtle }]}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Service Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              SERVICE NAME <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. Netflix, YouTube Premium, Claude AI"
              placeholderTextColor={colors.textMuted}
              value={serviceName}
              onChangeText={setServiceName}
              autoFocus={!existingTrial}
            />
          </View>

          {/* Quick Shortcuts */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>QUICK TRIAL DURATION</Text>
            <View style={styles.shortcutsRow}>
              {[
                { label: '7 Days', days: 7 },
                { label: '14 Days', days: 14 },
                { label: '1 Month', days: 0, months: 1 },
                { label: '3 Months', days: 0, months: 3 },
                { label: '1 Year', days: 0, months: 0, years: 1 },
              ].map((sc) => {
                const isActive = selectedShortcut === sc.label;
                return (
                  <TouchableOpacity
                    key={sc.label}
                    style={[
                      styles.shortcutChip,
                      {
                        backgroundColor: isActive
                          ? colors.primaryLight
                          : isDark
                          ? colors.surfaceElevated
                          : colors.surfaceSubtle,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => applyShortcut(sc.label, sc.days, sc.months, sc.years)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.shortcutChipText,
                        { color: isActive ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {sc.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* End Date */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              CHARGE DATE (END OF TRIAL) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              value={endDate}
              onChangeText={(text) => {
                setEndDate(text);
                setSelectedShortcut(null);
              }}
            />
            {endDate ? (
              <Text style={[styles.hintDate, { color: colors.primary }]}>
                Charge date: {formatReadableDate(endDate)} ({daysLeft !== null ? `${daysLeft} days left` : ''})
              </Text>
            ) : null}
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>PRICE AFTER TRIAL (PHP ₱)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. 549"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={priceStr}
              onChangeText={setPriceStr}
            />
          </View>

          {/* Billing Cycle */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>BILLING CYCLE</Text>
            <View style={styles.cycleRow}>
              {[
                { key: 'monthly', label: 'Monthly' },
                { key: 'yearly', label: 'Yearly' },
                { key: 'one_time', label: 'One-time' },
              ].map((cycle) => {
                const isActive = billingCycle === cycle.key;
                return (
                  <TouchableOpacity
                    key={cycle.key}
                    style={[
                      styles.cycleChip,
                      {
                        backgroundColor: isActive
                          ? colors.primary
                          : isDark
                          ? colors.surfaceElevated
                          : colors.surfaceSubtle,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setBillingCycle(cycle.key as BillingCycle)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.cycleChipText,
                        { color: isActive ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {cycle.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Cancel Page Link */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>CANCEL PAGE LINK (OPTIONAL)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. https://netflix.com/youraccount"
              placeholderTextColor={colors.textMuted}
              value={cancelLink}
              onChangeText={setCancelLink}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Payment Method Tag */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>CARD / PAYMENT METHOD</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. Maya, GCash, BPI Visa"
              placeholderTextColor={colors.textMuted}
              value={paymentLabel}
              onChangeText={setPaymentLabel}
            />
          </View>

          {/* Reminder Offsets */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>REMIND ME BEFORE CHARGE</Text>
            <View style={styles.shortcutsRow}>
              {[
                { days: 7, label: '7 days before' },
                { days: 3, label: '3 days before' },
                { days: 1, label: '1 day before' },
                { days: 0, label: 'On charge date (9 AM)' },
              ].map((opt) => {
                const isSelected = reminderOffsets.includes(opt.days);
                return (
                  <TouchableOpacity
                    key={opt.days}
                    style={[
                      styles.shortcutChip,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryLight
                          : isDark
                          ? colors.surfaceElevated
                          : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleReminderOffset(opt.days)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.shortcutChipText,
                        { color: isSelected ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {isSelected ? '✓ ' : ''}{opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>NOTES</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. Sign up using work email, cancel before Nov 20"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }, isSubmitting && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>
              {isSubmitting
                ? 'Saving...'
                : existingTrial
                ? 'Save Changes'
                : 'Save Free Trial'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hintDate: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  shortcutsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shortcutChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  shortcutChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cycleChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  cycleChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
