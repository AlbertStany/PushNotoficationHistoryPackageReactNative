import { container } from 'tsyringe';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { SqliteNotificationRepository } from '../repositories/impl/SqliteNotificationRepository';
import { AddNotification } from '../useCases/AddNotification';
import { GetNotifications } from '../useCases/GetNotifications';
import { MarkNotificationAsRead } from '../useCases/MarkNotificationAsRead';
import { DeleteNotification } from '../useCases/DeleteNotification';
import { MarkAllNotificationsAsRead } from '../useCases/MarkAllNotificationsAsRead';
import { NotificationHandler } from '../services/NotificationHandler';

export const TYPES = {
    NotificationRepository: Symbol.for('NotificationRepository'),
    AddNotification: Symbol.for('AddNotification'),
    GetNotifications: Symbol.for('GetNotifications'),
    MarkNotificationAsRead: Symbol.for('MarkNotificationAsRead'),
    DeleteNotification: Symbol.for('DeleteNotification'),
    MarkAllNotificationsAsRead: Symbol.for('MarkAllNotificationsAsRead'),
    NotificationHandler: Symbol.for('NotificationHandler'),
};

container.registerSingleton<NotificationRepository>(TYPES.NotificationRepository, SqliteNotificationRepository);
container.register<AddNotification>(TYPES.AddNotification, {
    useFactory: () => new AddNotification(container.resolve(TYPES.NotificationRepository)),
});
container.register<GetNotifications>(TYPES.GetNotifications, {
    useFactory: () => new GetNotifications(container.resolve(TYPES.NotificationRepository)),
});
container.register<MarkNotificationAsRead>(TYPES.MarkNotificationAsRead, {
    useFactory: () => new MarkNotificationAsRead(container.resolve(TYPES.NotificationRepository)),
});
container.register<DeleteNotification>(TYPES.DeleteNotification, {
    useFactory: () => new DeleteNotification(container.resolve(TYPES.NotificationRepository)),
});
container.register<MarkAllNotificationsAsRead>(TYPES.MarkAllNotificationsAsRead, {
    useFactory: () => new MarkAllNotificationsAsRead(container.resolve(TYPES.NotificationRepository)),
});

// Register NotificationHandler with explicit dependencies
container.register<NotificationHandler>(TYPES.NotificationHandler, {
    useFactory: () => {
        const addNotification = container.resolve<AddNotification>(TYPES.AddNotification);
        return new NotificationHandler(addNotification);
    },
});

export default container;