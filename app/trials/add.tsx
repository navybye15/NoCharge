// ============================================
// NoCharge Add Free Trial Screen (Modal)
// ============================================
// Form with quick trial length shortcuts, validation,
// billing cycle selector, payment label, and reminder offsets.

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BillingCycle, getDaysLeft } from '../../types/trial';
import { saveTrial, getPaletteColor } from '../../services/storage';
import { Theme } from '../../constants/theme';

export default function AddTrialScreen() {
  const router = useRouter();

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

  // Shortcut helpers to auto-compute end date
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
      setReminderOffsets(reminderOffsets.filter((d) => d !== days));
    } else {
      setReminderOffsets([...reminderOffsets, days].sort((a, b) => b - a));
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    return pattern.test(url.trim());
  };

  const handleSave = async () => {
    if (!serviceName.trim()) {
      Alert.alert('Required', 'Paki-lagay ang pangalan ng service (e.g. Netflix, Spotify).');
      return;
    }

    if (!endDate.trim()) {
      Alert.alert('Required', 'Paki-pili o ilagay ang End Date ng free trial.');
      return;
    }

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(endDate.trim())) {
      Alert.alert('Invalid Date', 'Gamitin ang YYYY-MM-DD format para sa End Date (e.g. 2026-11-20).');
      return;
    }

    if (cancelLink.trim() && !validateUrl(cancelLink.trim())) {
      Alert.alert('Invalid URL', 'Paki-check ang cancel link. Dapat ay valid web address (e.g. https://...).');
      return;
    }

    const daysLeft = getDaysLeft(endDate.trim());
    if (daysLeft < 0) {
      // Warn but allow per requirements
      Alert.alert(
        'Past Date',
        'Nasa nakalipas na araw ang napiling End Date. Sigurado ka bang gusto mo itong i-save?',
        [
          { text: 'Edit Date', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => doSave() },
        ]
      );
      return;
    }

    await doSave();
  };

  const doSave = async () => {
    try {
      setIsSubmitting(true);
      const parsedPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
      const cleanUrl = cancelLink.trim().length > 0 && !cancelLink.startsWith('http')
        ? `https://${cancelLink.trim()}`
        : cancelLink.trim();

      await saveTrial({
        serviceName: serviceName.trim(),
        startDate: startDate.trim() || undefined,
        endDate: endDate.trim(),
        priceAfterTrial: parsedPrice,
        billingCycle,
        cancelLink: cleanUrl || undefined,
        paymentLabel: paymentLabel.trim() || undefined,
        notes: notes.trim() || undefined,
        reminderOffsetsDays: reminderOffsets.length > 0 ? reminderOffsets : [0],
        status: 'active',
        color: getPaletteColor(Math.floor(Math.random() * 9)),
      });

      Alert.alert('Saved! 🎉', `Matagumpay na na-save ang "${serviceName}".`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving trial:', error);
      Alert.alert('Error', 'Nagkaproblema sa pag-save. Pakisubukang muli.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Free Trial</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Service Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              SERVICE NAME <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Netflix, Spotify, Canva Pro"
              placeholderTextColor={Theme.colors.textMuted}
              value={serviceName}
              onChangeText={setServiceName}
            />
          </View>

          {/* Trial Duration Shortcuts */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>TRIAL LENGTH SHORTCUTS</Text>
            <View style={styles.shortcutsRow}>
              {[
                { label: '7 Days', days: 7 },
                { label: '14 Days', days: 14 },
                { label: '30 Days', days: 30 },
                { label: '3 Mos', days: 0, months: 3 },
                { label: '6 Mos', days: 0, months: 6 },
                { label: '1 Year', days: 0, years: 1 },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.shortcutChip,
                    selectedShortcut === item.label && styles.shortcutChipActive,
                  ]}
                  onPress={() => applyShortcut(item.label, item.days, item.months, item.years)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.shortcutChipText,
                      selectedShortcut === item.label && styles.shortcutChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* End Date (Charge Date) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              CHARGE DATE (END DATE) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (e.g. 2026-11-15)"
              placeholderTextColor={Theme.colors.textMuted}
              value={endDate}
              onChangeText={(text) => {
                setEndDate(text);
                setSelectedShortcut(null);
              }}
            />
            {endDate.length === 10 ? (
              <Text style={styles.hintDate}>
                ⏳ {getDaysLeft(endDate) >= 0 ? `${getDaysLeft(endDate)} days from today` : 'Date has passed'}
              </Text>
            ) : null}
          </View>

          {/* Price After Trial */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PRICE AFTER TRIAL (PHP)</Text>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.currencyPrefix}>₱</Text>
              <TextInput
                style={[styles.input, styles.priceInput]}
                placeholder="149.00"
                placeholderTextColor={Theme.colors.textMuted}
                keyboardType="decimal-pad"
                value={priceStr}
                onChangeText={setPriceStr}
              />
            </View>
          </View>

          {/* Billing Cycle */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>BILLING CYCLE</Text>
            <View style={styles.cycleRow}>
              {(['monthly', 'yearly', 'one-time'] as BillingCycle[]).map((cycle) => (
                <TouchableOpacity
                  key={cycle}
                  style={[styles.cycleBtn, billingCycle === cycle && styles.cycleBtnActive]}
                  onPress={() => setBillingCycle(cycle)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cycleBtnText,
                      billingCycle === cycle && styles.cycleBtnTextActive,
                    ]}
                  >
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method Label */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PAYMENT METHOD LABEL (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. GCash, Maya, BPI card (NOT card numbers)"
              placeholderTextColor={Theme.colors.textMuted}
              value={paymentLabel}
              onChangeText={setPaymentLabel}
            />
            {/* Quick Pills */}
            <View style={styles.quickPillsRow}>
              {['GCash', 'Maya', 'BPI Card', 'BDO Card', 'PayPal'].map((pill) => (
                <TouchableOpacity
                  key={pill}
                  style={styles.pill}
                  onPress={() => setPaymentLabel(pill)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pillText}>+ {pill}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cancel Page URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CANCEL PAGE LINK (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor={Theme.colors.textMuted}
              autoCapitalize="none"
              keyboardType="url"
              value={cancelLink}
              onChangeText={setCancelLink}
            />
            <Text style={styles.hint}>
              I-save ang direct link sa cancel/subscription page para isang tap na lang mamaya.
            </Text>
          </View>

          {/* Reminder Offsets */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>REMIND ME BEFORE CHARGE</Text>
            <View style={styles.checkboxRow}>
              {[
                { label: '7 days before', days: 7 },
                { label: '3 days before', days: 3 },
                { label: '1 day before', days: 1 },
                { label: 'On charge date (0d)', days: 0 },
              ].map((item) => {
                const checked = reminderOffsets.includes(item.days);
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.checkboxBtn, checked && styles.checkboxBtnChecked]}
                    onPress={() => toggleReminderOffset(item.days)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.checkIcon}>{checked ? '☑️' : '◻️'}</Text>
                    <Text style={[styles.checkboxLabel, checked && styles.checkboxLabelChecked]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOTES (OPTIONAL)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any details (e.g. promo code, condition for free trial)..."
              placeholderTextColor={Theme.colors.textMuted}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>
              {isSubmitting ? 'Saving...' : 'Save Free Trial'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: Theme.colors.textPrimary,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.colors.textPrimary,
  },
  inputGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Theme.colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 4,
  },
  hintDate: {
    fontSize: 12,
    color: Theme.colors.primaryDark,
    fontWeight: '600',
    marginTop: 4,
  },
  shortcutsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shortcutChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  shortcutChipActive: {
    backgroundColor: Theme.colors.primaryLight,
    borderColor: Theme.colors.primary,
  },
  shortcutChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  shortcutChipTextActive: {
    color: Theme.colors.primaryDark,
    fontWeight: '800',
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    position: 'absolute',
    left: 14,
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    zIndex: 1,
  },
  priceInput: {
    flex: 1,
    paddingLeft: 36,
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cycleBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cycleBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primaryDark,
  },
  cycleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  cycleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quickPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  pill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.full,
  },
  pillText: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  checkboxRow: {
    gap: 8,
  },
  checkboxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
  },
  checkboxBtnChecked: {
    backgroundColor: Theme.colors.primarySubtle,
    borderColor: Theme.colors.primary,
  },
  checkIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  checkboxLabelChecked: {
    color: Theme.colors.primaryDark,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 16,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    ...Theme.shadows.floating,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
