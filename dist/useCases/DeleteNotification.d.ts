import { NotificationRepository } from '../repositories/NotificationRepository';
export declare class DeleteNotification {
    private repository;
    constructor(repository: NotificationRepository);
    execute(id: number): Promise<void>;
}
