"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutGrid,
  Film,
  Users,
  Settings,
  LogOut,
  BoxIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutGrid },
  { id: "movies", label: "Quản lý phim", href: "/admin/movie-management", icon: Film },
  { id: "storage", label: "Kho phim", href: "/admin/movie-storage", icon: BoxIcon },
  { id: "users", label: "Quản lý user", href: "/admin/user-management", icon: Users },
  { id: "settings", label: "Cấu hình", href: "/admin/config-admin", icon: Settings },
];

interface AdminSidebarProps {
  className?: string;
  avatarUrl?: string;
  userName?: string;
  defaultActive?: string;
  defaultOpen?: boolean;
  open?: boolean; 
  onToggle?: (open: boolean) => void;
  onSelect?: (id: string) => void;
}

export default function AdminSidebar({
  className = "",
  avatarUrl = "/avatar.jpg",
  userName = "Administrator",
  defaultActive = "dashboard",
  defaultOpen = true,
  open: openProp,
  onToggle,
  onSelect,
}: AdminSidebarProps) {

  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  const open = typeof openProp === "boolean" ? openProp : internalOpen;

  const [active, setActive] = useState<string>(defaultActive);
  const pathname = usePathname();

  const { user, logout } = useAuth();

  useEffect(() => {
    if (!pathname) return;
    const matched = navItems.find((n) => {
      if (n.href === "/admin") return pathname === "/admin" || pathname === "/admin/";
      return pathname.startsWith(n.href);
    });
    if (matched) setActive(matched.id);
  }, [pathname]);

  const [showLabels, setShowLabels] = useState<boolean>(open);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      t = setTimeout(() => setShowLabels(true), 160);
    } else {
      setShowLabels(false);
    }
    return () => t && clearTimeout(t);
  }, [open]);

  const handleToggle = () => {
    if (typeof openProp === "boolean") {
      onToggle?.(!openProp);
    } else {
      setInternalOpen((v) => {
        const next = !v;
        onToggle?.(next);
        return next;
      });
    }
  };

  const handleSelect = (id: string) => {
    setActive(id);
    onSelect?.(id);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await apiClient.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API đăng xuất:", error);
    } finally {
      logout();
      toast.success("Đăng xuất thành công!");
    }
  };

  const currentUserName = user?.username || userName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUserAvatar = (user as any)?.avatarUrl || avatarUrl; 
  const userFallback = currentUserName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside
      className={clsx(
        "fixed top-0 left-0 h-screen bg-[#262626] text-white flex flex-col p-4 border-r border-slate-800 z-40 transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-16",
        className
      )}
      aria-hidden={false}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback>
              {userName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {showLabels && (
            <div className="overflow-hidden transition-opacity duration-150">
              <div className="text-md font-medium whitespace-nowrap">{userName}</div>
              <div className="text-sm text-slate-300 whitespace-nowrap">Administrator</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1 overflow-hidden">
        <ul className="flex flex-col gap-3">
          {navItems.map(({ id, label, href, icon: Icon }) => {
            const isActive =
              id === active ||
              pathname === href ||
              (href !== "/admin" && pathname?.startsWith(href));
            return (
              <li key={id}>
                <Link
                    href={href}
                    onClick={() => handleSelect(id)}
                    title={!showLabels ? label : undefined}
                    className={clsx(
                        "flex items-center gap-3 w-full text-md rounded-md px-2 py-2 transition-colors duration-150 whitespace-nowrap",
                        isActive ? "bg-slate-800 text-white" : "text-slate-200 hover:bg-slate-800"
                    )}
                    >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {showLabels && <span className="truncate">{label}</span>}
                    </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <div className="my-4 h-px bg-slate-700" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white hover:bg-red-600 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {showLabels && <span>Đăng xuất</span>}
        </Button>
      </div>

      {/* Toggle Button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={handleToggle}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 rounded-full shadow-md bg-slate-800 hover:bg-slate-700 border border-slate-600"
      >
        {open ? <ChevronLeft className="h-4 w-4 text-white" /> : <ChevronRight className="h-4 w-4 text-white" />}
      </Button>
    </aside>
  );
}
