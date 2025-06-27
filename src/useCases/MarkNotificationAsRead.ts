import { NotificationRepository } from '../repositories/NotificationRepository';

export class MarkNotificationAsRead {
    constructor(private repository: NotificationRepository) { }

    async execute(id: number): Promise<void> {
        await this.repository.markNotificationAsRead(id);
    }
}