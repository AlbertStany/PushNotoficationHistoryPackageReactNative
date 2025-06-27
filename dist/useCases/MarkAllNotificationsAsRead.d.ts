import { NotificationRepository } from '../repositories/NotificationRepository';
export declare class MarkAllNotificationsAsRead {
    private repository;
    constructor(repository: NotificationRepository);
    execute(): Promise<void>;
}
