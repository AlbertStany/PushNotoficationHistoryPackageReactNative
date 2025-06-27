import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Button
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NotificationItem } from '../entities/NotificationItem';
import { GetNotifications } from '../useCases/GetNotifications';
import { MarkNotificationAsRead } from '../useCases/MarkNotificationAsRead';
import { DeleteNotification } from '../useCases/DeleteNotification';
import { MarkAllNotificationsAsRead } from '../useCases/MarkAllNotificationsAsRead';
import { MaterialIcons } from '@expo/vector-icons';

type RootStackParamList = {
    Home: undefined;
    NotificationHistory: undefined;
};

interface Props {
    navigation: NativeStackNavigationProp<RootStackParamList, 'NotificationHistory'>;
    getNotifications: GetNotifications;
    markNotificationAsRead: MarkNotificationAsRead;
    deleteNotification: DeleteNotification;
    markAllNotificationsAsRead: MarkAllNotificationsAsRead;
}

const NotificationHistoryScreen: React.FC<Props> = ({
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
    markAllNotificationsAsRead,
}) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadNotifications = async () => {
        try {
            console.log('Loading notifications...');
            const data = await getNotifications.execute();
            console.log(`Loaded ${data.length} notifications`);
            setNotifications(data);
            setError(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load notifications';
            console.error('Failed to load notifications:', error);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();

        // Refresh notifications every 5 seconds
        const interval = setInterval(loadNotifications, 5000);

        // Cleanup interval on unmount
        return () => {
            console.log('Cleaning up notification refresh interval');
            clearInterval(interval);
        };
    }, [getNotifications]);

    const handleMarkAsRead = async (id: number) => {
        try {
            await markNotificationAsRead.execute(id);
            setNotifications(await getNotifications.execute());
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteNotification.execute(id);
            setNotifications(await getNotifications.execute());
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead.execute();
            setNotifications(await getNotifications.execute());
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <View style={styles.item}>
            <View style={styles.itemContent}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.body}>{item.body}</Text>
                    <Text style={styles.date}>{new Date(item.receivedAt).toLocaleString()}</Text>
                    {item.isRead ? null : <Text style={styles.unread}>Unread</Text>}
                </View>
                <View style={styles.actions}>
                    {!item.isRead && (
                        <TouchableOpacity onPress={() => item.id && handleMarkAsRead(item.id)} style={styles.iconButton} accessibilityLabel="Mark as read">
                            <Text style={styles.icon}>✅</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => item.id && handleDelete(item.id)} style={styles.iconButton} accessibilityLabel="Delete notification">
                        <Text style={styles.icon}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" />
                <Text>Loading notifications...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <Button title="Retry" onPress={loadNotifications} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
                    <Text style={styles.markAll}>Mark All as Read</Text>
                </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
                <View style={[styles.container, styles.centerContent]}>
                    <Text>No notifications yet</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id?.toString() || item.receivedAt.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 16,
    },
    item: {
        padding: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    iconButton: {
        marginLeft: 8,
        padding: 6,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
    },
    icon: {
        fontSize: 20,
    },
    body: {
        color: '#333',
        marginBottom: 2,
    },
    date: {
        color: '#888',
        fontSize: 12,
        marginBottom: 2,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    unread: {
        color: '#007AFF',
        marginTop: 4,
        fontWeight: '500',
    },
    markAll: {
        color: '#007AFF',
        fontWeight: '500',
    },
    markAllButton: {
        padding: 8,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

export default NotificationHistoryScreen;