/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SearchBar } from "@/components/common/search-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Flag
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { Eye, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_BACKDROP = "/images/placeholder-backdrop.png";
const DEFAULT_AVATAR = "/images/placeholder-avatar.png";

interface User {
  id: string;
  maUser: string;
  username: string;
  fullName: string;
  email: string;
  lastLogin: string;
  status: "active" | "inactive" | "locked";
  avatarUrl?: string;
  role?: string;
  type?: string;
  isFlagged?: boolean;
}

const UserDetailCard = ({ user, onStatusChange }: { user: User | null, onStatusChange: (newStatus: "active" | "inactive" | "locked") => void }) => {
  const router = useRouter();
  if (!user) {
    return (
      <Card className="bg-[#262626] border-slate-800 text-white p-4 h-full">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <span className="text-gray-400 text-sm">
            Chọn một người dùng để xem chi tiết
          </span>
        </CardContent>
      </Card>
    );
  }

  const isLocked = user.status === 'locked';
  const backgroundImageUrl = user.avatarUrl || DEFAULT_BACKDROP;
  const handleToggleLock = async () => {
    const newStatus = isLocked ? 'active' : 'locked';
    try {
        await apiClient.put(`/profile/admin/users/${user.id}/status`, { status: newStatus });
        toast.success(isLocked ? "Đã kích hoạt user" : "Đã khóa user");
        onStatusChange(newStatus);
    } catch (e) {
        toast.error("Lỗi thao tác");
    }
}

  return (
    <Card className="bg-[#262626] border-slate-800 text-white flex flex-col h-full overflow-hidden">
      <CardContent className="p-0 flex flex-col items-center flex-1 overflow-y-auto no-scrollbar">
        <div className="relative w-full h-48 flex-shrink-0"> 
          <div className="absolute inset-0">
            <Image
              src={backgroundImageUrl}
              alt="User background"
              fill
              className="object-cover opacity-50" 
              sizes="450px" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_BACKDROP;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#262626] via-transparent to-transparent"></div>
          </div>

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10"> 
            <Avatar className="w-24 h-24 border-4 border-[#262626] bg-slate-700"> 
              <AvatarImage src={user.avatarUrl || DEFAULT_AVATAR} alt={user.fullName} />
              <AvatarFallback className="text-2xl bg-slate-700 text-white">
                {user.fullName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="h-16 flex-shrink-0"></div>
        <h2 className="text-xl font-semibold text-center flex-shrink-0">{user.fullName}</h2>
        <p className="text-xs text-gray-500 mb-6">@{user.username}</p>

        <div className="w-full px-6 space-y-4">
            <div className="bg-[#1F1F1F] p-4 rounded-lg space-y-3 border border-slate-700/50">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Vai trò:</span>
                    <span className="font-medium text-white">{user.role || 'User'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Trạng thái:</span>
                    <span className={cn("font-medium", 
                        user.status === 'active' ? "text-green-400" : 
                        user.status === 'locked' ? "text-red-400" : "text-yellow-400"
                    )}>
                        {user.status === 'active' ? 'Hoạt động' : user.status === 'locked' ? 'Đã khóa' : 'Không hoạt động'}
                    </span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Gắn cờ:</span>
                    <span className={cn("font-medium", user.isFlagged ? "text-red-500" : "text-gray-500")}>
                        {user.isFlagged ? "Có" : "Không"}
                    </span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between text-sm">
                    <span className="text-gray-400">Đăng nhập cuối:</span>
                    <span className="text-white text-xs">{user.lastLogin}</span>
                </div>
            </div>
            
            <div className="space-y-2">
                <span className="text-xs text-gray-500 uppercase font-bold">Email liên hệ</span>
                <div className="bg-[#1F1F1F] p-3 rounded-md text-sm text-gray-300 truncate border border-slate-700/50">
                    {user.email}
                </div>
            </div>
        </div>

        <div className="flex-grow min-h-[1rem]"></div>

        <div className="w-full flex-shrink-0 mt-auto px-4 pb-4">
            <div className="border-t border-slate-700 my-6 w-full"></div>
            <div className="w-full space-y-3">
              <Button
              variant="outline"
              className="w-full border-green-600 text-green-500 hover:bg-green-600 hover:text-white"
              onClick={() => router.push(`/admin/user-management/${user.id}`)}
            >
              Xem chi tiết thông tin tài khoản
            </Button>
              <Button 
                  className={cn(
                      "w-full transition-colors duration-200",
                      isLocked 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-red-600 hover:bg-red-700 text-white"   
                  )}
                  onClick={handleToggleLock}
              >
                  {isLocked ? (
                      <><Unlock className="w-4 h-4 mr-2" /> Kích hoạt</>
                  ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Khóa tài khoản</>
                  )}
              </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UserListSkeleton = () => (

    <div className="flex-grow overflow-hidden">
        <Card className="h-full overflow-hidden bg-[#262626] border-slate-800 text-white">
            <div className="overflow-y-auto h-full">
                <Table>
                    <TableHeader className="sticky top-0 bg-[#262626] z-10">
                        <TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="text-white">Mã User</TableHead>
                            <TableHead className="text-white">Username</TableHead>
                            <TableHead className="text-white">Tên người dùng</TableHead>
                            <TableHead className="text-white">Vai trò</TableHead>
                            <TableHead className="text-white">Đăng nhập gần nhất</TableHead>
                            <TableHead className="text-white">Trạng thái</TableHead>
                            <TableHead className="text-white text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {Array.from({ length: 15 }).map((_, i) => (
                        <TableRow key={i} className="border-slate-800">
                        <TableCell><Skeleton className="h-4 w-12 bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32 bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40 bg-slate-700" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-28 rounded-full bg-slate-700" /></TableCell>
                        <TableCell className="text-right">
                            <Skeleton className="h-8 w-8 rounded-md bg-slate-700 ml-auto" />
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    </div>
);
export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("lastLoginDesc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      const params = {
        page: currentPage,
        take: 15,
        q: searchTerm,
        sortBy: sortBy,
        flagged: showFlaggedOnly,
      };
      const res = await apiClient.get('/profile/admin/users', { params });
      
      const mappedUsers = res.data.data.map((u: any) => ({
        id: u.id,
        maUser: u.id.substring(0, 8).toUpperCase(), 
        username: u.username,
        fullName: u.display_name,
        email: u.email,
        lastLogin: u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('vi-VN') : 'Chưa đăng nhập',
        status: u.status, // active, inactive, locked
        avatarUrl: u.avatar_url,
        role: u.role?.name,
        isFlagged: u.is_flagged
      }));

      setUsers(mappedUsers);
      setTotalPages(res.data.pagination.totalPages);
      
      if (!selectedUser && mappedUsers.length > 0) setSelectedUser(mappedUsers[0]);
      
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchUsers();
    }, 500); // Debounce 500ms
    return () => clearTimeout(timer);
  }, [searchTerm, sortBy, showFlaggedOnly, currentPage]);

  const handleQuickToggleFlag = async (user: User, e: React.MouseEvent) => {
      e.stopPropagation(); 
      const toastId = toast.loading("Đang cập nhật...");

      try {
          const res = await apiClient.put(`/profile/admin/users/${user.id}/flag`);
          const newFlagStatus = res.data.isFlagged;

          setUsers(prevUsers => prevUsers.map(u => 
              u.id === user.id ? { ...u, isFlagged: newFlagStatus } : u
          ));

          if (selectedUser?.id === user.id) {
              setSelectedUser(prev => prev ? { ...prev, isFlagged: newFlagStatus } : null);
          }

          toast.success(res.data.message, { id: toastId });
      } catch (err) {
          toast.error("Lỗi cập nhật cờ", { id: toastId });
      }
  };

  const handleStatusChange = (newStatus: "active" | "inactive" | "locked") => {
    if (selectedUser) {
      const updatedUser = { ...selectedUser, status: newStatus };
      setSelectedUser(updatedUser);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === selectedUser.id ? updatedUser : u))
      );
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFlag = !showFlaggedOnly || user.isFlagged;
    return matchesSearch && matchesFlag;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (sortBy === 'nameAsc') {
          return a.fullName.localeCompare(b.fullName);
      } else if (sortBy === 'nameDesc') {
          return b.fullName.localeCompare(a.fullName);
      }
      return 0;
  });

  const fixedHeight = "h-[calc(100vh-theme(space.16)-theme(space.24))]"; 


  return (
    <div className={`flex w-full gap-6 ${fixedHeight}`}>
      <div className="flex flex-1 flex-col space-y-6 min-h-0"> 

        <h1 className="text-2xl font-bold text-white flex-shrink-0">Danh sách tài khoản người dùng</h1>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#262626] p-4 rounded-lg border border-slate-800 flex-shrink-0">
           <div className="w-full md:w-auto md:flex-1 md:max-w-md">
             <SearchBar
               placeholder="Tìm kiếm người dùng..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="flagged-switch" className="text-gray-300">Đã gắn cờ</label>
                <Switch
                  id="flagged-switch"
                  checked={showFlaggedOnly}
                  onCheckedChange={setShowFlaggedOnly}
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] bg-[#1a1b1f] border-0 text-white rounded-xl h-10 sm:h-12 focus:ring-0">
                  <SelectValue placeholder="Sắp xếp theo..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1b1f] border border-slate-700 text-white">
                  <SelectItem value="lastLoginDesc">Đăng nhập gần nhất</SelectItem>
                  <SelectItem value="nameAsc">Tên người dùng (A-Z)</SelectItem>
                  <SelectItem value="nameDesc">Tên người dùng (Z-A)</SelectItem>
                </SelectContent>
              </Select>
           </div>
        </div>

        <div className="flex-grow overflow-hidden min-h-0">
             {loading ? (
                <UserListSkeleton /> 
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-red-500 bg-[#262626] border border-red-800 rounded-md p-6">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>Lỗi: {error}</p>
                </div>
            ) : sortedUsers.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-[#262626] border border-slate-800 rounded-md p-6">
                   <p>Không tìm thấy người dùng nào.</p>
                 </div>
            ) : (
                <Card className="h-full overflow-hidden bg-[#262626] border-slate-800 text-white">
                  <div className="h-full overflow-y-auto">
                    <Table className="relative w-full"> 
                        <TableHeader className="sticky top-0 bg-[#262626] z-10">
                            <TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="text-white">Mã User</TableHead>
                            <TableHead className="text-white">Username</TableHead>
                            <TableHead className="text-white">Tên người dùng</TableHead>
                            <TableHead className="text-white">Vai trò</TableHead>
                            <TableHead className="text-white">Đăng nhập gần nhất</TableHead>
                            <TableHead className="text-white">Trạng thái</TableHead>
                            <TableHead className="text-white text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedUsers.map((user) => (
                            <TableRow
                                key={user.id}
                                className={`border-slate-800 hover:bg-slate-800/50 cursor-pointer ${selectedUser?.id === user.id ? 'bg-slate-700/60' : ''}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <TableCell className="font-medium">{user.maUser}</TableCell>
                                <TableCell className="text-gray-300">{user.username}</TableCell>
                                <TableCell className="text-gray-300">{user.fullName}</TableCell>
                                <TableCell>
                                  <span className={cn(
                                      "text-xs px-2 py-1 rounded font-medium border",
                                      user.role === 'Admin' 
                                          ? "bg-purple-500/10 text-purple-400 border-purple-500/50" 
                                          : "bg-slate-800 text-slate-400 border-slate-700"
                                  )}>
                                      {user.role || 'User'}
                                  </span>
                              </TableCell>
                                <TableCell className="text-gray-300 text-xs">{user.lastLogin}</TableCell>
                                <TableCell>
                                <span className={`flex items-center text-xs px-2 py-1 rounded-full w-fit ${
                                    user.status === 'active' ? 'bg-green-900/50 text-green-400' :
                                    user.status === 'inactive' ? 'bg-yellow-900/50 text-yellow-400' :
                                    'bg-red-900/50 text-red-400'
                                }`}>
                                    {user.status === 'active' && <CheckCircle className="w-3 h-3 mr-1"/>}
                                    {user.status !== 'active' && <XCircle className="w-3 h-3 mr-1"/>}
                                    {user.status === 'active' ? 'Hoạt động' : user.status === 'inactive' ? 'Không hoạt động' : 'Đã khóa'}
                                </span>
                                </TableCell>
                                <TableCell className="text-right">
                                <div className="flex justify-end items-center gap-1">
                                  <Button 
                                      variant="ghost" size="icon" 
                                      className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                      title="Xem chi tiết"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(`/admin/user-management/${user.id}`);
                                      }}
                                  >
                                      <Eye className="h-4 w-4" />
                                  </Button>
                                  
                                  <Button 
                                            variant="ghost" size="icon" 
                                            className={cn("h-8 w-8 hover:bg-slate-800", user.isFlagged ? "text-red-500" : "text-gray-400")}
                                            title={user.isFlagged ? "Bỏ cờ (Tài khoản sạch)" : "Gắn cờ (Tài khoản vi phạm)"}
                                            onClick={(e) => handleQuickToggleFlag(user, e)}
                                        >
                                             <Flag className={cn("h-4 w-4", user.isFlagged && "fill-current")} />
                                        </Button>
                              </div>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </div>
                </Card>
            )}
        </div>
      </div>
      <div className={`hidden lg:block lg:w-80 xl:w-96 2xl:w-[450px] flex-shrink-0 ${fixedHeight}`}>
          <UserDetailCard user={selectedUser} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
}