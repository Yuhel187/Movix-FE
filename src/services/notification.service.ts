import apiClient from '@/lib/apiClient';
import type { NotificationsResponse, UnreadCountResponse } from '@/types/notification';

const NOTIFICATION_BASE_URL = '/notifications';

export const notificationService = {

    async getNotifications(page: number = 1, limit: number = 20): Promise<NotificationsResponse> {
        const response = await apiClient.get<NotificationsResponse>(
            `${NOTIFICATION_BASE_URL}?page=${page}&limit=${limit}`
        );
        return response.data;
    },

    async getUnreadCount(): Promise<number> {
        const response = await apiClient.get<UnreadCountResponse>(
            `${NOTIFICATION_BASE_URL}/unread-count`
        );
        return response.data.data.count;
    },

    async markAsRead(notificationId: string): Promise<void> {
        await apiClient.patch(`${NOTIFICATION_BASE_URL}/${notificationId}/read`);
    },

    async markAllAsRead(): Promise<void> {
        await apiClient.patch(`${NOTIFICATION_BASE_URL}/read-all`);
    },

    async deleteNotification(notificationId: string): Promise<void> {
        await apiClient.delete(`${NOTIFICATION_BASE_URL}/${notificationId}`);
    },
};
