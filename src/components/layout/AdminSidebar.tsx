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
  Book,
  MessageSquare,
  BoxIcon,
  ChevronLeft,
  ChevronRight,
  Bell,
  Tag,
  Globe,
  Database,
  ChevronDown 
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavGroupConfig = {
  title?: string;
  items: NavItem[];
};

const navGroups: NavGroupConfig[] = [
  {
    items: [
      { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutGrid },
      { id: "report", label: "Báo cáo thống kê", href: "/admin/report", icon: Book },
    ]
  },
  {
    title: "Quản lý Phim",
    items: [
      { id: "storage", label: "Kho phim", href: "/admin/movie-storage", icon: BoxIcon },
      { id: "movies", label: "Quản lý phim", href: "/admin/movie-management", icon: Film },
      { id: "banner", label: "Quản lý banner", href: "/admin/banner-management", icon: Settings },
    ]
  },
  {
    title: "Quản lý Cộng đồng",
    items: [
      { id: "users", label: "Quản lý user", href: "/admin/user-management", icon: Users },
      { id: "comment", label: "Quản lý bình luận", href: "/admin/comment-management", icon: MessageSquare },
      { id: "notification", label: "Quản lý thông báo", href: "/admin/notification-management", icon: Bell },
    ]
  },
];

const masterDataNavItems = [
  {
    id: "genres", 
    label: "Thể loại",
    href: "/admin/master-data/genres",
    icon: Tag,
  },
  {
    id: "countries",
    label: "Quốc gia",
    href: "/admin/master-data/countries",
    icon: Globe,
  },
  {
    id: "people",
    label: "Diễn viên / Đạo diễn",
    href: "/admin/master-data/people",
    icon: Users,
  },
];

interface NavGroupProps {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
  active: string;
  open: boolean; 
  isExpanded: boolean; 
  onToggleExpand: () => void;
  onClick: (id: string) => void;
}

const NavGroup = ({
  label,
  icon: Icon,
  items,
  active,
  open,
  isExpanded,
  onToggleExpand,
  onClick,
}: NavGroupProps) => {
  const isChildActive = items.some((item) => active === item.id);

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onToggleExpand}
        className={clsx(
          "flex items-center w-full rounded-md px-2 py-2 transition-colors duration-150 whitespace-nowrap group select-none",
          isChildActive ? "text-white bg-slate-800/50" : "text-slate-200 hover:bg-slate-800"
        )}
        title={!open ? label : undefined}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />

        {open && (
          <div className="ml-3 flex-1 flex items-center justify-between overflow-hidden">
            <span className="truncate text-md font-medium">{label}</span>
            <ChevronDown
              className={clsx(
                "h-4 w-4 transition-transform duration-200 text-slate-400",
                isExpanded ? "rotate-180" : ""
              )}
            />
          </div>
        )}
      </button>

      <div
        className={clsx(
          "overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-1",
          isExpanded && open ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
        )}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => onClick(item.id)}
            className={clsx(
              "flex items-center gap-3 w-full text-sm rounded-md px-2 py-2 transition-colors duration-150 whitespace-nowrap pl-10", // pl-10 để thụt đầu dòng
              active === item.id
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            )}
          >
            {open && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
};

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
  avatarUrl = "/images/placeholder-avatar.png",
  userName = "Administrator",
  defaultActive = "dashboard",
  defaultOpen = true,
  open: openProp,
  onToggle,
  onSelect,
}: AdminSidebarProps) {
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  const open = typeof openProp === "boolean" ? openProp : internalOpen;
  
  const [isMasterDataExpanded, setIsMasterDataExpanded] = useState(false);

  const [active, setActive] = useState<string>(defaultActive);
  const pathname = usePathname();

  const { user, logout } = useAuth();

  useEffect(() => {
    if (!pathname) return;

    const allNavItems = navGroups.flatMap((group) => group.items);
    const matched = allNavItems.find((n) => {
      if (n.href === "/admin") return pathname === "/admin" || pathname === "/admin/";
      return pathname.startsWith(n.href);
    });

    if (matched) {
      setActive(matched.id);
    } else {
      const matchedMaster = masterDataNavItems.find((n) => pathname.startsWith(n.href));
      if (matchedMaster) {
        setActive(matchedMaster.id);
        setIsMasterDataExpanded(true); 
      }
    }
  }, [pathname]);

  const [showLabels, setShowLabels] = useState<boolean>(open);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      t = setTimeout(() => setShowLabels(true), 160);
    } else {
      setShowLabels(false);
      setIsMasterDataExpanded(false);
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
      await logout();
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error("Lỗi khi gọi API đăng xuất:", error);
      toast.error("Đã xảy ra lỗi khi đăng xuất.");
    }
  };

  const currentUserName = user?.username || userName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUserAvatar = (user as any)?.avatarUrl || avatarUrl;

  return (
    <aside
      className={clsx(
        "fixed top-0 left-0 h-screen bg-[#262626] text-white flex flex-col p-4 border-r border-slate-800 z-40 transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-16",
        className
      )}
      aria-hidden={false}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUserAvatar} alt={currentUserName} />
            <AvatarFallback>
              {currentUserName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {showLabels && (
            <div className="overflow-hidden transition-opacity duration-150">
              <div className="text-md font-medium whitespace-nowrap">{currentUserName}</div>
              <div className="text-sm text-slate-300 whitespace-nowrap">Administrator</div>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-6 flex-1 overflow-y-auto no-scrollbar">
        <ul className="flex flex-col gap-1">
          {navGroups.map((group, groupIndex) => (
            <li key={group.title || `group-${groupIndex}`}>
              {groupIndex > 0 && (
                <div
                  className={clsx(
                    "my-2 h-px bg-slate-700",
                    !showLabels && "mx-2"
                  )}
                />
              )}

              {group.title && showLabels && (
                <h3 className="px-2 pt-1 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                  {group.title}
                </h3>
              )}

              <ul className="flex flex-col gap-1">
                {group.items.map(({ id, label, href, icon: Icon }) => {
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
                          isActive
                            ? "bg-slate-800 text-white"
                            : "text-slate-200 hover:bg-slate-800"
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {showLabels && <span className="truncate">{label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}

          {masterDataNavItems.length > 0 && (
            <>
              {showLabels && (
                <li className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase mt-3">
                  Danh mục
                </li>
              )}
              {!showLabels && <div className="my-2 h-px bg-slate-700" />}

              <NavGroup
                label="Danh mục chung"
                icon={Database}
                items={masterDataNavItems}
                active={active}
                open={showLabels}
                onClick={handleSelect}
                isExpanded={isMasterDataExpanded}
                onToggleExpand={() => {
                  if (!showLabels) {
                    handleToggle();
                    setTimeout(() => setIsMasterDataExpanded(true), 200);
                  } else {
                    setIsMasterDataExpanded(!isMasterDataExpanded);
                  }
                }}
              />
            </>
          )}
        </ul>
      </nav>

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

      <Button
        variant="secondary"
        size="icon"
        onClick={handleToggle}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 rounded-full shadow-md bg-slate-800 hover:bg-slate-700 border border-slate-600"
      >
        {open ? (
          <ChevronLeft className="h-4 w-4 text-white" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white" />
        )}
      </Button>
    </aside>
  );
}