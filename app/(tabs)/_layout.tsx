import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';
import { Theme } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: Theme.colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 64 : 60,
          paddingBottom: 6,
          paddingTop: 6,
          elevation: 8,
        },
        headerStyle: {
          backgroundColor: Theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          color: Theme.colors.textPrimary,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 22 }}>{focused ? '🏠' : '🏡'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="trials"
        options={{
          title: 'Trials',
          headerTitle: 'My Free Trials',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 22 }}>💳</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          headerTitle: 'Charge Dates Calendar',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 22 }}>📅</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings & Reminders',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 22 }}>⚙️</Text>
          ),
        }}
      />
    </Tabs>
  );
}
