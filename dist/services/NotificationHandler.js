"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHandler = void 0;
const tsyringe_1 = require("tsyringe");
const Notifications = __importStar(require("expo-notifications"));
const AddNotification_1 = require("../useCases/AddNotification");
const container_1 = require("../di/container");
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
let NotificationHandler = class NotificationHandler {
    addNotification;
    constructor(addNotification) {
        this.addNotification = addNotification;
    }
    notificationListener = null;
    notificationResponseListener = null;
    processedNotificationIds = new Set();
    initialized = false;
    listenersSetup = false;
    async initialize() {
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
        }
        catch (error) {
            console.error('Error initializing notifications:', error);
            return false;
        }
    }
    getNotificationId(notification) {
        // Create a unique ID based on notification content, trigger, and timestamp
        const { title, body, data } = notification.request.content;
        const trigger = JSON.stringify(notification.request.trigger);
        // Generate a timestamp for the notification
        let timestamp;
        try {
            // Try to get the timestamp from the notification date if it exists
            const notificationDate = notification.date;
            if (notificationDate) {
                timestamp = typeof notificationDate === 'number'
                    ? notificationDate
                    : new Date(notificationDate).getTime();
            }
            else {
                timestamp = Date.now();
            }
        }
        catch (error) {
            console.warn('Error getting notification date, using current time:', error);
            timestamp = Date.now();
        }
        return `${title}-${body}-${JSON.stringify(data)}-${trigger}-${timestamp}`;
    }
    setupNotificationListeners() {
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
                }
                else {
                    console.warn('Failed to store notification: storeNotification returned false');
                }
            }
            catch (error) {
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
    removeNotificationListeners() {
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
    async storeNotification(notification) {
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
        }
        catch (error) {
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
    async sendTestNotification() {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Test Notification',
                    body: 'This is a test notification!',
                    data: { test: true },
                },
                trigger: null, // Send immediately
            });
            return true;
        }
        catch (error) {
            console.error('Error sending test notification:', error);
            return false;
        }
    }
    async showNotification(title, body, data = {}) {
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
        }
        catch (error) {
            console.error('Error showing notification:', error);
            return false;
        }
    }
    async getPushToken() {
        try {
            if (__DEV__) {
                // Use Expo's push token for development
                const tokenData = await Notifications.getExpoPushTokenAsync({
                    projectId: '5ce660a1-28b9-49ea-93c3-5e69b3d142af', // Replace with your Expo project ID
                });
                console.log('Expo Push Token:', tokenData.data);
                return tokenData.data;
            }
            else {
                // For production, you'll need to set up FCM
                console.warn('FCM is not configured for production yet');
                return null;
            }
        }
        catch (error) {
            console.error('Error getting push token:', error);
            return null;
        }
    }
};
exports.NotificationHandler = NotificationHandler;
exports.NotificationHandler = NotificationHandler = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(container_1.TYPES.AddNotification)),
    __metadata("design:paramtypes", [AddNotification_1.AddNotification])
], NotificationHandler);
