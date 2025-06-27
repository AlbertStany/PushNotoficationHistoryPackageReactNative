import { NotificationRepository } from '../repositories/NotificationRepository';
export declare class MarkNotificationAsRead {
    private repository;
    constructor(repository: NotificationRepository);
    execute(id: number): Promise<void>;
}
