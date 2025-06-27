// This import should be at the top of the file, before any other imports
import 'reflect-metadata';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, LogBox, ActivityIndicator, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Initialize Firebase
import { initializeFirebase } from './src/config/firebase';

import { container } from 'tsyringe';
import { NotificationHandler } from './src/services/NotificationHandler';
import { TYPES } from './src/di/container';

// Import the actual NotificationHistoryScreen component
import NotificationHistoryScreen from './src/screens/NotificationHistoryScreen';
import { GetNotifications } from './src/useCases/GetNotifications';
import { MarkNotificationAsRead } from './src/useCases/MarkNotificationAsRead';
import { DeleteNotification } from './src/useCases/DeleteNotification';
import { MarkAllNotificationsAsRead } from './src/useCases/MarkAllNotificationsAsRead';

const Stack = createStackNavigator();

// Set the notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type RootStackParamList = {
  Home: undefined;
  NotificationHistory: undefined;
};

// Use a wrapper component to ensure proper dependency injection
const HomeScreenWrapper = ({ navigation }: { navigation: any }) => {
  const [error, setError] = useState<string | null>(null);
  const notificationHandler = container.resolve<NotificationHandler>(TYPES.NotificationHandler);

  const handleSendTestNotification = async () => {
    try {
      // Send a test notification with some sample data
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        type: 'test_notification'
      };
      console.log('Sending test notification with data:', testData);
      const success = await notificationHandler.showNotification(
        'Test Notification',
        'This is a test notification!',
        testData
      );
      if (!success) {
        throw new Error('Failed to send test notification');
      }
      console.log('Test notification sent successfully');
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError('Failed to send test notification: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <View style={styles.container}>
      <Text>Test Notifications</Text>
      <Button
        title="Send Local Notification"
        onPress={handleSendTestNotification}
      />
      <Button
        title="View Notification History"
        onPress={() => navigation.navigate('NotificationHistory')}
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
};

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const notificationHandlerRef = useRef<NotificationHandler | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initializeAppAsync = async () => {
      try {
        // Initialize Firebase
        await initializeFirebase();

        // Request notification permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return;
        }

        // Get the token that identifies this device
        if (Device.isDevice) {
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          console.log('Expo Push Token:', token);
        }

        // Initialize NotificationHandler only once
        const handler = container.resolve<NotificationHandler>(TYPES.NotificationHandler);
        await handler.initialize();
        notificationHandlerRef.current = handler;
        if (isMounted) setIsReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    initializeAppAsync();
    return () => {
      isMounted = false;
      // Clean up notification listeners on unmount/reload
      if (notificationHandlerRef.current) {
        notificationHandlerRef.current.removeNotificationListeners();
      }
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Initializing app...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreenWrapper} />
            <Stack.Screen name="NotificationHistory" component={NotificationHistoryScreenWrapper} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

// Wrapper for NotificationHistory screen with dependency injection
const NotificationHistoryScreenWrapper = ({ navigation }: { navigation: any }) => {
  // Resolve dependencies
  const getNotifications = container.resolve<GetNotifications>(TYPES.GetNotifications);
  const markNotificationAsRead = container.resolve<MarkNotificationAsRead>(TYPES.MarkNotificationAsRead);
  const deleteNotification = container.resolve<DeleteNotification>(TYPES.DeleteNotification);
  const markAllNotificationsAsRead = container.resolve<MarkAllNotificationsAsRead>(TYPES.MarkAllNotificationsAsRead);

  return (
    <NotificationHistoryScreen
      navigation={navigation}
      getNotifications={getNotifications}
      markNotificationAsRead={markNotificationAsRead}
      deleteNotification={deleteNotification}
      markAllNotificationsAsRead={markAllNotificationsAsRead}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;