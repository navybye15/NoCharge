// ============================================
// NoCharge Custom Bottom Tab Bar (DESIGN.md)
// ============================================
// Features (Section 5):
// - 64dp tall rounded bar
// - Order: Home, Trials, [Raised Center + Button], Calendar, Settings
// - Active tab shown with --primary tint pill behind icon and label
// - Raised Center Add Button: 68dp circle, --primary fill, --on-primary plus (28dp),
//   centered and raised 24dp overlapping top edge, 4dp ring in --surface color, soft glow.

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../context/ThemeContext';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  // Route map for the 4 tabs
  const tabRoutes = state.routes.filter(
    (r) => r.name === 'index' || r.name === 'trials' || r.name === 'calendar' || r.name === 'settings'
  );

  const getTabConfig = (name: string) => {
    switch (name) {
      case 'index':
        return { label: 'Home', icon: 'home-outline' as const, activeIcon: 'home' as const };
      case 'trials':
        return { label: 'Trials', icon: 'card-outline' as const, activeIcon: 'card' as const };
      case 'calendar':
        return { label: 'Calendar', icon: 'calendar-outline' as const, activeIcon: 'calendar' as const };
      case 'settings':
        return { label: 'Settings', icon: 'settings-outline' as const, activeIcon: 'settings' as const };
      default:
        return { label: name, icon: 'ellipse-outline' as const, activeIcon: 'ellipse' as const };
    }
  };

  const renderTabButton = (route: typeof state.routes[0], index: number) => {
    const isFocused = state.index === state.routes.indexOf(route);
    const config = getTabConfig(route.name);

    const onPress = () => {
      try {
        if (navigation?.emit) {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (event?.defaultPrevented) return;
        }
      } catch (e) {
        // Safe fallback
      }

      if (!isFocused) {
        switch (route.name) {
          case 'index':
            router.navigate('/(tabs)');
            break;
          case 'trials':
            router.navigate('/(tabs)/trials');
            break;
          case 'calendar':
            router.navigate('/(tabs)/calendar');
            break;
          case 'settings':
            router.navigate('/(tabs)/settings');
            break;
          default:
            try {
              navigation?.navigate(route.name);
            } catch (err) {
              router.navigate(`/(tabs)/${route.name}` as any);
            }
        }
      }
    };

    const activeColor = isDark ? colors.primary : colors.primaryStrong;
    const inactiveColor = colors.textMuted;

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={config.label}
        onPress={onPress}
        style={styles.tabItem}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.tabPill,
            isFocused && {
              backgroundColor: isDark ? 'rgba(50, 207, 122, 0.18)' : 'rgba(50, 207, 122, 0.20)',
            },
          ]}
        >
          <Ionicons
            name={isFocused ? config.activeIcon : config.icon}
            size={22}
            color={isFocused ? activeColor : inactiveColor}
          />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.15}
            style={[
              styles.tabLabel,
              {
                color: isFocused ? activeColor : inactiveColor,
                fontFamily: isFocused ? 'Manrope_700Bold' : 'Manrope_500Medium',
              },
            ]}
          >
            {config.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const bottomInset = Math.max(insets.bottom, 8);
  const barHeight = 64 + bottomInset;

  return (
    <View style={styles.tabBarWrapper}>
      <View
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: barHeight,
            paddingBottom: bottomInset,
          },
        ]}
      >
        {/* Left Tabs: Home & Trials */}
        {tabRoutes.slice(0, 2).map((route, i) => renderTabButton(route, i))}

        {/* Center Raised Add Button Placeholder / Spacer */}
        <View style={styles.centerButtonSpacer} />

        {/* Right Tabs: Calendar & Settings */}
        {tabRoutes.slice(2, 4).map((route, i) => renderTabButton(route, i + 2))}
      </View>

      {/* Floating Center Raised Add Button (Overlapping 24dp) */}
      <View
        style={[
          styles.raisedButtonWrapper,
          { bottom: bottomInset + 20 },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={[
            styles.raisedButton,
            {
              backgroundColor: colors.primary,
              borderColor: colors.surface,
            },
          ]}
          onPress={() => router.push('/trials/add')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add trial"
        >
          <Ionicons name="add" size={32} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarContainer: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  centerButtonSpacer: {
    width: 68,
  },
  raisedButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raisedButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#32CF7A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
});
