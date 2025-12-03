"use client";

import React, { useState, useEffect } from "react";
import { Bell, Film, MessageSquare, Users, AlertTriangle, Check, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/notification";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return Math.floor(seconds) + " giây trước";
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const className = "w-5 h-5";
  switch (type) {
    case "NEW_MOVIE":
      return <Film className={cn(className, "text-blue-400")} />;
    case "COMMENT_REPLY":
      return <MessageSquare className={cn(className, "text-green-400")} />;
    case "WATCH_PARTY_INVITE":
      return <Users className={cn(className, "text-purple-400")} />;
    case "SYSTEM":
      return <AlertTriangle className={cn(className, "text-orange-400")} />;
    default:
      return <Bell className={cn(className, "text-gray-400")} />;
  }
};

const NotificationItem = ({
  notification,
  onClick,
  onDelete,
}: {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onDelete: (notificationId: string) => void;
}) => (
  <div
    className={cn(
      "flex items-start gap-4 p-4 border-b border-zinc-800 cursor-pointer group relative",
      !notification.isRead
        ? "bg-zinc-800/30 hover:bg-zinc-800/60"
        : "hover:bg-zinc-800/60"
    )}
    onClick={() => onClick(notification)}
  >
    {/* Icon */}
    <div className="w-11 h-11 flex-shrink-0">
      <div className="w-11 h-11 rounded-full bg-zinc-700 flex items-center justify-center">
        <NotificationIcon type={notification.type} />
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <p
        className={cn(
          "text-base font-medium",
          !notification.isRead ? "text-white" : "text-gray-300"
        )}
      >
        {notification.title}
      </p>
      <p
        className={cn(
          "text-sm text-gray-400 mt-1",
          !notification.isRead && "text-gray-300"
        )}
      >
        {notification.message}
      </p>
      <p
        className={cn(
          "text-sm mt-2",
          !notification.isRead ? "text-red-400 font-medium" : "text-gray-500"
        )}
      >
        {formatTimeAgo(notification.createdAt)}
      </p>
    </div>

    {/* Read Dot */}
    {!notification.isRead && (
      <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 self-center" />
    )}

    {/* Delete Button */}
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-zinc-700"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(notification.id);
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  </div>
);

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    hasMore,
    currentPage,
  } = useNotifications(isLoggedIn, { enableSoundAndToast: false });

  // Fetch notifications khi component mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications(1, 20);
    }
  }, [isLoggedIn, fetchNotifications]);

  const handleNotificationClick = (notification: Notification) => {
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Điều hướng
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.data?.actionUrl) {
      router.push(notification.data.actionUrl);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchNotifications(currentPage + 1, 20);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true
  );

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Thông báo</h1>
          {isConnected && (
            <span className="text-xs text-green-400 flex items-center gap-1" title="Đang kết nối real-time">
              <span className="block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
            onClick={() => router.push('/account/profile')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
              onClick={handleMarkAllAsRead}
            >
              <Check className="w-4 h-4 mr-2" />
              Đọc tất cả ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "secondary"}
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full",
            filter === "all"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
          )}
        >
          Tất cả
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "secondary"}
          onClick={() => setFilter("unread")}
          className={cn(
            "rounded-full",
            filter === "unread"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
          )}
        >
          Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
        </Button>
      </div>

      {/* Notification List */}
      <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
        {isLoading && currentPage === 1 ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-20 w-full bg-zinc-800" />
            <Skeleton className="h-20 w-full bg-zinc-800" />
            <Skeleton className="h-20 w-full bg-zinc-800" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-gray-400">
            <Bell className="w-12 h-12" />
            <p className="mt-4 text-lg">
              {filter === "unread"
                ? "Bạn không có thông báo chưa đọc."
                : "Không có thông báo nào."}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-800">
              {filteredNotifications.map((noti) => (
                <NotificationItem
                  key={noti.id}
                  notification={noti}
                  onClick={handleNotificationClick}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && filter === "all" && (
              <div className="p-4 border-t border-zinc-800">
                <Button
                  variant="outline"
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang tải..." : "Tải thêm"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}