"use client";

import React, { useEffect } from "react";
import { Bell, Film, MessageSquare, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/notification";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useWebPush } from "@/hooks/useWebPush";

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút";
  return Math.floor(seconds) + " giây";
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case "NEW_MOVIE":
      return <Film className="w-4 h-4 text-blue-400" />;
    case "COMMENT_REPLY":
      return <MessageSquare className="w-4 h-4 text-green-400" />;
    case "WATCH_PARTY_INVITE":
      return <Users className="w-4 h-4 text-purple-400" />;
    case "SYSTEM":
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    default:
      return <Bell className="w-4 h-4 text-gray-400" />;
  }
};

function WebPushToggle() {
  const { isSupported, isSubscribed, isLoading, subscribeToPush, unsubscribeFromPush } = useWebPush();

  if (!isSupported) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 ml-1"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        isSubscribed ? unsubscribeFromPush() : subscribeToPush();
      }}
      disabled={isLoading}
      title={isSubscribed ? "Tắt thông báo đẩy (Web Push)" : "Bật thông báo đẩy (Web Push)"}
    >
      {isLoading ? (
        <span className="text-[10px]">...</span>
      ) : isSubscribed ? (
        <Bell className="w-4 h-4 text-green-500 fill-green-500" />
      ) : (
        <Bell className="w-4 h-4 text-gray-500" />
      )}
    </Button>
  );
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();

  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications(isLoggedIn, { 
    enableSoundAndToast: true,
    onAccountLocked: () => {
      logout();
      router.push('/login');
    }
  });

  // Fetch notifications khi mở dropdown
  useEffect(() => {
    if (isOpen && isLoggedIn) {
      fetchNotifications(1, 5); // Lấy 5 thông báo mới nhất
    }
  }, [isOpen, isLoggedIn, fetchNotifications]);

  // Fetch unread count khi component mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
    }
  }, [isLoggedIn, fetchUnreadCount]);

  const handleNotificationClick = (notification: Notification) => {
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Đóng dropdown
    setIsOpen(false);

    // Điều hướng
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.data?.actionUrl) {
      router.push(notification.data.actionUrl);
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAllAsRead();
  };

  const viewAll = () => {
    setIsOpen(false);
    router.push("/account/notifications");
  };

  // Lấy top 5 notifications để hiển thị
  const displayNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-300 hover:text-white"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#0F0F0F]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {/* Connection indicator */}
          {isConnected && (
            <span className="absolute bottom-1 right-1 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-[#0F0F0F]" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-[#1A1A1A] text-white border-gray-700 w-80 md:w-96"
        align="end"
      >
        <DropdownMenuLabel className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Thông báo</span>
            {isConnected && (
              <span className="text-xs text-green-400" title="Đang kết nối real-time">
                ●
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="link"
              className="text-xs p-0 h-auto text-red-400 hover:text-red-300"
              onClick={handleMarkAllAsRead}
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />

        <div className="max-h-80 overflow-y-auto no-scrollbar">
          {isLoading ? (
            <div className="p-2 space-y-2">
              <Skeleton className="h-16 w-full bg-zinc-700" />
              <Skeleton className="h-16 w-full bg-zinc-700" />
            </div>
          ) : displayNotifications.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-4">
              Không có thông báo mới.
            </p>
          ) : (
            displayNotifications.map((noti) => (
              <DropdownMenuItem
                key={noti.id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800",
                  !noti.isRead && "bg-zinc-800/50"
                )}
                onClick={() => handleNotificationClick(noti)}
              >
                {/* Icon */}
                <div className="w-10 h-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                    <NotificationIcon type={noti.type} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      !noti.isRead ? "text-white" : "text-gray-300"
                    )}
                  >
                    {noti.title}
                  </p>
                  <p
                    className={cn(
                      "text-sm text-gray-400 line-clamp-2",
                      !noti.isRead && "text-gray-300"
                    )}
                  >
                    {noti.message}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      !noti.isRead ? "text-red-400" : "text-gray-500"
                    )}
                  >
                    {formatTimeAgo(noti.createdAt)}
                  </p>
                </div>

                {/* Read Dot */}
                {!noti.isRead && (
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 self-center" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />
        <div className="flex items-center justify-between p-1">
          <DropdownMenuItem
            className="justify-center cursor-pointer text-red-400 hover:text-red-300 focus:bg-zinc-800 flex-1"
            onClick={viewAll}
          >
            Xem tất cả thông báo
          </DropdownMenuItem>
          <WebPushToggle />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}