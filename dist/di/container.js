"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPES = void 0;
const tsyringe_1 = require("tsyringe");
const SqliteNotificationRepository_1 = require("../repositories/impl/SqliteNotificationRepository");
const AddNotification_1 = require("../useCases/AddNotification");
const GetNotifications_1 = require("../useCases/GetNotifications");
const MarkNotificationAsRead_1 = require("../useCases/MarkNotificationAsRead");
const DeleteNotification_1 = require("../useCases/DeleteNotification");
const MarkAllNotificationsAsRead_1 = require("../useCases/MarkAllNotificationsAsRead");
const NotificationHandler_1 = require("../services/NotificationHandler");
exports.TYPES = {
    NotificationRepository: Symbol.for('NotificationRepository'),
    AddNotification: Symbol.for('AddNotification'),
    GetNotifications: Symbol.for('GetNotifications'),
    MarkNotificationAsRead: Symbol.for('MarkNotificationAsRead'),
    DeleteNotification: Symbol.for('DeleteNotification'),
    MarkAllNotificationsAsRead: Symbol.for('MarkAllNotificationsAsRead'),
    NotificationHandler: Symbol.for('NotificationHandler'),
};
tsyringe_1.container.registerSingleton(exports.TYPES.NotificationRepository, SqliteNotificationRepository_1.SqliteNotificationRepository);
tsyringe_1.container.register(exports.TYPES.AddNotification, {
    useFactory: () => new AddNotification_1.AddNotification(tsyringe_1.container.resolve(exports.TYPES.NotificationRepository)),
});
tsyringe_1.container.register(exports.TYPES.GetNotifications, {
    useFactory: () => new GetNotifications_1.GetNotifications(tsyringe_1.container.resolve(exports.TYPES.NotificationRepository)),
});
tsyringe_1.container.register(exports.TYPES.MarkNotificationAsRead, {
    useFactory: () => new MarkNotificationAsRead_1.MarkNotificationAsRead(tsyringe_1.container.resolve(exports.TYPES.NotificationRepository)),
});
tsyringe_1.container.register(exports.TYPES.DeleteNotification, {
    useFactory: () => new DeleteNotification_1.DeleteNotification(tsyringe_1.container.resolve(exports.TYPES.NotificationRepository)),
});
tsyringe_1.container.register(exports.TYPES.MarkAllNotificationsAsRead, {
    useFactory: () => new MarkAllNotificationsAsRead_1.MarkAllNotificationsAsRead(tsyringe_1.container.resolve(exports.TYPES.NotificationRepository)),
});
// Register NotificationHandler with explicit dependencies
tsyringe_1.container.register(exports.TYPES.NotificationHandler, {
    useFactory: () => {
        const addNotification = tsyringe_1.container.resolve(exports.TYPES.AddNotification);
        return new NotificationHandler_1.NotificationHandler(addNotification);
    },
});
exports.default = tsyringe_1.container;
