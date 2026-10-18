import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

export default function NotificationResultScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isDark ? colors.surface2 : '#E8F8EE' },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={44}
            color={isDark ? colors.primary : colors.primaryStrong}
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Notification Delivered!</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Active and working offline notifications
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.detail, { color: colors.textMuted }]}>
          Ito ang action destination kapag nag-tap ka sa scheduled reminder.
        </Text>

        <View
          style={[
            styles.checkList,
            { backgroundColor: colors.surface2, borderColor: colors.border },
          ]}
        >
          <View style={styles.checkRow}>
            <Ionicons
              name="checkmark"
              size={16}
              color={isDark ? colors.primary : colors.primaryStrong}
            />
            <Text style={[styles.checkItem, { color: colors.text }]}>
              Background reminder scheduled
            </Text>
          </View>
          <View style={styles.checkRow}>
            <Ionicons
              name="checkmark"
              size={16}
              color={isDark ? colors.primary : colors.primaryStrong}
            />
            <Text style={[styles.checkItem, { color: colors.text }]}>
              Alarm fired on time
            </Text>
          </View>
          <View style={styles.checkRow}>
            <Ionicons
              name="checkmark"
              size={16}
              color={isDark ? colors.primary : colors.primaryStrong}
            />
            <Text style={[styles.checkItem, { color: colors.text }]}>
              Deep link opens app
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.back()}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Back to App"
      >
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>← Back to App</Text>
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
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Manrope_700Bold',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
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
    fontFamily: 'Manrope_400Regular',
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
    fontFamily: 'Manrope_600SemiBold',
  },
  button: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Manrope_800ExtraBold',
  },
});
