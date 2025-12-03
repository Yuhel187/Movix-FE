"use client";

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function useWebPush() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            registerServiceWorker();
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    };

    const subscribeToPush = async () => {
        if (!VAPID_PUBLIC_KEY) {
            toast.error('Thiếu VAPID Public Key. Vui lòng liên hệ Admin.');
            return;
        }

        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Gửi subscription về Backend
            await apiClient.post('/notifications/subscribe', subscription);

            setIsSubscribed(true);
            toast.success('Đã bật thông báo đẩy!');
        } catch (error) {
            console.error('Failed to subscribe:', error);
            toast.error('Không thể bật thông báo. Hãy kiểm tra quyền truy cập.');
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribeFromPush = async () => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
                // Gửi request xóa sub ở Backend (nếu cần)
                // await apiClient.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
            }

            setIsSubscribed(false);
            toast.success('Đã tắt thông báo đẩy.');
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            toast.error('Lỗi khi tắt thông báo.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isSupported,
        isSubscribed,
        isLoading,
        subscribeToPush,
        unsubscribeFromPush
    };
}
