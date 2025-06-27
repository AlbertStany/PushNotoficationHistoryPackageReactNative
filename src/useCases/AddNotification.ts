import { NotificationRepository } from '../repositories/NotificationRepository';
import { NotificationItem } from '../entities/NotificationItem';

export class AddNotification {
    constructor(private repository: NotificationRepository) { }

    async execute(item: NotificationItem): Promise<NotificationItem> {
        return await this.repository.addNotification(item);
    }
}