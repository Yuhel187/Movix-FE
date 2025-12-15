"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, Play, Pause, Volume2, Maximize, Minimize,
  PanelRightClose, PanelRightOpen, RefreshCw, Power, MoreVertical, UserX, LogOut,
  Smile, Flag, Star, Calendar, Globe, Crown, Ban, Lock, Check, X, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { InvitePartyDialog } from "@/components/watch-party/InvitePartyDialog";
import EmojiPicker from 'emoji-picker-react'; 

// --- HELPER: Xử lý ngày tháng an toàn ---
const getSafeYear = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.getFullYear().toString();
};

const getSafeDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('vi-VN');
};

const MovieInfoSection = ({ roomData }: { roomData: any }) => {
    if (!roomData?.movie) return null;
    const m = roomData.movie;
    
    return (
        <div className="p-8 bg-[#141414] text-white border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 mb-20">
            <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
                <div className="shrink-0 group relative cursor-pointer">
                    <img src={m.poster_url || "/images/placeholder-poster.png"} alt={m.title} className="w-40 h-60 object-cover rounded-lg shadow-2xl group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex-1 space-y-5">
                    <div>
                        <h2 className="text-4xl font-bold flex items-center gap-3 text-white">
                            {m.title}
                            {/* Sửa lỗi NaN tại đây */}
                            <Badge variant="outline" className="text-base font-normal text-slate-400 border-slate-600 px-2 py-0.5">
                                {getSafeYear(m.release_date)}
                            </Badge>
                        </h2>
                        {roomData.episode && (
                            <p className="text-red-500 font-medium mt-2 text-lg">
                                Đang phát: {roomData.episode.title || `Tập ${roomData.episode.episode_number}`}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-300">
                        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-md border border-white/5">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-white">8.5</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            {getSafeDate(m.release_date)}
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-500" />
                            {m.country?.name || 'Quốc tế'}
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {m.movie_genres?.map((g: any) => (
                            <Badge key={g.id || g.genre.id} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 text-xs">
                                {g.genre.name}
                            </Badge>
                        ))}
                    </div>

                    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-white/5">
                        <p className="text-slate-300 leading-relaxed text-sm md:text-base max-w-4xl">
                            {m.description || "Chưa có mô tả cho phim này."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ChatMessage {
    id: string;
    text: string;
    userId: string;
    user: string;
    avatar: string | null;
    time: string;
    isHost: boolean;
}

export default function WatchPartyRoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const socketRef = useRef<Socket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [roomData, setRoomData] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  const [msgInput, setMsgInput] = useState("");
  const [activeTab, setActiveTab] = useState<'chat' | 'members'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  
  const [isAuthorized, setIsAuthorized] = useState(false); 
  const [showJoinCodeDialog, setShowJoinCodeDialog] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dialog States
  const [userToKick, setUserToKick] = useState<string | null>(null);
  const [userToBan, setUserToBan] = useState<string | null>(null);
  const [userToTransfer, setUserToTransfer] = useState<string | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);


  const [hostId, setHostId] = useState<string>("");
  useEffect(() => { if(roomData) setHostId(roomData.host_user_id); }, [roomData]);
  const isHost = hostId === user?.id;
  const roomId = params.id as string;

  // --- INITIALIZE ---
  useEffect(() => {
    if (!user || !roomId) return;

    const fetchRoomInfo = async () => {
        try {
            const res = await apiClient.get(`/watch-party/${roomId}`);
            const data = res.data;
            setRoomData(data.party);
            setMessages(data.messages);
            setHostId(data.party.host_user_id);

            if (data.party.is_private && data.party.host_user_id !== user.id) {
                const urlCode = searchParams.get('code');
                const storedCode = localStorage.getItem(`wp_join_code_${roomId}`);
                if (
                    (urlCode && urlCode.toUpperCase() === data.party.join_code) || 
                    (storedCode && storedCode === data.party.join_code)
                ) {
                    setIsAuthorized(true);
                } else {
                    setShowJoinCodeDialog(true);
                    setIsAuthorized(false);
                    setIsLoading(false); 
                }
            } else {
                setIsAuthorized(true);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải thông tin phòng.");
            router.push('/watch-party');
        }
    };
    fetchRoomInfo();
  }, [roomId, user, router]);

  // --- SOCKET CONNECTION ---
  useEffect(() => {
    if (!user || !roomId || !isAuthorized) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", { withCredentials: true });
    socketRef.current = socket;

    socket.emit('wp:join', { roomId, userId: user.id });

    if (hostId && hostId !== user.id) {
        socket.emit('wp:request_sync', { roomId, requesterId: user.id });
    }
    
    socket.on('wp:update_members', (newMembers) => setMembers(newMembers));
    socket.on('wp:new_message', (msg: ChatMessage) => {
        setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
        });
        setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
    });
    socket.on('wp:sync_player', ({ action, currentTime: remoteTime }) => {
        if (!videoRef.current) return;
        if (action === 'seek' || Math.abs(videoRef.current.currentTime - remoteTime) > 1) {
            videoRef.current.currentTime = remoteTime;
            setCurrentTime(remoteTime);
        }
        if (action === 'play') {
            videoRef.current.play().catch(()=>{});
            setIsPlaying(true);
        } else if (action === 'pause') {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    });
    socket.on('wp:get_host_time', ({ requesterId }) => {
        if (isHost && videoRef.current) {
            socket.emit('wp:send_host_time', {
                roomId, requesterId,
                currentTime: videoRef.current.currentTime,
                isPlaying: !videoRef.current.paused
            });
        }
    });
    socket.on('wp:sync_initial', ({ targetUserId, currentTime, isPlaying: hostIsPlaying }) => {
        if (user.id === targetUserId && videoRef.current) {
            videoRef.current.currentTime = currentTime;
            setCurrentTime(currentTime);
            if (hostIsPlaying) {
                videoRef.current.play().catch(()=>{});
                setIsPlaying(true);
            }
        }
    });
    socket.on('wp:host_transferred', ({ newHostId }) => {
        if (user.id === hostId) {
            toast.success("Đã chuyển quyền thành công. Đang rời phòng...");
            router.push('/watch-party'); 
        } else {
            setHostId(newHostId);
            toast.info("Quyền chủ phòng đã được chuyển giao cho thành viên khác.");
        }
    });
    socket.on('wp:kicked', ({ userId }) => {
        if (user.id === userId) {
            toast.error("Bạn đã bị mời ra khỏi phòng.");
            router.push('/watch-party');
        }
    });
    socket.on('wp:banned', ({ userId }) => {
        if (user.id === userId) {
            toast.error("Bạn đã bị cấm khỏi phòng này vĩnh viễn.");
            router.push('/watch-party');
        }
    });
    socket.on('wp:room_ended', () => {
        toast.warning("Phòng đã kết thúc.");
        router.push('/watch-party');
    });
    socket.on('wp:join_pending', ({ message }) => {
        setIsPendingApproval(true);
        toast.loading(message, { id: "pending-toast", duration: Infinity });
    });
    socket.on('wp:join_accepted', () => {
        setIsPendingApproval(false);
        toast.dismiss("pending-toast");
        toast.success("Yêu cầu đã được chấp nhận!");
    });
    socket.on('wp:join_rejected', ({ message }) => {
        setIsPendingApproval(false);
        toast.dismiss("pending-toast");
        toast.error(message);
        router.push('/watch-party');
    });
    socket.on('wp:host_receive_join_request', (requester) => {
        toast.custom((t) => (
            <div className="bg-[#1F1F1F] border border-slate-700 rounded-lg p-4 shadow-2xl w-full max-w-sm flex flex-col gap-3 pointer-events-auto">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-white/10">
                        <AvatarImage src={requester.avatarUrl} />
                        <AvatarFallback>{requester.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-bold text-white">{requester.displayName || requester.username}</p>
                        <p className="text-xs text-red-400">Thành viên bị chặn muốn xin vào.</p>
                    </div>
                </div>
                <div className="flex gap-2 mt-1">
                    <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 h-8 text-xs" onClick={() => {
                        socket.emit('wp:process_join_request', { roomId, userId: requester.userId, accept: false });
                        toast.dismiss(t);
                    }}><X className="w-3 h-3 mr-1" /> Từ chối</Button>
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-xs" onClick={() => {
                        socket.emit('wp:process_join_request', { roomId, userId: requester.userId, accept: true });
                        toast.dismiss(t);
                    }}><Check className="w-3 h-3 mr-1" /> Chấp nhận</Button>
                </div>
            </div>
        ), { duration: 10000 });
    });
    socket.on('wp:system_message', ({ text, type }) => {
         if (type === 'error') toast.error(text);
         else toast.info(text);
    });

    setIsLoading(false);

    return () => {
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.emit('wp:leave', { roomId, userId: user.id });
            socketRef.current.disconnect();
        }
    };
  }, [roomId, user, isAuthorized, isHost, hostId, router]);


  // --- HANDLERS ---
  const handleJoinCodeSubmit = () => {
      if (joinCodeInput.trim().toUpperCase() === roomData.join_code) {
          localStorage.setItem(`wp_join_code_${roomId}`, joinCodeInput.trim().toUpperCase());
          setIsAuthorized(true);
          setShowJoinCodeDialog(false);
          toast.success("Mã chính xác! Đang vào phòng...");
      } else {
          toast.error("Mã tham gia không đúng.");
      }
  };

  const formatTimeVN = (dateString: string | Date) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, 
  });
};

  const handlePlayPauseClick = () => { if (isHost) performPlayPause(); };
  
  const performPlayPause = useCallback((forcePlay = false) => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const action = forcePlay ? 'play' : (video.paused ? 'play' : 'pause');
    if (action === 'play') { video.play().catch(()=>{}); setIsPlaying(true); }
    else { video.pause(); setIsPlaying(false); }
    socketRef.current?.emit('wp:sync_action', { roomId, action, currentTime: video.currentTime });
  }, [roomId]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isHost || !videoRef.current) return;
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      socketRef.current?.emit('wp:seek_action', { roomId, currentTime: newTime });
  };
  
  const onTimeUpdate = () => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); };
  const onLoadedMetadata = () => {
      if (videoRef.current) setDuration(videoRef.current.duration);
      if (isHost && roomData && !roomData.started_at) performPlayPause(true);
  };
  
  useEffect(() => {
      if (!isHost || !roomData?.scheduled_at || roomData.started_at || !videoRef.current) return;
      const scheduleTime = new Date(roomData.scheduled_at).getTime();
      const checkTimer = setInterval(() => {
          if (Date.now() >= scheduleTime) {
              if (videoRef.current && videoRef.current.paused) {
                   toast.info("Đến giờ chiếu! Đang bắt đầu phát video.");
                   performPlayPause(true); 
              }
              clearInterval(checkTimer); 
          }
      }, 3000);
      return () => clearInterval(checkTimer);
  }, [isHost, roomData, performPlayPause]);

  const handleManualSync = () => {
      if (isHost) {
          if (!videoRef.current) return;
          socketRef.current?.emit('wp:sync_action', {
              roomId, action: !videoRef.current.paused ? 'play' : 'pause', currentTime: videoRef.current.currentTime
          });
          toast.success("Đã đồng bộ tất cả thành viên theo bạn");
      } else {
          toast.info("Đang đồng bộ...");
          socketRef.current?.emit('wp:request_sync', { roomId, requesterId: user?.id });
      }
  };

  const confirmKickUser = () => {
      if (!isHost || !userToKick) return;
      socketRef.current?.emit('wp:kick_user', { roomId, userIdToKick: userToKick });
      setUserToKick(null);
      toast.success("Đã mời thành viên ra khỏi phòng");
  };

  const confirmBanUser = () => {
      if (!isHost || !userToBan) return;
      socketRef.current?.emit('wp:ban_user', { roomId, userIdToBan: userToBan });
      setUserToBan(null);
      toast.success("Đã cấm thành viên vĩnh viễn");
  };

  const confirmTransferHost = () => {
      if (!isHost || !userToTransfer) return;
      socketRef.current?.emit('wp:transfer_host', { roomId, newHostId: userToTransfer });
      setUserToTransfer(null);
      toast.success("Đã chuyển quyền chủ phòng.");
  };

  const confirmEndRoom = () => {
      if (!isHost) return;

      socketRef.current?.emit('wp:end_room', roomId);
      router.push('/watch-party'); 
      toast.success("Đã kết thúc phòng.");
      setShowEndDialog(false);
  };

  const handleSendMessage = () => {
      if (!msgInput.trim() || !socketRef.current) return;
      socketRef.current.emit('wp:send_message', {
          roomId, userId: user?.id, message: msgInput,
          user: { name: user?.display_name || user?.username, avatar: user?.avatar_url || user?.avatarUrl }
      });
      setMsgInput("");
  };

  const onEmojiClick = (emojiObject: any) => {
      setMsgInput(prev => prev + emojiObject.emoji);
      setShowEmoji(false); 
  };

  const toggleFullscreen = () => {
      if (!playerContainerRef.current) return;
      if (!document.fullscreenElement) {
          playerContainerRef.current.requestFullscreen().catch(() => {});
          setIsFullscreen(true);
      } else {
          document.exitFullscreen();
          setIsFullscreen(false);
      }
  };
  useEffect(() => {
      const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const videoUrl = roomData?.episode?.video_url || roomData?.movie?.video_url || "";

  if (isPendingApproval) return (
      <div className="flex h-screen items-center justify-center bg-black text-white flex-col gap-4">
          <div className="animate-pulse bg-yellow-500/20 p-4 rounded-full"><Lock className="w-10 h-10 text-yellow-500" /></div>
          <div className="text-center">
              <h2 className="text-xl font-bold">Đang chờ phê duyệt...</h2>
              <p className="text-slate-400 text-sm mt-2">Bạn đã bị chặn trước đó.<br/>Vui lòng đợi chủ phòng đồng ý.</p>
          </div>
          <Button variant="outline" className="mt-4 border-slate-700 text-slate-300" onClick={() => router.push('/watch-party')}>Hủy & Quay lại</Button>
      </div>
  );

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-black text-white"><RefreshCw className="animate-spin mr-2"/> Đang tải...</div>;

  return (
    <div className="fixed inset-0 z-50 flex bg-black text-white overflow-hidden font-sans flex-col md:flex-row">
      
      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar bg-[#141414]">
          <div ref={playerContainerRef} className="w-full h-[85vh] bg-black relative group shrink-0 flex items-center justify-center">
             {videoUrl ? (
                <video 
                    ref={videoRef} className="w-full h-full object-contain" src={videoUrl} controls={false}
                    onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} onClick={isHost ? handlePlayPauseClick : undefined}
                />
            ) : ( <div className="text-slate-500 flex flex-col items-center gap-2 pt-20"><span className="text-4xl">🎬</span><span>Video không khả dụng</span></div> )}

            <div className={cn("absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20 flex justify-between pointer-events-none transition-opacity duration-300", isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100")}>
                 <div className="pointer-events-auto">
                    <h1 className="text-lg font-bold text-white flex items-center gap-2 drop-shadow-md"><span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]"></span>{roomData?.title}</h1>
                 </div>
                 <div className="flex gap-2 pointer-events-auto">
                    <InvitePartyDialog joinCode={roomData?.join_code} isPrivate={roomData?.is_private} roomId={roomData?.id} />
                    {isHost ? (
                        <>
                            <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md" onClick={() => router.push('/watch-party')}>
                                <LogOut className="w-4 h-4 mr-2"/> Rời
                            </Button>
                            <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700 shadow-md" onClick={() => setShowEndDialog(true)}>
                                <Power className="w-4 h-4 mr-2"/> Kết thúc
                            </Button>
                        </>
                    ) : (
                        <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md" onClick={() => { localStorage.removeItem(`wp_join_code_${roomData?.id}`); router.push('/watch-party')}}><LogOut className="w-4 h-4 mr-2"/> Rời phòng</Button>
                    )}
                    {!isSidebarOpen && !isFullscreen && <Button size="sm" variant="ghost" onClick={() => setIsSidebarOpen(true)} className="text-white hover:bg-white/10"><PanelRightOpen className="w-5 h-5"/></Button>}
                 </div>
            </div>

            <div className={cn("absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 z-20 pointer-events-auto flex flex-col gap-2", isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100")}>
                <div className="relative w-full h-4 flex items-center group/seekbar cursor-pointer">
                    <div className="absolute inset-0 h-1 bg-white/30 rounded-full my-auto group-hover/seekbar:h-1.5 transition-all"></div>
                    <div className="absolute inset-0 h-1 bg-red-600 rounded-full my-auto group-hover/seekbar:h-1.5 transition-all" style={{ width: `${(currentTime / duration) * 100 || 0}%` }}></div>
                    <input type="range" min={0} max={duration || 0} step={0.1} value={currentTime} onChange={handleSeek} disabled={!isHost} className={cn("absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10", !isHost && "cursor-not-allowed")}/>
                </div>
                <div className="flex items-center justify-between -mt-1">
                    <div className="flex items-center gap-4">
                        <button onClick={handlePlayPauseClick} disabled={!isHost} className={cn("text-white transition-all transform hover:scale-110 active:scale-95 focus:outline-none", !isHost && "opacity-50 cursor-not-allowed")}>
                            {isPlaying ? <Pause className="w-8 h-8 fill-white"/> : <Play className="w-8 h-8 fill-white"/>}
                        </button>
                        <div className="text-xs text-slate-300 font-medium">{Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2,'0')} / {Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2,'0')}</div>
                        <Button size="sm" variant="ghost" className="h-8 text-red-400 text-[10px] px-2 hover:bg-red-500/10 hover:text-red-300 gap-1.5" onClick={handleManualSync}>
                            <RefreshCw className={cn("w-3 h-3", isHost ? "" : "animate-spin-slow-once")} /> {isHost ? "Đồng bộ tất cả" : "Đồng bộ"}
                        </Button>
                        <Volume2 className="w-6 h-6 text-slate-300 hover:text-white cursor-pointer hidden sm:block" />
                    </div>
                    <button onClick={toggleFullscreen} className="text-slate-300 hover:text-white transition-transform hover:scale-110">
                        {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                    </button>
                </div>
            </div>
          </div>
          
          <MovieInfoSection roomData={roomData} />
      </div>

      {isSidebarOpen && (
        <div className="w-full md:w-[360px] bg-[#121212] border-l border-white/10 flex flex-col transition-all duration-300 shadow-2xl z-30 font-sans">
             <div className="flex items-center justify-between p-4 bg-[#0A0A0A] border-b border-white/10 shrink-0">
                <span className="font-bold text-sm text-slate-200">Phòng xem chung</span>
                <Button size="icon" variant="ghost" onClick={() => setIsSidebarOpen(false)} className="h-8 w-8 text-slate-400 hover:text-white"><PanelRightClose className="w-4 h-4"/></Button>
            </div>
            <div className="flex bg-[#0A0A0A] border-b border-white/10 shrink-0">
                <button onClick={() => setActiveTab('chat')} className={cn("flex-1 py-3 text-sm font-semibold transition-colors relative", activeTab === 'chat' ? "text-white" : "text-slate-500 hover:text-slate-300")}>Trò chuyện {activeTab === 'chat' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>}</button>
                <button onClick={() => setActiveTab('members')} className={cn("flex-1 py-3 text-sm font-semibold transition-colors relative", activeTab === 'members' ? "text-white" : "text-slate-500 hover:text-slate-300")}>Thành viên ({members.length}) {activeTab === 'members' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>}</button>
            </div>
            <div className="flex-1 overflow-hidden relative bg-[#121212]">
                {activeTab === 'chat' ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className="group/msg flex gap-3 animate-in fade-in slide-in-from-bottom-1 relative">
                                    <Avatar className="w-8 h-8 shrink-0"><AvatarImage src={msg.avatar||undefined}/><AvatarFallback>{msg.user?.[0]}</AvatarFallback></Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1"><span className={cn("text-xs font-bold truncate pr-2", msg.isHost ? "text-yellow-500" : "text-slate-300")}>{msg.user}{msg.isHost && <span className="ml-1 text-[9px] bg-yellow-500/10 text-yellow-500 px-1 rounded">HOST</span>}</span><span className="text-[9px] text-slate-600 shrink-0">{formatTimeVN(msg.time)}</span></div>
                                        <div className="text-sm bg-[#1F1F1F] p-2.5 rounded-2xl rounded-tl-none border border-white/5 text-slate-200 break-words shadow-sm">{msg.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-white/10 bg-[#0A0A0A] flex gap-2 items-center relative shrink-0">
                            <Button size="icon" variant="ghost" className="text-slate-400 hover:text-yellow-500 shrink-0" onClick={() => setShowEmoji(!showEmoji)}><Smile className="w-5 h-5" /></Button>
                            {showEmoji && <div className="absolute bottom-16 left-0 z-50 shadow-2xl"><EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width={300} height={350} /></div>}
                            <Input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Nhập tin nhắn..." className="bg-[#1F1F1F] border-transparent focus-visible:ring-1 focus-visible:ring-red-600 rounded-full h-10 text-sm text-white"/>
                            <Button size="icon" onClick={handleSendMessage} className="bg-red-600 hover:bg-red-700 rounded-full h-10 w-10 shrink-0"><Send className="w-4 h-4 ml-0.5"/></Button>
                        </div>
                    </div>
                ) : (
                    <ScrollArea className="h-full p-2">
                        {members.map(mem => (
                            <div key={mem.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-9 h-9 border border-white/10"><AvatarImage src={mem.avatar}/><AvatarFallback className="bg-slate-800 text-xs">{mem.name[0]}</AvatarFallback></Avatar>
                                    <div className="flex flex-col"><span className="text-sm font-medium text-white flex items-center gap-2">{mem.name}{mem.role === 'host' && <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded font-bold">HOST</span>}</span><span className="text-xs text-slate-500">{mem.online ? "Đang xem" : "Ngoại tuyến"}</span></div>
                                </div>
                                {isHost && mem.role !== 'host' && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-8 w-8 text-slate-400 bg-amber-50 transition-opacity"><MoreVertical className="w-4 h-4"/></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#1F1F1F] border-slate-700 text-white w-52">
                                            <DropdownMenuItem className="focus:bg-white/10 cursor-pointer py-2.5" onClick={() => setUserToTransfer(mem.id)}><Crown className="w-4 h-4 mr-2 text-yellow-500" /> Chuyển quyền Host</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer py-2.5" onClick={() => setUserToKick(mem.id)}><UserX className="w-4 h-4 mr-2" /> Mời ra khỏi phòng</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-500/20 cursor-pointer py-2.5" onClick={() => setUserToBan(mem.id)}><Ban className="w-4 h-4 mr-2" /> Cấm vĩnh viễn (Ban)</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        ))}
                    </ScrollArea>
                )}
            </div>
        </div>
      )}

      {/* --- DIALOGS --- */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}><AlertDialogContent className="bg-[#1F1F1F] border-slate-800 text-white"><AlertDialogHeader><AlertDialogTitle>Kết thúc phòng xem chung?</AlertDialogTitle><AlertDialogDescription className="text-slate-400">Tất cả thành viên sẽ bị ngắt kết nối. Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-white/10 text-white">Hủy</AlertDialogCancel><AlertDialogAction onClick={confirmEndRoom} className="bg-red-600 hover:bg-red-700 text-white border-0">Kết thúc ngay</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={!!userToKick} onOpenChange={(open) => !open && setUserToKick(null)}><AlertDialogContent className="bg-[#1F1F1F] border-slate-800 text-white"><AlertDialogHeader><AlertDialogTitle>Mời thành viên ra khỏi phòng?</AlertDialogTitle><AlertDialogDescription className="text-slate-400">Họ sẽ bị ngắt kết nối ngay lập tức.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-white/10 text-white">Hủy</AlertDialogCancel><AlertDialogAction onClick={confirmKickUser} className="bg-red-600 hover:bg-red-700 text-white border-0">Đồng ý</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={!!userToBan} onOpenChange={(open) => !open && setUserToBan(null)}><AlertDialogContent className="bg-[#1F1F1F] border-slate-800 text-white"><AlertDialogHeader><AlertDialogTitle>Cấm thành viên vĩnh viễn?</AlertDialogTitle><AlertDialogDescription className="text-slate-400">Thành viên này sẽ không thể tham gia lại phòng này trừ khi được gỡ cấm.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-white/10 text-white">Hủy</AlertDialogCancel><AlertDialogAction onClick={confirmBanUser} className="bg-red-600 hover:bg-red-700 text-white border-0">Cấm ngay</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={!!userToTransfer} onOpenChange={(open) => !open && setUserToTransfer(null)}><AlertDialogContent className="bg-[#1F1F1F] border-slate-800 text-white"><AlertDialogHeader><AlertDialogTitle>Chuyển quyền chủ phòng?</AlertDialogTitle><AlertDialogDescription className="text-slate-400">Bạn sẽ mất quyền điều khiển video.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="bg-transparent border-slate-700 hover:bg-white/10 text-white">Hủy</AlertDialogCancel><AlertDialogAction onClick={confirmTransferHost} className="bg-yellow-600 hover:bg-yellow-700 text-black border-0">Chuyển quyền</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>

      <Dialog open={showJoinCodeDialog} onOpenChange={() => {}}>
          <DialogContent showCloseButton={false} className="bg-[#1F1F1F] border-slate-800 text-white sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
             <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-yellow-500"><Lock className="w-5 h-5"/> Phòng riêng tư</DialogTitle>
                <DialogDescription className="text-slate-400">Vui lòng nhập mã tham gia (Join Code) để vào phòng này.</DialogDescription>
             </DialogHeader>
             <div className="py-4">
                 <Input 
                    placeholder="Nhập mã 6 ký tự..." 
                    className="bg-black/40 border-slate-600 text-center text-2xl tracking-widest uppercase h-14 font-mono text-white"
                    maxLength={6}
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                 />
             </div>
             <DialogFooter>
                 <Button variant="ghost" onClick={() => router.push('/watch-party')} className="text-slate-400 hover:text-white">Quay lại</Button>
                 <Button onClick={handleJoinCodeSubmit} className="bg-red-600 hover:bg-red-700">Tham gia ngay</Button>
             </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}