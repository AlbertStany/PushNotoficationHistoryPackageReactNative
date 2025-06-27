// src/index.ts
export { NotificationHandler } from './services/NotificationHandler';
export { NotificationRepository } from './repositories/NotificationRepository';
export { SqliteNotificationRepository } from './repositories/impl/SqliteNotificationRepository';
export { NotificationItem } from './entities/NotificationItem';

export {
  AddNotification,
  GetNotifications,
  MarkNotificationAsRead,
  DeleteNotification,
  MarkAllNotificationsAsRead,
} from './useCases';

export { TYPES } from './di/container';
export { default as setupDI } from './di/setup';

// Optional: Export UI components
export { default as NotificationHistoryScreen } from './screens/NotificationHistoryScreen';