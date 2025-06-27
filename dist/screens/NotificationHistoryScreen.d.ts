import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GetNotifications } from '../useCases/GetNotifications';
import { MarkNotificationAsRead } from '../useCases/MarkNotificationAsRead';
import { DeleteNotification } from '../useCases/DeleteNotification';
import { MarkAllNotificationsAsRead } from '../useCases/MarkAllNotificationsAsRead';
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
declare const NotificationHistoryScreen: React.FC<Props>;
export default NotificationHistoryScreen;
