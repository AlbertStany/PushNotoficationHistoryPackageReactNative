import { NotificationItem } from '../entities/NotificationItem';
import { AddNotification } from '../useCases/AddNotification';
export declare class NotificationHandler {
    private addNotification;
    constructor(addNotification: AddNotification);
    private notificationListener;
    private notificationResponseListener;
    private processedNotificationIds;
    private initialized;
    private listenersSetup;
    initialize(): Promise<boolean>;
    private getNotificationId;
    private setupNotificationListeners;
    removeNotificationListeners(): void;
    storeNotification(notification: Omit<NotificationItem, 'id' | 'receivedAt' | 'isRead'>): Promise<boolean>;
    sendTestNotification(): Promise<boolean>;
    showNotification(title: string, body: string, data?: any): Promise<boolean>;
    getPushToken(): Promise<string | null>;
}
