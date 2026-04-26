"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import apiClient from "@/lib/apiClient";
import {
  Users,
  Tv,
  Clock,
  PowerOff,
  AlertTriangle,
  Search,
  Lock,
  Unlock,
  Eye,
  MoreHorizontal,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  MessageSquare,
  VolumeX,
  Volume2,
  UserX
} from "lucide-react";

interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  email: string;
}

interface Movie {
  id: string;
  title: string;
  poster_path?: string;
}

interface Episode {
  id: string;
  title: string;
  episode_number: number;
}

interface WatchPartyMember {
  id: string;
  user: User;
  role: "host" | "participant";
  is_online: boolean;
  joined_at: string;
}

interface WatchParty {
  id: string;
  title: string;
  join_code: string | null;
  is_private: boolean;
  is_active: boolean;
  started_at: string | null;
  scheduled_at: string | null;
  host_user: User;
  movie?: Movie;
  episode?: Episode;
  members?: WatchPartyMember[];
  max_participants: number;
  _count?: {
    members: number;
  };
}

interface FlaggedMessage {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

interface MonitoringStats {
  activeRooms: number;
  watchingUsers: number;
  pendingReports: number;
}

// --- Mock Data Generator ---

const MOCK_USERS: User[] = [
  { id: "u1", username: "admin_super", email: "admin@movix.com", avatar_url: "https://github.com/shadcn.png" },
  { id: "u2", username: "movie_fan_99", email: "fan99@gmail.com" },
  { id: "u3", username: "cinema_lover", email: "lover@yahoo.com", avatar_url: "https://github.com/shadcn.png" },
  { id: "u4", username: "casual_viewer", email: "viewer@outlook.com" },
  { id: "u5", username: "critic_pro", email: "critic@movix.com" },
];

const MOCK_MOVIES: Movie[] = [
  { id: "m1", title: "Inception", poster_path: "/images/placeholder-poster.png" }, // Mock paths
  { id: "m2", title: "The Matrix", poster_path: "/images/placeholder-poster.png" },
  { id: "m3", title: "Interstellar", poster_path: "/images/placeholder-poster.png" },
];

const generateMockParties = (count: number): WatchParty[] => {
  return Array.from({ length: count }).map((_, i) => {
    const isPrivate = Math.random() > 0.7;
    const memberCount = Math.floor(Math.random() * 20) + 1;
    const members: WatchPartyMember[] = Array.from({ length: memberCount }).map((__, j) => ({
      id: `m-${i}-${j}`,
      user: MOCK_USERS[j % MOCK_USERS.length],
      role: j === 0 ? "host" : "participant",
      is_online: Math.random() > 0.2, // 80% online
      joined_at: new Date().toISOString(),
    }));

    return {
      id: `wp-${i}`,
      title: `Watch Party #${i + 1} - ${isPrivate ? "Private" : "Public"}`,
      join_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      is_private: isPrivate,
      is_active: true,
      started_at: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Started within last hour
      host_user: MOCK_USERS[i % MOCK_USERS.length],
      movie: MOCK_MOVIES[i % MOCK_MOVIES.length],
      members: members,
      viewer_count: members.filter(m => m.is_online).length,
      max_participants: isPrivate ? 5 : 50,
    };
  });
};

export default function WatchPartyMonitoring() {
  const [parties, setParties] = useState<WatchParty[]>([]);
  const [stats, setStats] = useState<MonitoringStats>({ activeRooms: 0, watchingUsers: 0, pendingReports: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState<WatchParty | null>(null);

  const [isFlaggedMessagesOpen, setIsFlaggedMessagesOpen] = useState(false);
  const [flaggedMessages, setFlaggedMessages] = useState<FlaggedMessage[]>([]);
  const [isResolving, setIsResolving] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "close" | "disband" | null;
    partyId: string | null;
  }>({ open: false, type: null, partyId: null });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [roomsRes, statsRes] = await Promise.all([
        apiClient.get("/watch-party?filter=live"),
        apiClient.get("/watch-party/stats")
      ]);
      setParties(roomsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("Không thể tải dữ liệu giám sát");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Filter Logic
  const filteredParties = parties.filter(party =>
    party.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.join_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.host_user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Actions
  const handleCloseRoom = async (partyId: string) => {
    try {
      await apiClient.put(`/watch-party/${partyId}/end`);
      toast.success("Đã kết thúc phòng thành công");
      fetchData();
      setConfirmDialog({ open: false, type: null, partyId: null });
    } catch (error) {
      toast.error("Lỗi khi kết thúc phòng");
    }
  };

  const handleDisbandRoom = async (partyId: string) => {
    try {
      await apiClient.delete(`/watch-party/${partyId}`);
      toast.success("Đã giải tán phòng thành công");
      fetchData();
      setConfirmDialog({ open: false, type: null, partyId: null });
    } catch (error) {
      toast.error("Lỗi khi giải tán phòng");
    }
  };

  const handleFetchFlaggedMessages = async (partyId: string) => {
    try {
      const res = await apiClient.get(`/watch-party/flagged-messages/${partyId}`);
      setFlaggedMessages(res.data);
      setIsFlaggedMessagesOpen(true);
    } catch (error) {
      toast.error("Không thể tải danh sách tin nhắn vi phạm");
    }
  };

  const handleResolveMessage = async (messageId: string, action: "delete" | "ignore") => {
    setIsResolving(true);
    try {
      await apiClient.patch(`/watch-party/flagged-messages/resolve/${messageId}`, { action });
      setFlaggedMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success(action === "delete" ? "Đã xóa tin nhắn." : "Đã bỏ qua báo cáo.");
    } catch (error) {
      toast.error("Lỗi khi xử lý tin nhắn");
    } finally {
      setIsResolving(false);
    }
  };

  const handleBanUser = async (partyId: string, targetUserId: string) => {
    try {
      await apiClient.patch(`/watch-party/ban/${partyId}`, { targetUserId });
      toast.success("Đã ban người dùng khỏi phòng");
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi ban người dùng");
    }
  };

  const handleMuteUser = async (partyId: string, targetUserId: string, mute: boolean) => {
    try {
      await apiClient.patch(`/watch-party/mute/${partyId}`, { targetUserId, mute });
      toast.success(mute ? "Đã mute người dùng" : "Đã unmute người dùng");
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi thay đổi trạng thái mute");
    }
  };

  const handleOpenDetails = async (party: WatchParty) => {
    try {
      const res = await apiClient.get(`/watch-party/manage/${party.id}`);
      setSelectedParty(res.data);
    } catch (error) {
      toast.error("Không thể tải thông tin chi tiết phòng");
    }
  };

  const openConfirm = (type: "close" | "disband", partyId: string) => {
    setConfirmDialog({ open: true, type, partyId });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giám Sát Watch Party</h1>
          <p className="text-muted-foreground mt-1">Danh sách các phòng xem chung đang hoạt động real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-[#1e1e1e] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng Đang Live</CardTitle>
            <Tv className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRooms}</div>
            <p className="text-xs text-muted-foreground">Active rooms</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e1e1e] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Người Xem</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.watchingUsers}</div>
            <p className="text-xs text-muted-foreground">Real-time participants</p>
          </CardContent>
        </Card>
        {/* <Card className="bg-[#1e1e1e] border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Báo Cáo Chờ Xử Lý</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">Pending AI/User flags</p>
          </CardContent>
        </Card> */}
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Input
          placeholder="Tìm kiếm phòng, mã code, host..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-background"
        />
      </div>

      {/* Main Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Thông Tin Phòng</TableHead>
              <TableHead>Nội Dung</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Thành Viên</TableHead>
              <TableHead>Thời Gian</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-10 w-40 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-8 w-8 rounded-full bg-muted animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredParties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không tìm thấy phòng nào đang hoạt động.
                </TableCell>
              </TableRow>
            ) : (
              filteredParties.map((party) => (
                <TableRow key={party.id}>
                  {/* Room Info */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold truncate max-w-[250px]">{party.title || "Untitled Party"}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs font-mono">{party.join_code}</Badge>
                        {party.is_private ? (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Unlock className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Content Info */}
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{party.movie?.title || "Unknown Movie"}</div>
                      {party.episode && (
                        <span className="text-xs text-muted-foreground">Ep {party.episode?.episode_number}</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Host Info */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={party.host_user?.avatar_url} />
                        <AvatarFallback>{(party.host_user?.username || "??").substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate w-24">{party.host_user?.username || "Unknown"}</span>
                    </div>
                  </TableCell>

                  {/* Participants Info */}
                  <TableCell>
                    <div className="flex items-center gap-2 cursor-pointer hover:underline" onClick={() => handleOpenDetails(party)}>
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold">{party.viewers || 0}</span>
                      <span className="text-muted-foreground text-xs">/ {party.max_participants} max</span>
                    </div>
                  </TableCell>

                  {/* Time Info */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {party.started_at ? (
                        <>
                          <span>{format(new Date(party.started_at), 'HH:mm', { locale: vi })}</span>
                          <span className="text-xs">({Math.floor((Date.now() - new Date(party.started_at).getTime()) / 60000)}m active)</span>
                        </>
                      ) : party.scheduled_at ? (
                        <>
                          <span className="text-yellow-500 font-bold">Lên lịch:</span>
                          <span>{format(new Date(party.scheduled_at), 'HH:mm dd/MM', { locale: vi })}</span>
                        </>
                      ) : (
                        <span>N/A</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {party.is_active ? (
                      <Badge className="bg-green-600 hover:bg-green-700 animate-pulse">Live</Badge>
                    ) : (
                      <Badge variant="secondary">Ended</Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Tác vụ</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenDetails(party)}>
                          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleFetchFlaggedMessages(party.id)} className="text-yellow-500 hover:text-yellow-400">
                          <ShieldAlert className="mr-2 h-4 w-4" /> Tin nhắn vi phạm
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openConfirm("disband", party.id)} className="text-destructive focus:text-destructive font-bold">
                          <AlertTriangle className="mr-2 h-4 w-4" /> Giải tán & Xóa phòng
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Flagged Messages Dialog */}
      <Dialog open={isFlaggedMessagesOpen} onOpenChange={setIsFlaggedMessagesOpen}>
        <DialogContent className="max-w-2xl bg-[#1e1e1e] border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-yellow-500" />
              Tin nhắn bị AI gắn cờ
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Các tin nhắn có dấu hiệu vi phạm tiêu chuẩn cộng đồng được AI nhận diện.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {flaggedMessages.length === 0 ? (
              <div className="text-center py-10 text-slate-500 italic flex flex-col items-center gap-2">
                <MessageSquare className="h-8 w-8 opacity-20" />
                Không có tin nhắn nào bị báo cáo.
              </div>
            ) : (
              flaggedMessages.map((msg) => (
                <div key={msg.id} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9 border border-slate-700">
                      <AvatarImage src={msg.user?.avatar_url} />
                      <AvatarFallback>{(msg.user?.username || "??").substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{msg.user?.username || "Unknown"}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{format(new Date(msg.created_at), "HH:mm:ss")}</span>
                      </div>
                      <p className="text-sm bg-red-500/10 text-red-200 p-2 rounded border border-red-500/20">{msg.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-black"
                      onClick={() => handleResolveMessage(msg.id, "ignore")}
                      disabled={isResolving}
                    >
                      Bỏ qua
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1"
                      onClick={() => handleResolveMessage(msg.id, "delete")}
                      disabled={isResolving}
                    >
                      <Trash2 className="h-4 w-4" /> Xóa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => {
                        if (msg.user?.id && selectedParty?.id) {
                          handleBanUser(selectedParty.id, msg.user.id);
                          handleResolveMessage(msg.id, "delete");
                        }
                      }}
                      disabled={isResolving}
                    >
                      Ban User
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFlaggedMessagesOpen(false)} className="bg-transparent border-slate-700">Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Details & Member Management Dialog */}
      <Dialog open={!!selectedParty} onOpenChange={(open) => !open && setSelectedParty(null)}>
        <DialogContent className="max-w-4xl bg-[#1e1e1e] border-slate-800 text-white p-0 overflow-hidden">
          {selectedParty && (
            <>
              <div className="p-6 pb-2">
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <DialogTitle className="text-2xl font-bold">{selectedParty.title}</DialogTitle>
                    <Badge className="bg-green-600">Live</Badge>
                  </div>
                  <DialogDescription className="text-slate-400">
                    Quản lý thành viên và quyền hạn trong phòng.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  {/* Left: Info */}
                  <div className="space-y-4">
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Mã tham gia</label>
                        <p className="font-mono text-white text-lg font-bold">{selectedParty.join_code || "PUBLIC"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nội dung xem</label>
                        <p className="font-bold text-primary">{selectedParty.movie?.title}</p>
                        {selectedParty.episode && <p className="text-xs text-slate-400">Tập {selectedParty.episode?.episode_number}: {selectedParty.episode?.title}</p>}
                      </div>
                      <div className="pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedParty.host_user?.avatar_url} />
                            <AvatarFallback>{(selectedParty.host_user?.username || "??").substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Chủ phòng</p>
                            <p className="text-sm font-bold">{selectedParty.host_user?.username || "Unknown"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Member List */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Thành viên online ({selectedParty.members?.filter(m => m.is_online).length})</h3>
                      <Badge variant="outline" className="text-[10px] border-slate-700 text-white">Real-time update</Badge>
                    </div>
                    <div className="bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
                      <Table>
                        <TableHeader className="bg-slate-800/50">
                          <TableRow className="border-slate-800">
                            <TableHead className="text-[10px] h-10 text-white">User</TableHead>
                            <TableHead className="text-[10px] h-10 text-white">Vai trò</TableHead>
                            <TableHead className="text-[10px] h-10 text-right text-white">Hành động</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedParty.members?.filter(m => m.is_online).map((member) => (
                            <TableRow key={member.id} className="border-slate-800 hover:bg-slate-800/30">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage src={member.user?.avatar_url} />
                                    <AvatarFallback>{(member.user?.username || "??").substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold">{(member.user as any)?.display_name || member.user?.username || "Unknown"}</span>
                                    <span className="text-[10px] text-slate-500">{member.user?.email || member.user?.username}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={member.role === 'host' ? "bg-primary/20 text-primary border-none" : "bg-slate-800 text-slate-400 border-none"}>
                                  {member.role === 'host' ? 'Chủ phòng' : 'Thành viên'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {member.role !== 'host' && (
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                      title="Mute"
                                      onClick={() => handleMuteUser(selectedParty.id, member.user.id, true)}
                                    >
                                      <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0"
                                      title="Unmute"
                                      onClick={() => handleMuteUser(selectedParty.id, member.user.id, false)}
                                    >
                                      <Volume2 className="h-3.5 w-3.5 text-green-500" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 hover:bg-red-500/10"
                                      title="Ban"
                                      onClick={() => handleBanUser(selectedParty.id, member.user.id)}
                                    >
                                      <UserX className="h-3.5 w-3.5 text-red-500" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="bg-slate-900/60 p-5 border-t border-slate-800">
                <Button variant="outline" onClick={() => setSelectedParty(null)} className="bg-white text-black hover:bg-slate-200 border-none font-bold">Đóng</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: null, partyId: null })}>
        <DialogContent className="bg-[#1e1e1e] border-slate-800 text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Giải tán & Xóa hoàn toàn
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              Hành động này sẽ ngắt kết nối tất cả thành viên và xóa hoàn toàn phòng khỏi hệ thống. Thao tác này không thể hoàn tác!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="ghost" onClick={() => setConfirmDialog({ open: false, type: null, partyId: null })} className="text-slate-400 hover:text-white">Hủy</Button>
            <Button
              variant="destructive"
              className="font-bold px-6"
              onClick={() => confirmDialog.partyId && (confirmDialog.type === "close" ? handleCloseRoom(confirmDialog.partyId) : handleDisbandRoom(confirmDialog.partyId))}
            >
              Xác nhận thực hiện
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}