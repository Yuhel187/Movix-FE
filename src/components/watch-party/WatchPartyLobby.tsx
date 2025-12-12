"use client";

import React, { useState, useEffect } from "react";
import { CreatePartyDialog } from "@/components/watch-party/CreatePartyDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Search, Bell, Clock, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient"; 
import { useAuth } from "@/contexts/AuthContext";
import Footer from "../layout/Footer";
import Navbar from "@/components/layout/NavBar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export default function WatchPartyLobby() {
const { user } = useAuth();
const router = useRouter();
  const [filter, setFilter] = useState<'live' | 'scheduled' | 'ended'>('live');
  const [searchQuery, setSearchQuery] = useState(""); 
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [partyToCancel, setPartyToCancel] = useState<string | null>(null);
  const [showEndedDialog, setShowEndedDialog] = useState(false);
  const [quickJoinCode, setQuickJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
      const fetchRooms = async () => {
          setLoading(true);
          try {
              const res = await apiClient.get(`/watch-party?filter=${filter}&q=${searchQuery}`);
              setRooms(res.data);
          } catch (error) {
              console.error("Lỗi tải danh sách phòng:", error);
          } finally {
              setLoading(false);
          }
      };

      const timer = setTimeout(() => {
          fetchRooms();
      }, 500);

      return () => clearTimeout(timer);
  }, [filter, searchQuery]);

  const handleNotify = async (e: React.MouseEvent, roomId: string) => {
      e.preventDefault();
      e.stopPropagation();
      try {
          const res = await apiClient.post(`/watch-party/${roomId}/remind`);
          if (res.data.subscribed) {
              toast.success("Đã đăng ký nhận thông báo!");
          } else {
              toast.info("Đã hủy nhận thông báo.");
          }
      } catch (error) {
          toast.error("Lỗi kết nối");
      }
  }

  const openCancelDialog = (e: React.MouseEvent, roomId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setPartyToCancel(roomId); 
  };

  const confirmCancel = async () => {
      if (!partyToCancel) return;

      try {
          await apiClient.delete(`/watch-party/${partyToCancel}`);
          toast.success("Đã hủy lịch công chiếu.");

          const res = await apiClient.get(`/watch-party?filter=${filter}&q=${searchQuery}`);
          setRooms(res.data);
      } catch (error: any) {
          toast.error(error.response?.data?.message || "Lỗi khi hủy phòng");
      } finally {
          setPartyToCancel(null);
      }
  };

  const handleQuickJoin = async () => {
      if (!quickJoinCode.trim()) {
          toast.error("Vui lòng nhập mã phòng.");
          return;
      }

      setIsJoining(true);
      try {
          const res = await apiClient.post('/watch-party/join', { code: quickJoinCode });
          
          toast.success("Mã hợp lệ! Đang vào phòng...");
          router.push(`/watch-party/${res.data.roomId}?code=${quickJoinCode}`);
      } catch (error: any) {
          toast.error(error.response?.data?.message || "Mã phòng không đúng hoặc đã hết hạn.");
      } finally {
          setIsJoining(false);
      }
  };

  return (
    <>
    <Navbar />
        <div className="min-h-screen bg-[#141414] text-white">
      <div 
        className="relative h-[350px] border-b border-slate-800 flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/background-homepage.jpg')" }}
      >
         <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
         <div className="text-center z-10 space-y-4 px-4 animate-in fade-in zoom-in duration-700">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg tracking-tight">
                WATCH PARTY
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto font-light">
                Xem phim cùng bạn bè, trò chuyện thời gian thực và tận hưởng cảm giác rạp chiếu phim ngay tại nhà.
            </p>
            <div className="pt-6 flex flex-wrap justify-center items-center gap-4">
                <CreatePartyDialog />
                <div className="flex w-full max-w-sm items-center space-x-2 bg-black/50 p-1 rounded-lg border border-slate-600 focus-within:border-red-500 transition-colors">
                    <Input 
                        placeholder="Nhập mã phòng để tham gia..." 
                        className="bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-slate-400 font-mono tracking-wider"
                        value={quickJoinCode}
                        onChange={(e) => setQuickJoinCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickJoin()}
                        maxLength={6}
                    />
                    <Button 
                        variant="ghost" 
                        className="text-white hover:bg-white/20 hover:text-white"
                        onClick={handleQuickJoin}
                        disabled={isJoining}
                    >
                        {isJoining ? <Loader2 className="w-4 h-4 animate-spin"/> : "Vào"}
                    </Button>
                </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">

            <div className="flex bg-[#1F1F1F] p-1 rounded-lg border border-slate-800">
                <button 
                    onClick={() => setFilter('live')}
                    className={cn("px-6 py-2 rounded-md text-sm font-medium transition-all", filter === 'live' ? "bg-red-600 text-white shadow-md" : "text-slate-400 hover:text-white")}
                >
                    Đang diễn ra
                </button>
                <button 
                    onClick={() => setFilter('scheduled')}
                    className={cn("px-6 py-2 rounded-md text-sm font-medium transition-all", filter === 'scheduled' ? "bg-yellow-600 text-white shadow-md" : "text-slate-400 hover:text-white")}
                >
                    Sắp chiếu
                </button>
                <button 
                    onClick={() => setFilter('ended')}
                    className={cn("px-6 py-2 rounded-md text-sm font-medium transition-all", filter === 'ended' ? "bg-slate-700 text-white shadow-md" : "text-slate-400 hover:text-white")}
                >
                    Đã kết thúc
                </button>
            </div>

            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                    placeholder="Tìm tên phòng, phim, host..." 
                    className="pl-9 bg-[#1F1F1F] border-slate-800 focus-visible:ring-red-600 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {loading && (
            <div className="py-20 flex justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )}

        {!loading && rooms.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
                <p>Không tìm thấy phòng nào phù hợp.</p>
            </div>
        ) : !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <Link
                        href={room.status === 'live' ? `/watch-party/${room.id}` : '#'}
                        key={room.id}
                        className={cn("group block h-full", room.status === 'ended' && "opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all")}
                        onClick={(e) => {
                            if (room.status === 'ended') {
                                e.preventDefault(); 
                                setShowEndedDialog(true);
                            }
                        }}
                    >
                        <Card className="bg-[#1F1F1F] border-slate-800 overflow-hidden hover:border-slate-600 transition-all hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col relative group">

                            <div className="relative h-72 w-full overflow-hidden">
                                <img
                                    src={room.image || "/images/placeholder-backdrop.png"} 
                                    alt={room.movieTitle}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent opacity-90"></div>

                                <div className="absolute top-3 left-3 flex items-center gap-2">
                                    {room.status === 'live' && <Badge className="bg-red-600/90 hover:bg-red-600 backdrop-blur-md animate-pulse border-0 shadow-lg px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">● LIVE</Badge>}
                                    {room.status === 'scheduled' && <Badge className="bg-yellow-500/90 text-black hover:bg-yellow-500 backdrop-blur-md font-bold border-0 shadow-lg text-[10px]">SẮP CHIẾU</Badge>}
                                    {room.status === 'ended' && <Badge className="bg-slate-600/90 backdrop-blur-md border-0 shadow-lg text-[10px]">ĐÃ KẾT THÚC</Badge>}
                                </div>

                                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                                    {room.isPrivate && (
                                        <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-full text-slate-300 border border-white/10" title="Phòng riêng tư"><Lock className="w-3 h-3" /></div>
                                    )}
                                    {room.status === 'live' && (
                                        <Badge variant="secondary" className="bg-black/60 hover:bg-black/70 backdrop-blur-md text-white border-0 shadow-lg gap-1.5 px-2 py-1">
                                            <Users className="w-3 h-3 text-red-500" />
                                            <span className="font-mono text-xs font-bold">{room.viewers || 0}</span>
                                        </Badge>
                                    )}
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1.5 z-20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-full p-[1px] bg-gradient-to-tr from-red-500 to-orange-500">
                                            {room.hostAvatar ? (
                                                <img src={room.hostAvatar} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-white font-bold uppercase">{room.host?.[0]}</div>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-300 shadow-black drop-shadow-md">{room.host}</span>
                                    </div>

                                    <h3 className="font-bold text-lg text-white leading-tight shadow-black drop-shadow-lg line-clamp-2 group-hover:text-red-500 transition-colors">{room.title}</h3>

                                    <p className="text-xs text-slate-400 font-light flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                                        <span title={room.movieTitle}>{room.movieTitle}</span>
                                        {room.episodeInfo && <Badge variant="outline" className="ml-1 border-slate-600 text-[9px] h-4 px-1 text-slate-300">S{room.episodeInfo.season} E{room.episodeInfo.episode}</Badge>}
                                    </p>
                                </div>
                            </div>
                            
                            {(room.status === 'scheduled' || room.status === 'ended') && (
                                <CardContent className="p-0 border-t border-white/5 bg-[#1a1a1a]">
                                    {room.status === 'scheduled' && (
                                        <div className="flex items-center justify-between p-3 group/btn hover:bg-white/5 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-2 text-xs text-yellow-500">
                                                <Clock className="w-3.5 h-3.5"/> 
                                                <span className="font-mono font-medium">{format(new Date(room.scheduledAt), "HH:mm dd/MM", { locale: vi })}</span>
                                            </div>

                                            {user?.id === room.hostId ? (
                                                <div 
                                                    className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 hover:text-red-400 uppercase transition-colors z-20"
                                                    onClick={(e) => openCancelDialog(e, room.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Hủy lịch
                                                </div>
                                            ) : (
                                                <div 
                                                    className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase group-hover/btn:text-white transition-colors"
                                                    onClick={(e) => handleNotify(e, room.id)}
                                                >
                                                    <Bell className="w-3 h-3" /> Nhận tin
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {room.status === 'ended' && (
                                        <div className="p-2.5 text-center bg-slate-800/50">
                                            <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5 font-medium uppercase tracking-wide">
                                                <CheckCircle2 className="w-3 h-3" /> Kết thúc lúc {format(new Date(room.endedAt), "HH:mm", { locale: vi })}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    </Link>
                ))}
            </div>
        )}
      </div>

      <AlertDialog open={!!partyToCancel} onOpenChange={(open) => !open && setPartyToCancel(null)}>
            <AlertDialogContent className="bg-[#1F1F1F] border-slate-800 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Hủy lịch công chiếu?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                        Hành động này sẽ xóa phòng xem chung và hủy thông báo gửi đến những người đã đăng ký. Bạn không thể hoàn tác hành động này.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-white/10 text-white hover:text-white">
                        Quay lại
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={confirmCancel}
                        className="bg-red-600 hover:bg-red-700 text-white border-0"
                    >
                        Xác nhận hủy
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showEndedDialog} onOpenChange={setShowEndedDialog}>
            <AlertDialogContent className="bg-[#1F1F1F] border-slate-800 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-yellow-500">Phòng đã kết thúc</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                        Buổi xem chung này đã kết thúc và không thể tham gia được nữa. Hãy thử tìm các phòng đang diễn ra (Live) hoặc sắp chiếu nhé!
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setShowEndedDialog(false)} className="bg-slate-700 hover:bg-slate-600 text-white border-0">
                        Đã hiểu
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
    </div>
    <Footer />
    </>
  );
}