"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const NotificationHistoryScreen = ({ getNotifications, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead, }) => {
    const [notifications, setNotifications] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const loadNotifications = async () => {
        try {
            console.log('Loading notifications...');
            const data = await getNotifications.execute();
            console.log(`Loaded ${data.length} notifications`);
            setNotifications(data);
            setError(null);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load notifications';
            console.error('Failed to load notifications:', error);
            setError(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadNotifications();
        // Refresh notifications every 5 seconds
        const interval = setInterval(loadNotifications, 5000);
        // Cleanup interval on unmount
        return () => {
            console.log('Cleaning up notification refresh interval');
            clearInterval(interval);
        };
    }, [getNotifications]);
    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationAsRead.execute(id);
            setNotifications(await getNotifications.execute());
        }
        catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };
    const handleDelete = async (id) => {
        try {
            await deleteNotification.execute(id);
            setNotifications(await getNotifications.execute());
        }
        catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };
    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead.execute();
            setNotifications(await getNotifications.execute());
        }
        catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };
    const renderItem = ({ item }) => (<react_native_1.View style={styles.item}>
            <react_native_1.View style={styles.itemContent}>
                <react_native_1.View style={{ flex: 1 }}>
                    <react_native_1.Text style={styles.title}>{item.title}</react_native_1.Text>
                    <react_native_1.Text style={styles.body}>{item.body}</react_native_1.Text>
                    <react_native_1.Text style={styles.date}>{new Date(item.receivedAt).toLocaleString()}</react_native_1.Text>
                    {item.isRead ? null : <react_native_1.Text style={styles.unread}>Unread</react_native_1.Text>}
                </react_native_1.View>
                <react_native_1.View style={styles.actions}>
                    {!item.isRead && (<react_native_1.TouchableOpacity onPress={() => item.id && handleMarkAsRead(item.id)} style={styles.iconButton} accessibilityLabel="Mark as read">
                            <react_native_1.Text style={styles.icon}>✅</react_native_1.Text>
                        </react_native_1.TouchableOpacity>)}
                    <react_native_1.TouchableOpacity onPress={() => item.id && handleDelete(item.id)} style={styles.iconButton} accessibilityLabel="Delete notification">
                        <react_native_1.Text style={styles.icon}>🗑️</react_native_1.Text>
                    </react_native_1.TouchableOpacity>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
    if (isLoading) {
        return (<react_native_1.View style={[styles.container, styles.centerContent]}>
                <react_native_1.ActivityIndicator size="large"/>
                <react_native_1.Text>Loading notifications...</react_native_1.Text>
            </react_native_1.View>);
    }
    if (error) {
        return (<react_native_1.View style={[styles.container, styles.centerContent]}>
                <react_native_1.Text style={styles.errorText}>Error: {error}</react_native_1.Text>
                <react_native_1.Button title="Retry" onPress={loadNotifications}/>
            </react_native_1.View>);
    }
    return (<react_native_1.View style={styles.container}>
            <react_native_1.View style={styles.header}>
                <react_native_1.TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
                    <react_native_1.Text style={styles.markAll}>Mark All as Read</react_native_1.Text>
                </react_native_1.TouchableOpacity>
            </react_native_1.View>

            {notifications.length === 0 ? (<react_native_1.View style={[styles.container, styles.centerContent]}>
                    <react_native_1.Text>No notifications yet</react_native_1.Text>
                </react_native_1.View>) : (<react_native_1.FlatList data={notifications} renderItem={renderItem} keyExtractor={(item) => item.id?.toString() || item.receivedAt.toString()} contentContainerStyle={styles.listContent}/>)}
        </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
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
exports.default = NotificationHistoryScreen;
