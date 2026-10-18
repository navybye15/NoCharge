import { Tabs } from 'expo-router';
import { Text } from 'react-native';

// Simple tab layout for Phase 1 — dalawang tab lang muna:
// 1. Test screen (for notification testing)
// 2. Placeholder tab
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2ECC71',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E8F5E9',
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        headerStyle: {
          backgroundColor: '#F0FFF4',
        },
        headerTintColor: '#1B5E20',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '🔔 Test',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>🔔</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'ℹ️ Info',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20 }}>ℹ️</Text>
          ),
        }}
      />
    </Tabs>
  );
}
