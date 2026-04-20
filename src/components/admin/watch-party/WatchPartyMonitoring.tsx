"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
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
  Users, 
  Tv, 
  Clock, 
  PowerOff, 
  AlertTriangle, 
  Search,
  Lock,
  Unlock,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  username: string;
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
  join_code: string;
  is_private: boolean;
  is_active: boolean;
  started_at: string;
  host_user: User;
  movie?: Movie;
  episode?: Episode; // If null, watching movie directly
  members: WatchPartyMember[];
  viewer_count: number; // Snapshot count or derived from members.length
  max_participants: number;
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
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState<WatchParty | null>(null); // For details dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "close" | "disband" | null;
    partyId: string | null;
  }>({ open: false, type: null, partyId: null });

  // Load Mock Data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setParties(generateMockParties(10));
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter Logic
  const filteredParties = parties.filter(party => 
    party.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.join_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.host_user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Actions
  const handleCloseRoom = (partyId: string) => { // Soft close or stop accepting new members
    // API Call Mock
    setParties(prev => prev.map(p => p.id === partyId ? { ...p, is_active: false } : p));
    toast.success("Đã đóng phòng thành công");
    setConfirmDialog({ open: false, type: null, partyId: null });
  };

  const handleDisbandRoom = (partyId: string) => { // Force delete/kick all
    // API Call Mock
    setParties(prev => prev.filter(p => p.id !== partyId)); // Remove from list
    toast.error("Đã giải tán phòng và ngắt kết nối tất cả người dùng"); // Using toast.error for destructive action notification style
    setConfirmDialog({ open: false, type: null, partyId: null });
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
           <Button variant="outline" onClick={() => {
             setIsLoading(true);
             setTimeout(() => {
               setParties(generateMockParties(Math.floor(Math.random() * 5) + 5));
               setIsLoading(false);
               toast.info("Đã làm mới dữ liệu");
             }, 500);
           }}>
             Làm mới
           </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng Đang Live</CardTitle>
            <Tv className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parties.filter(p => p.is_active).length}</div>
            <p className="text-xs text-muted-foreground">Active rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Người Xem</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parties.reduce((acc, party) => acc + party.viewer_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Real-time participants</p>
          </CardContent>
        </Card>
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
                         <span className="text-xs text-muted-foreground">Ep {party.episode.episode_number}</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Host Info */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Avatar className="h-8 w-8">
                         <AvatarImage src={party.host_user.avatar_url} />
                         <AvatarFallback>{party.host_user.username.substring(0,2).toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <span className="text-sm truncate w-24">{party.host_user.username}</span>
                    </div>
                  </TableCell>
                  
                  {/* Participants Info */}
                  <TableCell>
                    <div className="flex items-center gap-2 cursor-pointer hover:underline" onClick={() => setSelectedParty(party)}>
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold">{party.viewer_count}</span>
                      <span className="text-muted-foreground text-xs">/ {party.max_participants} max</span>
                    </div>
                  </TableCell>

                  {/* Time Info */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                       <Clock className="h-3 w-3" />
                       <span>{format(new Date(party.started_at), 'HH:mm', { locale: vi })}</span>
                       <span className="text-xs">({Math.floor((Date.now() - new Date(party.started_at).getTime()) / 60000)}m active)</span>
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
                        <DropdownMenuItem onClick={() => setSelectedParty(party)}>
                          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-orange-500 focus:text-orange-500 focus:bg-orange-50 dark:focus:bg-orange-950"
                          onClick={() => openConfirm("close", party.id)}
                        >
                          <PowerOff className="mr-2 h-4 w-4" /> Đóng phòng
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                           className="text-destructive focus:text-destructive focus:bg-destructive/10"
                           onClick={() => openConfirm("disband", party.id)}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" /> Giải tán & Ban
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

      {/* Participant Details Dialog */}
      <Dialog open={!!selectedParty} onOpenChange={(open) => !open && setSelectedParty(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết phòng: {selectedParty?.title}</DialogTitle>
            <DialogDescription>
               Join Code: <span className="font-mono bg-muted px-1 rounded">{selectedParty?.join_code}</span> | 
               Host: {selectedParty?.host_user.username} | 
               Limit: {selectedParty?.max_participants}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
             <h4 className="mb-2 text-sm font-medium">Danh sách thành viên ({selectedParty?.members.length})</h4>
             <div className="border rounded-md max-h-[300px] overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {selectedParty?.members.map(member => (
                   <div key={member.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent border bg-card">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                             <AvatarImage src={member.user.avatar_url} />
                             <AvatarFallback>{member.user.username.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${member.is_online ? "bg-green-500" : "bg-gray-400"}`} />
                      </div>
                      <div className="overflow-hidden">
                         <p className="text-sm font-medium truncate">{member.user.username}</p>
                         <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
          
          <DialogFooter>
             <Button variant="outline" onClick={() => setSelectedParty(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog for Emergency Actions */}
      <Dialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: null, partyId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
               <AlertTriangle className="h-5 w-5" />
               Xác nhận can thiệp khẩn cấp
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === 'close' 
                ? "Bạn có chắc chắn muốn đóng phòng này không? Người dùng hiện tại sẽ bị ngắt kết nối."
                : "Hành động này sẽ giải tán phòng ngay lập tức và có thể sẽ cấm host tạo phòng trong tương lai."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, type: null, partyId: null })}>Huỷ</Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmDialog.partyId && (confirmDialog.type === 'close' ? handleCloseRoom(confirmDialog.partyId) : handleDisbandRoom(confirmDialog.partyId))}
            >
              Xác nhận {confirmDialog.type === 'close' ? 'Đóng' : 'Giải tán'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}