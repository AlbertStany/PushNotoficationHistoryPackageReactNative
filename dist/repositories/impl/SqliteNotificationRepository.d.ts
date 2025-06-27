import { NotificationItem } from '../../entities/NotificationItem';
import { NotificationRepository } from '../NotificationRepository';
export declare class SqliteNotificationRepository implements NotificationRepository {
    private db;
    private isInitialized;
    constructor();
    protected initializeDatabase(): Promise<void>;
    private executeQuery;
    private executeWrite;
    addNotification(notification: Omit<NotificationItem, 'id'>): Promise<NotificationItem>;
    getAllNotifications(limit?: number, offset?: number): Promise<NotificationItem[]>;
    markNotificationAsRead(id: number): Promise<void>;
    deleteNotification(id: number): Promise<void>;
    markAllNotificationsAsRead(): Promise<void>;
}
