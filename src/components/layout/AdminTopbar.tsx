"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  MoreVertical, 
  LogOut, 
  Home, 
  User as UserIcon, 
  AlertTriangle, 
  CheckCircle,
  ShieldAlert
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AdminNotification {
  id: string;
  type: "flagged" | "system" | "report";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

interface AdminTopbarProps {
  userName?: string;
  avatarUrl?: string;
}

const MOCK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "1",
    type: "flagged",
    title: "Người dùng bị gắn cờ",
    message: "Hệ thống AI phát hiện user 'Khải Dev' spam bình luận độc hại.",
    time: "5 phút trước",
    read: false,
    link: "/admin/user-management/user-1"
  },
  {
    id: "2",
    type: "report",
    title: "Báo cáo nội dung",
    message: "Có 3 bình luận mới bị người dùng báo cáo vi phạm.",
    time: "1 giờ trước",
    read: false,
    link: "/admin/comment-management"
  },
  {
    id: "3",
    type: "system",
    title: "Hệ thống ổn định",
    message: "Backup dữ liệu định kỳ thành công.",
    time: "1 ngày trước",
    read: true,
  }
];

export default function AdminTopbar({
  userName,
  avatarUrl,
}: AdminTopbarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>(MOCK_NOTIFICATIONS);

  const displayName = userName || user?.display_name || user?.username || "Admin";
  const displayAvatar = avatarUrl || user?.avatarUrl || "/images/placeholder-avatar.png";

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Đã đánh dấu đọc tất cả");
  };

  const handleNotificationClick = (notif: AdminNotification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất");
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 py-3 px-4 bg-[#1F1F1F] border border-slate-800 mb-5 rounded-xl shadow-sm">
      <div className="flex-1">
        <h2 className="font-bold text-lg text-white hidden md:block">
          Trình quản lý Admin
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-[#1F1F1F]" />
              )}
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-80 bg-[#1A1A1A] border-slate-700 text-white p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <span className="font-semibold text-sm">Thông báo hệ thống</span>
              {unreadCount > 0 && (
                <span 
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-400 cursor-pointer hover:underline"
                >
                  Đánh dấu đã đọc
                </span>
              )}
            </div>
            
            <div className="max-h-[300px] overflow-y-auto py-1">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">Không có thông báo mới</div>
              ) : (
                notifications.map((item) => (
                  <DropdownMenuItem 
                    key={item.id}
                    className={cn(
                      "flex flex-col items-start px-4 py-3 cursor-pointer focus:bg-white/5 gap-1",
                      !item.read ? "bg-white/[0.02]" : ""
                    )}
                    onClick={() => handleNotificationClick(item)}
                  >
                    <div className="flex items-center gap-2 w-full">

                      {item.type === 'flagged' && <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />}
                      {item.type === 'report' && <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />}
                      {item.type === 'system' && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                      
                      <span className={cn("text-sm font-medium truncate flex-1", !item.read ? "text-white" : "text-gray-400")}>
                        {item.title}
                      </span>
                      {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 pl-6">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-gray-600 pl-6 mt-1">{item.time}</span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            
            <div className="p-2 border-t border-slate-700 text-center">
              <span className="text-xs text-gray-500 cursor-pointer hover:text-white">Xem tất cả lịch sử</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Separator */}
        <div className="h-6 w-[1px] bg-slate-700 mx-1"></div>

        {/* --- USER PROFILE & ACTIONS --- */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-white leading-none">{displayName}</span>
            <span className="text-[10px] text-blue-400 font-medium mt-1">SUPER ADMIN</span>
          </div>
          
          <Avatar className="h-9 w-9 border border-slate-600">
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback className="bg-slate-700 text-white">AD</AvatarFallback>
          </Avatar>

          {/* Nút 3 chấm (User Menu) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#1A1A1A] border-slate-700 text-white">
              <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                onClick={() => router.push('/movies')}
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Về trang chủ</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-slate-700" />
              
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-400 cursor-pointer hover:bg-red-900/20 focus:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}