import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import 'react-native-reanimated';
import { reconcileRemindersOnLaunch } from '../services/storage';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Ito ang nag-se-set kung paano mag-appear ang notification kapag nakabukas ang app.
// "shouldShowAlert: true" means kahit bukas ang app, makikita pa rin yung notification.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowInForeground: true,
  }),
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Setup notification channel for Android
    // Ito yung "category" ng notifications sa Android settings.
    setupNotificationChannel();

    // Request permission (Android 13+ requires this)
    registerForNotifications();

    // Reconcile and reschedule reminders so they survive reboots
    reconcileRemindersOnLaunch();

    // Listener: kapag nag-tap yung user sa notification, dadalhin siya sa detail screen
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.screen === 'notification-test') {
          router.push('/notification-result');
        } else if (data?.trialId) {
          router.push(`/trials/${data.trialId}` as any);
        }
      });

    return () => {
      // Cleanup listeners kapag nag-unmount ang component
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Light theme lang muna — mint-green ang design natin later
  const noChargeTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#2ECC71',
      background: '#F0FFF4',
    },
  };

  return (
    <ThemeProvider value={noChargeTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="notification-result"
          options={{
            title: 'Notification Clicked!',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="trials/add"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="trials/[id]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

// ===== HELPER FUNCTIONS =====

// Gumawa ng notification channel para sa Android.
// Kailangan ito para gumana ang notifications sa Android 8+.
async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('trial-reminders', {
      name: 'Trial Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2ECC71',
      description: 'Reminders before your free trials end',
    });
  }
}

// Humingi ng permission para mag-send ng notifications.
// Sa Android 13+ (API 33), kailangan ng explicit permission mula sa user.
async function registerForNotifications() {
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted!');
    return false;
  }

  return true;
}
