"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, Users, MessageSquare, Share2, 
  LogOut, Play, Pause, Volume2, Maximize, Smile,
  PanelRightClose, PanelRightOpen, RefreshCw, 
  MoreVertical, UserX, Ban, Settings, Power
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import apiClient from "@/lib/apiClient"; 

export default function WatchPartyRoomPage() {
  const router = useRouter();
  const params = useParams(); 
  
  const [activeTab, setActiveTab] = useState<'chat' | 'members'>('chat');
  const [msgInput, setMsgInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // [TODO] Logic kiểm tra quyền Host thật từ User Context
  // const { user } = useAuth();
  // const isCurrentUserHost = user?.id === roomData?.hostUserId;
  const isCurrentUserHost = true; // Mock tạm thời để test UI Host

  const messages = [
    { id: 1, user: "Khai Dev", text: "Phim bắt đầu chưa mn?", time: "20:00", isSystem: false },
    { id: 2, user: "System", text: "Khai Dev đã tham gia phòng", time: "20:00", isSystem: true },
    { id: 3, user: "Host", text: "Mọi người chuẩn bị nhé, mình sẽ bấm play!", time: "20:01", isHost: true },
  ];

  const members = [
    { id: 1, name: "Khai Dev (You)", isHost: true, online: true },
    { id: 2, name: "User 2", isHost: false, online: true },
    { id: 3, name: "User 3", isHost: false, online: false },
  ];

  const movieInfo = {
      title: "Avengers: Endgame",
      year: "2019",
      rating: "8.4",
      genres: ["Hành động", "Viễn tưởng", "Phiêu lưu"],
      desc: "Sau những sự kiện tàn khốc của Avengers: Infinity War (2018), vũ trụ đang nằm trong đống đổ nát. Với sự giúp đỡ của các đồng minh còn lại, Avengers tập hợp một lần nữa để đảo ngược hành động của Thanos và khôi phục lại sự cân bằng cho vũ trụ."
  };

  const handleKick = (userName: string) => toast.success(`Đã đuổi ${userName} khỏi phòng`);
  const handleBan = (userName: string) => toast.error(`Đã chặn ${userName} vĩnh viễn`);
  
  const handleLeaveRoom = () => {
      toast.info("Đang rời phòng...");
      router.push("/watch-party");
  };

  const handleEndParty = async () => {
      if (!confirm("Bạn có chắc chắn muốn kết thúc phòng xem chung này? Tất cả thành viên sẽ bị ngắt kết nối.")) return;

      try {
          await apiClient.put(`/watch-party/${params.id}/end`);
          toast.success("Đã kết thúc phòng thành công!");
          router.push("/watch-party");
      } catch (error: any) {
          toast.error(error.response?.data?.message || "Lỗi khi kết thúc phòng");
      }
  };

  const handleSync = () => {
      toast.info("Đang đồng bộ dữ liệu với máy chủ...");
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black text-white overflow-hidden font-sans flex-col md:flex-row">
      <div className="flex-1 flex flex-col h-full relative overflow-y-auto custom-scrollbar">
    
        <div className="w-full aspect-video bg-black relative group shrink-0">
            
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent z-20 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="pointer-events-auto">
                    <h1 className="text-lg font-bold flex items-center gap-2 shadow-sm text-white">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></span>
                        Phòng: Cày phim cuối tuần
                    </h1>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                    <Button size="sm" variant="secondary" className="bg-white/10 backdrop-blur-md border-white/10 text-white hover:bg-white/20">
                        <Share2 className="w-4 h-4 mr-2" /> Mời
                    </Button>
                    
                    {isCurrentUserHost ? (
                        <Button 
                            size="sm" 
                            variant="destructive" 
                            className="shadow-lg bg-red-600 hover:bg-red-700 font-bold"
                            onClick={handleEndParty}
                        >
                            <Power className="w-4 h-4 mr-2" /> Kết thúc phòng
                        </Button>
                    ) : (
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            className="shadow-lg bg-white/10 hover:bg-white/20 text-white border-white/10"
                            onClick={handleLeaveRoom}
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Rời phòng
                        </Button>
                    )}
                    {/* ------------------------------------------------ */}

                    {!isSidebarOpen && (
                        <Button size="sm" variant="ghost" onClick={() => setIsSidebarOpen(true)} className="bg-white/10 text-white">
                            <PanelRightOpen className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="w-full h-full flex items-center justify-center bg-[#050505] relative">
                <p className="text-slate-600 font-medium tracking-widest animate-pulse">[ VIDEO PLAYER AREA ]</p>

                <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                
                    <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 relative pointer-events-none"> 
                        <div className="absolute top-0 left-0 h-full w-[45%] bg-red-600 rounded-full"></div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => isCurrentUserHost && setIsPlaying(!isPlaying)}
                                className={cn("text-white transition-colors transform hover:scale-110", !isCurrentUserHost && "opacity-50 cursor-not-allowed")}
                                title={isCurrentUserHost ? "Phát/Dừng" : "Chỉ chủ phòng mới được điều khiển"}
                            >
                                {isPlaying ? <Pause className="w-8 h-8 fill-current"/> : <Play className="w-8 h-8 fill-current"/>}
                            </button>
                            
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent text-xs"
                                onClick={handleSync}
                            >
                                <RefreshCw className="w-3 h-3 mr-2" /> Đồng bộ
                            </Button>

                            <div className="group/vol relative flex items-center gap-2">
                                <Volume2 className="w-6 h-6 cursor-pointer" />
                            </div>
                            <span className="text-xs font-mono text-slate-300">01:12:40 / 02:45:00</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Maximize className="w-5 h-5 hover:text-red-500 cursor-pointer transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 md:p-8 bg-[#141414] border-t border-white/5 flex-1">
            <div className="flex flex-col md:flex-row gap-6">
                <img src="https://image.tmdb.org/t/p/w300/ulzhLuWrPK07Pqyc9RIXMe2289q.jpg" alt="Poster" className="w-32 h-48 object-cover rounded-lg shadow-lg hidden md:block" />
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        {movieInfo.title}
                        <span className="text-lg font-normal text-slate-400">({movieInfo.year})</span>
                    </h2>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-yellow-500 text-black font-bold hover:bg-yellow-400">IMDb {movieInfo.rating}</Badge>
                        {movieInfo.genres.map(g => (
                            <Badge key={g} variant="outline" className="border-slate-600 text-slate-300">{g}</Badge>
                        ))}
                    </div>
                    <p className="text-slate-300 leading-relaxed text-sm md:text-base max-w-3xl">
                        {movieInfo.desc}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {isSidebarOpen && (
      <div className="w-full md:w-[360px] bg-[#121212] border-l border-white/5 flex flex-col shadow-2xl z-30 transition-all duration-300">

        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-white/5">
            <span className="font-bold text-sm text-slate-200">Phòng xem chung</span>
            <Button size="icon" variant="ghost" onClick={() => setIsSidebarOpen(false)} className="h-8 w-8 text-slate-400 hover:text-white">
                <PanelRightClose className="w-4 h-4" />
            </Button>
        </div>

        <div className="flex bg-[#0A0A0A] border-b border-white/5">
            <button 
                onClick={() => setActiveTab('chat')}
                className={cn(
                    "flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all relative",
                    activeTab === 'chat' ? "text-white bg-white/5" : "text-slate-500 hover:text-slate-300"
                )}
            >
                <MessageSquare className="w-4 h-4" /> Trò chuyện
                {activeTab === 'chat' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('members')}
                className={cn(
                    "flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all relative",
                    activeTab === 'members' ? "text-white bg-white/5" : "text-slate-500 hover:text-slate-300"
                )}
            >
                <Users className="w-4 h-4" /> Thành viên <Badge className="ml-1 bg-white/10 text-white hover:bg-white/20 h-5 px-1.5">{members.length}</Badge>
                {activeTab === 'members' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>}
            </button>
        </div>

        <div className="flex-1 overflow-hidden relative bg-[#121212]">
            
            {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                msg.isSystem ? (
                                    <div key={msg.id} className="flex justify-center my-2">
                                        <span className="text-[10px] bg-white/5 text-slate-400 px-3 py-1 rounded-full border border-white/5">{msg.text}</span>
                                    </div>
                                ) : (
                                    <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <Avatar className="w-8 h-8 mt-0.5 border border-white/10">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user}`} />
                                            <AvatarFallback className="bg-zinc-800 text-[10px]">{msg.user[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className={cn("text-xs font-bold truncate", msg.isHost ? "text-yellow-500" : "text-slate-300")}>
                                                    {msg.user}
                                                </span>
                                                {msg.isHost && <span className="text-[8px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1 rounded">HOST</span>}
                                                <span className="text-[10px] text-slate-600 ml-auto">{msg.time}</span>
                                            </div>
                                            <div className="bg-[#1F1F1F] text-slate-200 text-sm p-3 rounded-2xl rounded-tl-none border border-white/5 shadow-sm break-words leading-relaxed hover:bg-[#252525] transition-colors">
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="p-3 bg-[#0A0A0A] border-t border-white/5">
                        <div className="relative flex items-center gap-2">
                            <Input 
                                placeholder="Nhập tin nhắn..." 
                                value={msgInput}
                                onChange={(e) => setMsgInput(e.target.value)}
                                className="bg-[#1F1F1F] border-transparent focus-visible:ring-1 focus-visible:ring-red-600 rounded-full h-10 text-sm pl-4 pr-12"
                                onKeyDown={(e) => e.key === 'Enter' && setMsgInput('')}
                            />
                            <Button 
                                size="icon" 
                                className="absolute right-1 top-1 bottom-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-8 w-8 shrink-0"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'members' && (
                <ScrollArea className="h-full">
                    <div className="p-2 space-y-1">
                        {members.map((mem) => (
                            <div key={mem.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="w-10 h-10 border border-white/10">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mem.name}`} />
                                            <AvatarFallback className="bg-zinc-800 text-xs">{mem.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className={cn(
                                            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#121212]",
                                            mem.online ? "bg-green-500" : "bg-slate-600"
                                        )}></span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white flex items-center gap-2">
                                            {mem.name}
                                            {mem.isHost && <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 font-bold">HOST</span>}
                                        </span>
                                        <span className="text-xs text-slate-500">{mem.online ? "Đang xem" : "Ngoại tuyến"}</span>
                                    </div>
                                </div>

                                {isCurrentUserHost && !mem.isHost && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-8 w-8 text-slate-400 hover:text-white">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#1F1F1F] border-slate-700 text-white">
                                            <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer" onClick={() => handleKick(mem.name)}>
                                                <UserX className="w-4 h-4 mr-2" /> Mời ra khỏi phòng
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-500/20 cursor-pointer" onClick={() => handleBan(mem.name)}>
                                                <Ban className="w-4 h-4 mr-2" /> Chặn vĩnh viễn
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
      </div>
      )}
    </div>
  );
}