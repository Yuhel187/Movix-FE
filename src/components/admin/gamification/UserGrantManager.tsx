"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Badge as BadgeUI
} from "@/components/ui/badge";import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";import { 
  Search, 
  Trash2, 
  PlusCircle, 
  Trophy, 
  User as UserIcon,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock Data - Duplicate from AchievementManager for standalone demo
const MOCK_ALL_ACHIEVEMENTS = [
  { id: "1", name: "Tân Binh", icon_url: "https://via.placeholder.com/40", reward_xp: 50 },
  { id: "2", name: "Mọt Phim", icon_url: "https://via.placeholder.com/40", reward_xp: 200 },
  { id: "3", name: "Thợ Săn XP", icon_url: "https://via.placeholder.com/40", reward_xp: 500 },
  { id: "4", name: "Khách Quen", icon_url: "https://via.placeholder.com/40", reward_xp: 150 },
  { id: "5", name: "Bình Luận Viên", icon_url: "https://via.placeholder.com/40", reward_xp: 100 },
];

const MOCK_USERS = [
  {
    id: "u1",
    username: "nguyenvana",
    displayName: "Nguyen Van A",
    email: "nguyenvana@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=u1",
    xp: 1250,
    achievements: ["1", "3"], // Has "Tân Binh" and "Thợ Săn XP"
  },
  {
    id: "u2",
    username: "lethib",
    displayName: "Le Thi B",
    email: "lethib@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=u2",
    xp: 450,
    achievements: ["1"],
  },
  {
    id: "u3",
    username: "admin_test",
    displayName: "Admin User",
    email: "admin@movix.com",
    avatarUrl: "",
    xp: 9999,
    achievements: ["1", "2", "3", "4", "5"],
  },
];

export default function UserGrantManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [users, setUsers] = useState(MOCK_USERS);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string>("");
  const [revokeId, setRevokeId] = useState<string | null>(null);

  React.useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser]);

  const handleSearch = () => {
    // Basic mock search
    const found = users.find(
      (u) =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
        setSelectedUser(found);
    } else {
        toast.error("Không tìm thấy người dùng");
        setSelectedUser(null);
    }
  };

  const handleGrant = () => {
    if (!selectedUser || !selectedAchievementId) return;

    if (selectedUser.achievements.includes(selectedAchievementId)) {
      toast.error("Người dùng đã sở hữu danh hiệu này");
      return;
    }

    const updatedUser = {
      ...selectedUser,
      achievements: [...selectedUser.achievements, selectedAchievementId],
    };

    setUsers(users.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
    setSelectedUser(updatedUser);
    setSelectedAchievementId(""); // Reset selection
    toast.success(`Đã cấp danh hiệu cho ${selectedUser.displayName}`);
  };

  const confirmRevoke = (achievementId: string) => {
    setRevokeId(achievementId);
  };

  const executeRevoke = () => {
    if (!selectedUser || !revokeId) return;

    const updatedUser = {
      ...selectedUser,
      achievements: selectedUser.achievements.filter((id) => id !== revokeId),
    };

    setUsers(users.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
    setSelectedUser(updatedUser);
    toast.success("Đã thu hồi danh hiệu");
    setRevokeId(null);
  };

  // Filter achievements user does NOT have for the select dropdown
  const availableAchievements = MOCK_ALL_ACHIEVEMENTS.filter(
    (ach) => !selectedUser?.achievements.includes(ach.id)
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Left Panel: Search & User List (Simplified to just search for now) */}
      <div className="w-1/3 flex flex-col gap-4">
        <Card className="bg-[#1F1F1F] border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Tìm kiếm người dùng</CardTitle>
            <CardDescription className="text-gray-400">
              Nhập username hoặc email để tìm kiếm.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Username hoặc email..."
                className="bg-[#262626] border-slate-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick list of recent users (Mock) */}
            <div className="mt-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Gợi ý</p>
                <div className="space-y-2">
                    {users.map(u => (
                        <div 
                            key={u.id} 
                            onClick={() => setSelectedUser(u)}
                            className={cn(
                                "flex items-center p-2 rounded-md cursor-pointer hover:bg-[#262626] transition-colors border border-transparent",
                                selectedUser?.id === u.id ? "bg-[#262626] border-purple-500/50" : ""
                            )}
                        >
                            <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage src={u.avatarUrl || undefined} />
                                <AvatarFallback>{u.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-white">{u.displayName}</p>
                                <p className="text-xs text-gray-500">@{u.username}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: User Details & Management */}
      <div className="flex-1">
        {!selectedUser ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-[#1F1F1F] rounded-lg border border-slate-800 border-dashed">
            <UserIcon className="h-16 w-16 mb-4 opacity-20" />
            <p>Chọn một người dùng để quản lý danh hiệu</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Info Card */}
            <Card className="bg-[#1F1F1F] border-slate-800 text-white">
              <CardContent className="p-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-purple-500/20">
                    <AvatarImage src={selectedUser.avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl">{selectedUser.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUser.displayName}</h2>
                    <p className="text-gray-400">@{selectedUser.username}</p>
                    <div className="flex items-center mt-2 gap-3">
                        <BadgeUI className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20 px-3 py-1">
                            <span className="font-bold mr-1">{selectedUser.xp}</span> XP
                        </BadgeUI>
                        <BadgeUI variant="outline" className="text-gray-400 border-slate-700">
                            {selectedUser.achievements.length} Danh hiệu
                        </BadgeUI>
                    </div>
                  </div>
                </div>
                
                {/* Grant Action */}
                <div className="flex items-center gap-2 bg-[#262626] p-2 rounded-lg border border-slate-700">
                    <Select value={selectedAchievementId} onValueChange={setSelectedAchievementId}>
                        <SelectTrigger className="w-[200px] bg-[#141414] border-slate-700 text-white">
                            <SelectValue placeholder="Chọn danh hiệu..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#262626] border-slate-700 text-white">
                            {availableAchievements.length > 0 ? (
                                availableAchievements.map(ach => (
                                    <SelectItem key={ach.id} value={ach.id}>
                                        {ach.name} (+{ach.reward_xp} XP)
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-sm text-gray-500 text-center">Đã sở hữu tất cả</div>
                            )}
                        </SelectContent>
                    </Select>
                    <Button 
                        onClick={handleGrant} 
                        disabled={!selectedAchievementId}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Cấp phát
                    </Button>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Grid */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-purple-500" />
                    Danh hiệu đã sở hữu
                </h3>
                
                {selectedUser.achievements.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-[#1F1F1F] rounded-lg border border-slate-800 border-dashed">
                        Chưa có danh hiệu nào.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MOCK_ALL_ACHIEVEMENTS.filter(ach => selectedUser.achievements.includes(ach.id)).map(ach => (
                            <div key={ach.id} className="group relative flex items-center p-4 bg-[#1F1F1F] rounded-lg border border-slate-800 hover:border-purple-500/50 transition-colors">
                                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mr-4 border border-slate-700 group-hover:bg-slate-700">
                                     {/* Mock Image/Icon */}
                                     {/* <img src={ach.icon_url} alt={ach.name} className="h-8 w-8" /> */}
                                     <Award className="h-6 w-6 text-yellow-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-white">{ach.name}</h4>
                                    <p className="text-xs text-gray-400">+{ach.reward_xp} XP</p>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-opacity"
                                    onClick={() => confirmRevoke(ach.id)}
                                    title="Thu hồi danh hiệu"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!revokeId} onOpenChange={(open) => !open && setRevokeId(null)}>
        <AlertDialogContent className="bg-[#1F1F1F] border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận thu hồi danh hiệu</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn thu hồi danh hiệu này khỏi người dùng <b>{selectedUser?.displayName}</b>?
              Hành động này sẽ trừ điểm thành tích tương ứng nếu có cấu hình.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-gray-300 hover:bg-[#262626] hover:text-white">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={executeRevoke} className="bg-red-600 hover:bg-red-700 text-white border-0">
              Thu hồi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
