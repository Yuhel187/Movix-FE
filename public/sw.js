self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    const data = event.data?.json() ?? {};
    const title = data.title || 'Thông báo mới từ Movix';
    const message = data.message || 'Bạn có thông báo mới';
    const icon = '/icon.png'; // Đảm bảo bạn có file icon này trong public
    const badge = '/badge.png'; // Icon nhỏ cho thanh status (Android)

    const options = {
        body: message,
        icon: icon,
        badge: badge,
        data: {
            url: data.url || '/',
        },
        vibrate: [100, 50, 100],
        actions: [
            {
                action: 'explore',
                title: 'Xem ngay',
            },
        ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((windowClients) => {
            // Nếu tab đã mở, focus vào nó
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Nếu chưa mở, mở tab mới
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
