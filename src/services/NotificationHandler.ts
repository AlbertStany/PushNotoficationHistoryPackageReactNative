import { injectable, inject } from 'tsyringe';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { NotificationItem } from '../entities/NotificationItem';
import { AddNotification } from '../useCases/AddNotification';
import { TYPES } from '../di/container';

// Set notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
});

interface NotificationPayload {
    [key: string]: any;
}

@injectable()
export class NotificationHandler {
    constructor(@inject(TYPES.AddNotification) private addNotification: AddNotification) { }

    private notificationListener: Notifications.Subscription | null = null;
    private notificationResponseListener: Notifications.Subscription | null = null;
    private processedNotificationIds = new Set<string>();
    private initialized = false;
    private listenersSetup = false;

    async initialize(): Promise<boolean> {
        if (this.initialized) {
            console.log('NotificationHandler: initialize() called more than once, skipping.');
            return true;
        }
        this.initialized = true;
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return false;
            }

            // Get the token that uniquely identifies this device
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Push token:', token);

            // Setup notification listeners
            this.setupNotificationListeners();

            // Log that notification handler is initialized
            console.log('Notification handler initialized');

            return true;
        } catch (error) {
            console.error('Error initializing notifications:', error);
            return false;
        }
    }

    private getNotificationId(notification: Notifications.Notification): string {
        // Create a unique ID based on notification content, trigger, and timestamp
        const { title, body, data } = notification.request.content;
        const trigger = JSON.stringify(notification.request.trigger);
        
        // Generate a timestamp for the notification
        let timestamp: number;
        try {
            // Try to get the timestamp from the notification date if it exists
            const notificationDate = (notification as any).date;
            if (notificationDate) {
                timestamp = typeof notificationDate === 'number' 
                    ? notificationDate 
                    : new Date(notificationDate).getTime();
            } else {
                timestamp = Date.now();
            }
        } catch (error) {
            console.warn('Error getting notification date, using current time:', error);
            timestamp = Date.now();
        }
        
        return `${title}-${body}-${JSON.stringify(data)}-${trigger}-${timestamp}`;
    }

    private setupNotificationListeners() {
        if (this.listenersSetup) {
            console.log('NotificationHandler: setupNotificationListeners() called more than once, skipping.');
            return;
        }
        this.listenersSetup = true;
        console.log('Setting up notification listeners...');

        // Remove any existing listeners first
        this.removeNotificationListeners();
        this.processedNotificationIds.clear();

        // Only this listener should store notifications!
        this.notificationListener = Notifications.addNotificationReceivedListener(async (notification) => {
            const notificationId = this.getNotificationId(notification);
            const { title, body, data } = notification.request.content;

            // Skip if we've already processed this notification
            if (this.processedNotificationIds.has(notificationId)) {
                console.log('Skipping already processed notification:', notificationId);
                return;
            }

            // Skip if we've already processed this notification
            if (this.processedNotificationIds.has(notificationId) || data?._stored) {
                console.log('Skipping already processed or stored notification:', notificationId);
                return;
            }

            // Mark this notification as processed
            this.processedNotificationIds.add(notificationId);

            console.log('Processing new notification:', {
                id: notificationId,
                title,
                body,
                data,
                trigger: notification.request.trigger
            });

            try {
                // Store the notification in the database
                const payload = data ? JSON.stringify(data) : null;
                const stored = await this.storeNotification({
                    title: title || 'No title',
                    body: body || '',
                    payload
                });

                if (stored) {
                    console.log('Notification stored successfully in database');
                } else {
                    console.warn('Failed to store notification: storeNotification returned false');
                }
            } catch (error) {
                console.error('Failed to store notification:', error);
            }
        });

        // This listener is for notification taps only. Do not store notifications here!
        this.notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const { title, body, data } = response.notification.request.content;
            console.log('Notification tapped:', {
                title,
                body,
                data,
                actionIdentifier: response.actionIdentifier
            });
            // Do not call storeNotification here!
        });

        console.log('Notification listeners set up successfully');
    }

    public removeNotificationListeners() {
        if (this.notificationListener) {
            this.notificationListener.remove();
            this.notificationListener = null;
        }
        if (this.notificationResponseListener) {
            this.notificationResponseListener.remove();
            this.notificationResponseListener = null;
        }
        // Clear the processed notifications set when listeners are removed
        this.processedNotificationIds.clear();
    }

    async storeNotification(notification: Omit<NotificationItem, 'id' | 'receivedAt' | 'isRead'>): Promise<boolean> {
        try {
            console.log('Storing notification:', {
                title: notification.title,
                body: notification.body,
                hasPayload: !!notification.payload
            });

            const notificationToStore = {
                ...notification,
                payload: notification.payload || null, // Ensure payload is either string or null
                receivedAt: new Date().toISOString(),
                isRead: false,
            };

            console.log('Notification to store:', notificationToStore);

            const result = await this.addNotification.execute(notificationToStore);
            console.log('Notification stored successfully:', result);
            return true;
        } catch (error) {
            console.error('Error storing notification:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                notification: {
                    title: notification.title,
                    body: notification.body,
                    hasPayload: !!notification.payload
                }
            });
            return false;
        }
    }

    async sendTestNotification(): Promise<boolean> {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Test Notification',
                    body: 'This is a test notification!',
                    data: { test: true } as NotificationPayload,
                },
                trigger: null, // Send immediately
            });
            return true;
        } catch (error) {
            console.error('Error sending test notification:', error);
            return false;
        }
    }

    async showNotification(title: string, body: string, data: any = {}): Promise<boolean> {
        try {
            // Store the notification first
            const payload = data ? JSON.stringify(data) : null;
            const stored = await this.storeNotification({
                title,
                body,
                payload
            });

            if (!stored) {
                console.warn('Failed to store notification in showNotification');
                return false;
            }

            // Schedule the notification
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: {
                        ...data,
                        _stored: true // Mark as already stored
                    },
                    sound: 'default',
                    vibrate: [0, 250, 250, 250],
                },
                trigger: null, // Send immediately
            });

            return stored;
        } catch (error) {
            console.error('Error showing notification:', error);
            return false;
        }
    }

    async getPushToken(): Promise<string | null> {
        try {
            if (__DEV__) {
                // Use Expo's push token for development
                const tokenData = await Notifications.getExpoPushTokenAsync({
                    projectId: '5ce660a1-28b9-49ea-93c3-5e69b3d142af', // Replace with your Expo project ID
                });
                console.log('Expo Push Token:', tokenData.data);
                return tokenData.data;
            } else {
                // For production, you'll need to set up FCM
                console.warn('FCM is not configured for production yet');
                return null;
            }
        } catch (error) {
            console.error('Error getting push token:', error);
            return null;
        }
    }
}