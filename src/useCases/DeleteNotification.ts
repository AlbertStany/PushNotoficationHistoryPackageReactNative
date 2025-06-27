import { NotificationRepository } from '../repositories/NotificationRepository';

export class DeleteNotification {
    constructor(private repository: NotificationRepository) { }

    async execute(id: number): Promise<void> {
        await this.repository.deleteNotification(id);
    }
}