import * as SQLite from 'expo-sqlite';
import { injectable } from 'tsyringe';
import { NotificationItem } from '../../entities/NotificationItem';
import { NotificationRepository } from '../NotificationRepository';

// Type definitions for database rows
interface NotificationRow {
    id: number;
    title: string;
    body: string;
    payload: string | null;
    receivedAt: string;
    isRead: number;
}

// Helper function to convert database row to NotificationItem
const mapRowToNotification = (row: NotificationRow): NotificationItem => ({
    id: row.id,
    title: row.title,
    body: row.body,
    payload: row.payload,
    receivedAt: row.receivedAt,
    isRead: row.isRead === 1
});

@injectable()
export class SqliteNotificationRepository implements NotificationRepository {
    private db: SQLite.SQLiteDatabase;
    private isInitialized = false;

    constructor() {
        this.db = SQLite.openDatabase('notifications.db');
        this.initializeDatabase().catch(console.error);
    }

    protected async initializeDatabase(): Promise<void> {
        if (this.isInitialized) return;
        
        return new Promise((resolve, reject) => {
            this.db.transaction(
                tx => {
                    tx.executeSql(
                        `CREATE TABLE IF NOT EXISTS notifications (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            title TEXT NOT NULL,
                            body TEXT NOT NULL,
                            payload TEXT,
                            receivedAt TEXT NOT NULL,
                            isRead INTEGER DEFAULT 0
                        )`,
                        [],
                        () => {
                            this.isInitialized = true;
                            resolve();
                        },
                        (_, error) => {
                            console.error('Error creating table:', error);
                            reject(error);
                            return false;
                        }
                    );
                },
                error => {
                    console.error('Transaction error:', error);
                    reject(error);
                }
            );
        });
    }

    private async executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.transaction(
                tx => {
                    tx.executeSql(
                        sql,
                        params,
                        (_, { rows: { _array } }) => resolve(_array as T[]),
                        (_, error) => {
                            console.error('SQL error:', error);
                            reject(error);
                            return false;
                        }
                    );
                },
                error => {
                    console.error('Transaction error:', error);
                    reject(error);
                }
            );
        });
    }

    private async executeWrite(sql: string, params: any[] = []): Promise<{ insertId?: number; rowsAffected: number }> {
        return new Promise((resolve, reject) => {
            this.db.transaction(
                tx => {
                    tx.executeSql(
                        sql,
                        params,
                        (_, result) => {
                            resolve({
                                insertId: result.insertId,
                                rowsAffected: result.rowsAffected
                            });
                        },
                        (_, error) => {
                            console.error('SQL error:', error);
                            reject(error);
                            return false;
                        }
                    );
                },
                error => {
                    console.error('Transaction error:', error);
                    reject(error);
                }
            );
        });
    }

    async addNotification(notification: Omit<NotificationItem, 'id'>): Promise<NotificationItem> {
        const result = await this.executeWrite(
            'INSERT INTO notifications (title, body, payload, receivedAt, isRead) VALUES (?, ?, ?, ?, ?)',
            [
                notification.title,
                notification.body,
                notification.payload || null,
                notification.receivedAt,
                notification.isRead ? 1 : 0
            ]
        );

        if (result.insertId === undefined) {
            throw new Error('Failed to insert notification: No insertId returned');
        }

        return {
            ...notification,
            id: result.insertId
        };
    }

    async getAllNotifications(limit: number = 50, offset: number = 0): Promise<NotificationItem[]> {
        const rows = await this.executeQuery<NotificationRow>(
            'SELECT * FROM notifications ORDER BY receivedAt DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return rows.map(mapRowToNotification);
    }

    async markNotificationAsRead(id: number): Promise<void> {
        if (!this.isInitialized) {
            await this.initializeDatabase();
        }

        try {
            await this.executeWrite(
                'UPDATE notifications SET isRead = 1 WHERE id = ?',
                [id]
            );
            console.log(`Marked notification ${id} as read`);
        } catch (error) {
            console.error(`Failed to mark notification ${id} as read:`, error);
            throw error;
        }
    }

    async deleteNotification(id: number): Promise<void> {
        if (!this.isInitialized) {
            await this.initializeDatabase();
        }

        try {
            await this.executeWrite(
                'DELETE FROM notifications WHERE id = ?',
                [id]
            );
            console.log(`Deleted notification ${id}`);
        } catch (error) {
            console.error(`Failed to delete notification ${id}:`, error);
            throw error;
        }
    }

    async markAllNotificationsAsRead(): Promise<void> {
        if (!this.isInitialized) {
            await this.initializeDatabase();
        }

        try {
            await this.executeWrite(
                'UPDATE notifications SET isRead = 1 WHERE isRead = 0'
            );
            console.log('Marked all notifications as read');
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            throw error;
        }
    }
}