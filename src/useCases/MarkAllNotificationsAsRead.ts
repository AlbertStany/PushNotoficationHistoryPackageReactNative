import { NotificationRepository } from '../repositories/NotificationRepository';

export class MarkAllNotificationsAsRead {
    constructor(private repository: NotificationRepository) { }

    async execute(): Promise<void> {
        await this.repository.markAllNotificationsAsRead();
    }
}