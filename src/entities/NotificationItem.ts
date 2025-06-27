export interface NotificationItem {
    id?: number;
    title: string;
    body: string;
    payload: string | null;
    receivedAt: string;
    isRead: boolean;
}