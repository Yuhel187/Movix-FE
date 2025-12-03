"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationService } from '@/services/notification.service';
import type { Notification } from '@/types/notification';
import { toast } from 'sonner';

const getSocketUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return baseUrl.replace(/\/api\/?$/, '');
};

const SOCKET_URL = getSocketUrl();

interface UseNotificationsReturn {
    socket: Socket | null;
    isConnected: boolean;
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    fetchNotifications: (page?: number, limit?: number) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (notificationId: string) => Promise<void>;
    hasMore: boolean;
    currentPage: number;
}

interface UseNotificationsOptions {
    enableSoundAndToast?: boolean;
}

export const useNotifications = (isAuthenticated: boolean = false, options: UseNotificationsOptions = { enableSoundAndToast: true }): UseNotificationsReturn => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const socketRef = useRef<Socket | null>(null);

    // Kết nối WebSocket
    useEffect(() => {
        console.log('[useNotifications] isAuthenticated:', isAuthenticated);

        if (!isAuthenticated) {
            console.log('useNotifications] Not authenticated, skipping socket connection');
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        console.log(' [useNotifications] Connecting to:', SOCKET_URL);
        console.log(' [useNotifications] Using HttpOnly Cookie (withCredentials: true)');

        const socketOptions: any = {
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            withCredentials: true,
            path: '/socket.io/',
        };

        const newSocket = io(SOCKET_URL, socketOptions);

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            console.log('Connected to notification server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Disconnected from notification server:', reason);
            setIsConnected(false);
        });

        // Event: Lỗi kết nối
        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
            setIsConnected(false);
        });

        // Event: Thông báo mới
        newSocket.on('notification:new', (notification: Notification) => {
            console.log(' New notification:', notification);

            setNotifications(prev => [notification, ...prev]);

            if (!notification.isRead) {
                setUnreadCount(prev => prev + 1);
            }

            // Chỉ phát âm thanh và toast nếu được bật (mặc định true)
            if (options.enableSoundAndToast) {
                // Phát âm thanh
                try {
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    const audioContext = new AudioContext();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.value = 800;
                    oscillator.type = 'sine';
                    gainNode.gain.value = 0.3;

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);

                    const oscillator2 = audioContext.createOscillator();
                    const gainNode2 = audioContext.createGain();
                    oscillator2.connect(gainNode2);
                    gainNode2.connect(audioContext.destination);
                    oscillator2.frequency.value = 1000;
                    oscillator2.type = 'sine';
                    gainNode2.gain.value = 0.3;
                    oscillator2.start(audioContext.currentTime + 0.1);
                    oscillator2.stop(audioContext.currentTime + 0.2);
                } catch (error) {
                    console.log('Notification sound error:', error);
                }

                toast.info(notification.title, {
                    description: notification.message,
                    duration: 5000,
                });
            }
        });

        // Event: Số lượng chưa đọc
        newSocket.on('notification:unread-count', (data: { count: number }) => {
            console.log('Unread count:', data.count);
            setUnreadCount(data.count);
        });

        newSocket.on('notification:system', (notification: Notification) => {
            console.log('System notification:', notification);
            toast.warning(notification.title, {
                description: notification.message,
                duration: 10000,
            });
        });

        // Event: Đã đánh dấu đọc
        newSocket.on('notification:marked-read', (data: { notificationId: string }) => {
            console.log('Marked as read:', data.notificationId);
        });

        // Event: Đã đánh dấu tất cả đọc
        newSocket.on('notification:all-marked-read', () => {
            console.log('All notifications marked as read');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        });

        // Event: Danh sách thông báo mới nhất
        newSocket.on('notification:latest', (latestNotifications: Notification[]) => {
            console.log('Latest notifications:', latestNotifications);
            setNotifications(latestNotifications);
        });

        // Event: Lỗi
        newSocket.on('notification:error', (error: { message: string }) => {
            console.error('Notification error:', error.message);
            toast.error('Lỗi thông báo', {
                description: error.message,
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
            socketRef.current = null;
        };
    }, [isAuthenticated]);

    const fetchNotifications = useCallback(async (page: number = 1, limit: number = 20) => {
        try {
            setIsLoading(true);
            const response = await notificationService.getNotifications(page, limit);

            if (page === 1) {
                setNotifications(response.data.notifications);
            } else {
                setNotifications(prev => [...prev, ...response.data.notifications]);
            }

            setHasMore(response.data.hasNext);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Không thể tải thông báo');
        } finally {
            setIsLoading(false);
        }
    }, []);
    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, []);
    const markAsRead = useCallback((notificationId: string) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('notification:mark-read', notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
            notificationService.markAsRead(notificationId)
                .then(() => {
                    setNotifications(prev =>
                        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
                    );
                    setUnreadCount(prev => Math.max(0, prev - 1));
                })
                .catch(error => console.error('Error marking as read:', error));
        }
    }, []);
    const markAllAsRead = useCallback(() => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('notification:mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } else {
            notificationService.markAllAsRead()
                .then(() => {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    setUnreadCount(0);
                })
                .catch(error => console.error('Error marking all as read:', error));
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            await notificationService.deleteNotification(notificationId);
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Không thể xóa thông báo');
        }
    }, []);

    return {
        socket,
        isConnected,
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        hasMore,
        currentPage,
    };
};
