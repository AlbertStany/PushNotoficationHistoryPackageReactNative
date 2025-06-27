import { NotificationItem } from '../entities/NotificationItem';

export interface NotificationRepository {
    addNotification(item: NotificationItem): Promise<NotificationItem>;
    getAllNotifications(limit?: number, offset?: number): Promise<NotificationItem[]>;
    markNotificationAsRead(id: number): Promise<void>;
    deleteNotification(id: number): Promise<void>;
    markAllNotificationsAsRead(): Promise<void>;
}