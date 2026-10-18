import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

export default function NotificationResultScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="checkmark-circle" size={44} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Notification Delivered!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Active and working offline notifications
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

        <Text style={[styles.detail, { color: colors.textSecondary }]}>
          Ito ang action destination kapag nag-tap ka sa scheduled reminder.
        </Text>

        <View style={[styles.checkList, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderLight }]}>
          <View style={styles.checkRow}>
            <Ionicons name="checkmark" size={16} color={colors.primary} />
            <Text style={[styles.checkItem, { color: colors.textPrimary }]}>Background reminder scheduled</Text>
          </View>
          <View style={styles.checkRow}>
            <Ionicons name="checkmark" size={16} color={colors.primary} />
            <Text style={[styles.checkItem, { color: colors.textPrimary }]}>Alarm fired on time</Text>
          </View>
          <View style={styles.checkRow}>
            <Ionicons name="checkmark" size={16} color={colors.primary} />
            <Text style={[styles.checkItem, { color: colors.textPrimary }]}>Deep link opens app</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>← Back to App</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 18,
  },
  detail: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
  },
  checkList: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkItem: {
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
