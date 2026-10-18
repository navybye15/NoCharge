import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// ============================================
// Notification Result Screen
// ============================================
// Ang screen na ito ang mag-o-open kapag nag-tap ang user sa notification.
// Kung nakita mo ito, ibig sabihin gumagana na ang notification + navigation!

export default function NotificationResultScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Big success checkmark */}
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Success!</Text>
        <Text style={styles.subtitle}>
          Gumagana na ang notifications!
        </Text>

        <View style={styles.divider} />

        <Text style={styles.detail}>
          Ito ang screen na mag-o-open kapag nag-tap ka sa notification.
        </Text>
        <Text style={styles.detail}>
          Sa real app, dito makikita mo yung trial details at yung "Open
          cancel page" button.
        </Text>

        <View style={styles.checkList}>
          <Text style={styles.checkItem}>✅ Notification scheduled</Text>
          <Text style={styles.checkItem}>✅ Notification received</Text>
          <Text style={styles.checkItem}>✅ Tap opens this screen</Text>
          <Text style={styles.checkItem}>
            ✅ Ready for Phase 2!
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>← Back to Test Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF4',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#66BB6A',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8F5E9',
    width: '100%',
    marginVertical: 16,
  },
  detail: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  checkList: {
    marginTop: 16,
    alignSelf: 'flex-start',
    width: '100%',
  },
  checkItem: {
    fontSize: 15,
    color: '#2E7D32',
    lineHeight: 28,
    fontWeight: '600',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#2ECC71',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
