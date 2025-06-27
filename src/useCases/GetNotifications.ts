import { NotificationRepository } from '../repositories/NotificationRepository';
import { NotificationItem } from '../entities/NotificationItem';

export class GetNotifications {
    constructor(private repository: NotificationRepository) { }

    async execute(limit: number = 50, offset: number = 0): Promise<NotificationItem[]> {
        return await this.repository.getAllNotifications(limit, offset);
    }
}