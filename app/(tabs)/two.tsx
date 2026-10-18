import { StyleSheet, Text, View, ScrollView } from 'react-native';

// ============================================
// Info Tab — Phase 1
// ============================================
// Simple na info screen tungkol sa NoCharge project status.

export default function InfoScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>NoCharge</Text>
      <Text style={styles.version}>v0.1.0 — Phase 1</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚀 Project Status</Text>
        <Text style={styles.phase}>
          <Text style={styles.done}>Phase 0:</Text> Environment Check ✅
        </Text>
        <Text style={styles.phase}>
          <Text style={styles.current}>Phase 1:</Text> Notification Test
          🔧
        </Text>
        <Text style={styles.phase}>
          <Text style={styles.upcoming}>Phase 2:</Text> Theme, Navigation,
          Data Model
        </Text>
        <Text style={styles.phase}>
          <Text style={styles.upcoming}>Phase 3:</Text> Reminders + Trial
          Detail
        </Text>
        <Text style={styles.phase}>
          <Text style={styles.upcoming}>Phase 4:</Text> Home, Calendar,
          Settings
        </Text>
        <Text style={styles.phase}>
          <Text style={styles.upcoming}>Phase 5:</Text> Polish + Edge
          Cases
        </Text>
        <Text style={styles.phase}>
          <Text style={styles.upcoming}>Phase 6:</Text> Play Store Ready
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Tech Stack</Text>
        <Text style={styles.tech}>• React Native + Expo (SDK 58)</Text>
        <Text style={styles.tech}>• TypeScript</Text>
        <Text style={styles.tech}>• Expo Router (file-based nav)</Text>
        <Text style={styles.tech}>• expo-notifications</Text>
        <Text style={styles.tech}>• AsyncStorage (local data)</Text>
        <Text style={styles.tech}>• Android only</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
    marginTop: 12,
  },
  version: {
    fontSize: 14,
    color: '#66BB6A',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  phase: {
    fontSize: 14,
    color: '#555',
    lineHeight: 26,
  },
  done: {
    fontWeight: '700',
    color: '#2E7D32',
  },
  current: {
    fontWeight: '700',
    color: '#F57F17',
  },
  upcoming: {
    fontWeight: '600',
    color: '#999',
  },
  tech: {
    fontSize: 14,
    color: '#555',
    lineHeight: 24,
  },
});
