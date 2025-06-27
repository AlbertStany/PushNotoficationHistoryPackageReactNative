import 'jest';
import { SqliteNotificationRepository } from '../SqliteNotificationRepository';
import { NotificationItem } from '../../../entities/NotificationItem';

// Extend the class to access protected methods for testing
class TestableSqliteNotificationRepository extends SqliteNotificationRepository {
    public testInitializeDatabase() {
        return this.initializeDatabase();
    }
}

describe('SqliteNotificationRepository', () => {
    let repo: TestableSqliteNotificationRepository;

    beforeAll(async () => {
        repo = new TestableSqliteNotificationRepository();
        await repo.testInitializeDatabase();
    });

    afterAll(async () => {
        // Clean up after tests
        const all = await repo.getAllNotifications();
        await Promise.all(all.map(n => n.id && repo.deleteNotification(n.id)));
    });

    it('should add and retrieve a notification', async () => {
        const notification: Omit<NotificationItem, 'id'> = {
            title: 'Test',
            body: 'Test body',
            payload: null,
            receivedAt: new Date().toISOString(),
            isRead: false,
        };
        
        const added = await repo.addNotification(notification);
        expect(added).toMatchObject({
            title: 'Test',
            body: 'Test body',
            isRead: false
        });
        expect(added.id).toBeDefined();
        
        const all = await repo.getAllNotifications();
        expect(all).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: added.id })
            ])
        );
    });

    it('should mark a notification as read', async () => {
        // First add a notification
        const notification = await repo.addNotification({
            title: 'Test Read',
            body: 'Test read body',
            payload: null,
            receivedAt: new Date().toISOString(),
            isRead: false,
        });

        // Mark as read
        await repo.markNotificationAsRead(notification.id!);
        
        // Verify
        const updated = await repo.getAllNotifications();
        const updatedNotification = updated.find(n => n.id === notification.id);
        expect(updatedNotification).toBeDefined();
        expect(updatedNotification?.isRead).toBe(true);
    });

    it('should delete a notification', async () => {
        // First add a notification
        const notification = await repo.addNotification({
            title: 'Test Delete',
            body: 'Test delete body',
            payload: null,
            receivedAt: new Date().toISOString(),
            isRead: false,
        });

        // Delete it
        await repo.deleteNotification(notification.id!);
        
        // Verify
        const afterDelete = await repo.getAllNotifications();
        expect(afterDelete.find(n => n.id === notification.id)).toBeUndefined();
    });
});