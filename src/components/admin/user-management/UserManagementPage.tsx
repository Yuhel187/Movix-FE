"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Search,
  MoreHorizontal,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash, 
  ArrowRight 
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";


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

const baseMockUsers: User[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `user-${i + 1}`,
  maUser: `U${101 + i}`,
  username: `khainq${205 + i}`,
  fullName: `Nguyễn Quang Khải ${i + 1}`,
  email: `khainq${205 + i}@email.com`,
  lastLogin: i % 3 === 0 ? "01/01/2025 (30 ngày trước)" : `khainq${205+i}@gmail.com`,
  status: i % 4 === 0 ? "locked" : i % 3 === 0 ? "inactive" : "active",
  avatarUrl: i % 5 === 0 ? "/images/logo.png" : undefined,
  role: "User",
  type: "Người dùng thông thường",
  isFlagged: i % 6 === 0,
}));

const mockUsers: User[] = Array.from({ length: 3 }, (_, k) =>
    baseMockUsers.map((user, j) => ({
        ...user,
        id: `user-${k}-${j+1}`,
        maUser: `U${101 + k*15 + j}`,
        username: `user${k}${j}`,
        fullName: `${user.fullName} (${k+1})`,
        email: `user${k}${j}@email.com`,
    }))
).flat();
const UserDetailCard = ({ user }: { user: User | null }) => {
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
  const backgroundImageUrl = user.avatarUrl || "/images/background-homepage.jpg"; 

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
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#262626] via-transparent to-transparent"></div>
          </div>

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10"> 
            <Avatar className="w-24 h-24 border-4 border-[#262626] bg-slate-700"> 
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
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
        <div className="w-full mt-6 space-y-3 text-sm flex-shrink-0 px-4"> 
           <div className="flex justify-between">
             <span className="text-gray-400">Vai trò:</span>
             <span>{user.role || 'N/A'}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-400">Loại:</span>
             <span>{user.type || 'N/A'}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-400">Email:</span>
             <span className="truncate max-w-[180px] sm:max-w-[220px]">{user.email}</span> 
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
                variant={isLocked ? "default": "destructive"}
                className={`w-full ${isLocked ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                {isLocked ? "Kích hoạt" : "Khóa tài khoản"}
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

  useEffect(() => {
      const loadUsers = async () => {
          setLoading(true);
          setError(null);
          try {
              await new Promise(resolve => setTimeout(resolve, 1000));
              setUsers(mockUsers);
              if (mockUsers.length > 0) {
                  setSelectedUser(mockUsers[0]);
              }
          } catch (err) {
              setError("Failed to load users.");
              console.error(err);
          } finally {
              setLoading(false);
          }
      };
      loadUsers();
  }, []);

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
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
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
          <UserDetailCard user={selectedUser} />
      </div>
    </div>
  );
}