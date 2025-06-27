import { NotificationRepository } from '../repositories/NotificationRepository';
import { NotificationItem } from '../entities/NotificationItem';
export declare class AddNotification {
    private repository;
    constructor(repository: NotificationRepository);
    execute(item: NotificationItem): Promise<NotificationItem>;
}
