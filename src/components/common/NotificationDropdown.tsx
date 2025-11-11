"use client";

import React, { useState, useEffect } from "react";
import { Bell, Film, User, AlertTriangle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/notification"; // Dùng file type mới
import apiClient from "@/lib/apiClient"; 
import { Skeleton } from "@/components/ui/skeleton";

// --- Mock Data (Sẽ thay bằng API) ---
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "new_comment",
    title: "Bình luận mới",
    message: "Huy Lê đã bình luận về phim John Wick 4.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 phút trước
    isRead: false,
    link: "/movies/john-wick-4",
    actor: {
      name: "Huy Lê",
      avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    },
  },
  {
    id: "2",
    type: "favorite_added",
    title: "Đã thêm vào yêu thích",
    message: "Bạn đã thêm Interstellar vào danh sách yêu thích của mình.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 giờ trước
    isRead: false,
    link: "/account/favorites",
    actor: {
      name: "Interstellar",
      avatarUrl:
        "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    },
  },
  {
    id: "3",
    type: "new_login",
    title: "Đăng nhập mới",
    message: "Phát hiện đăng nhập mới từ thiết bị Chrome trên Windows.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 ngày trước
    isRead: true,
    link: "/account/profile",
  },
  {
    id: "4",
    type: "system_alert",
    title: "Bảo trì hệ thống",
    message: "Hệ thống sẽ bảo trì vào lúc 3:00 AM. Vui lòng quay lại sau.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 ngày trước
    isRead: true,
  },
];
// --- End Mock Data ---

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
    case "new_comment":
      return (
        <Film className="w-4 h-4 text-blue-400" />
      );
    case "favorite_added":
      return (
        <Film className="w-4 h-4 text-red-400" />
      );
    case "new_login":
      return <KeyRound className="w-4 h-4 text-yellow-400" />;
    case "system_alert":
      return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    default:
      return <Bell className="w-4 h-4 text-gray-400" />;
  }
};

export default function NotificationDropdown() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(false); // Sẽ đổi thành true khi dùng API
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // // Logic tải dữ liệu thật
  // useEffect(() => {
  //   if (isOpen) {
  //     setIsLoading(true);
  //     apiClient.get('/notifications?limit=5')
  //       .then(res => setNotifications(res.data))
  //       .catch(err => console.error("Failed to fetch notifications", err))
  //       .finally(() => setIsLoading(false));
  //   }
  // }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    // Gọi API đánh dấu đã đọc
    // ...

    // Cập nhật giao diện
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    // Điều hướng
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const markAllAsRead = () => {
    // Gọi API đánh dấu tất cả đã đọc
    // ...

    // Cập nhật giao diện
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };
  
  const viewAll = () => {
    router.push('/account/notifications');
  }

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
            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#0F0F0F]" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-[#1A1A1A] text-white border-gray-700 w-80 md:w-96"
        align="end"
      >
        <DropdownMenuLabel className="flex justify-between items-center">
          Thông báo
          {unreadCount > 0 && (
            <Button
              variant="link"
              className="text-xs p-0 h-auto text-red-400 hover:text-red-300"
              onClick={markAllAsRead}
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
          ) : notifications.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-4">
              Không có thông báo mới.
            </p>
          ) : (
            notifications.map((noti) => (
              <DropdownMenuItem
                key={noti.id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800",
                  !noti.isRead && "bg-zinc-800/50"
                )}
                onClick={() => handleNotificationClick(noti)}
              >
                {/* Icon/Avatar */}
                <div className="w-10 h-10 flex-shrink-0">
                  {noti.actor ? (
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={noti.actor.avatarUrl}
                        alt={noti.actor.name}
                      />
                      <AvatarFallback>
                        {noti.actor.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                       <NotificationIcon type={noti.type} />
                    </div>
                  )}
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
        <DropdownMenuItem
          className="justify-center cursor-pointer text-red-400 hover:text-red-300 focus:bg-zinc-800"
          onClick={viewAll}
        >
          Xem tất cả thông báo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}