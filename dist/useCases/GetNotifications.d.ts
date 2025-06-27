import { NotificationRepository } from '../repositories/NotificationRepository';
import { NotificationItem } from '../entities/NotificationItem';
export declare class GetNotifications {
    private repository;
    constructor(repository: NotificationRepository);
    execute(limit?: number, offset?: number): Promise<NotificationItem[]>;
}
