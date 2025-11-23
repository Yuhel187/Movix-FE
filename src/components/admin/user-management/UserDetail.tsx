/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Edit,
  ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  ListMusic,
  Play,
  Clock,
  Heart,
  Flag,
  Save,
  X,
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrowNavigation } from "@/components/movie/ArrowNavigation";
import { Card, CardContent } from "@/components/ui/card";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DEFAULT_BACKDROP = "/images/placeholder-backdrop.png";
const DEFAULT_AVATAR = "/images/placeholder-avatar.png";

interface WatchHistoryItem {
  id: string;
  movieTitle: string;
  episodeTitle?: string;
  poster: string;
  watchedAt: string;
}

interface FavoriteItem {
  id: string;
  title: string;
  poster: string;
}

interface PlaylistItem {
  id: string;
  name: string;
  count: number;
}

interface UserDetailData {
  id: string;
  username: string;
  fullName: string;
  email: string;
  status: string;
  avatarUrl: string | null;
  backdropUrl: string | null;
  isFlagged: boolean;
  watchHistory: WatchHistoryItem[];
  favorites: FavoriteItem[];
  playlists: PlaylistItem[];
}

const HorizontalScrollSection = ({ title, icon: Icon, children }: { title: string, icon?: any, children: React.ReactNode }) => {
    const scrollRef = useRef<HTMLDivElement>(null!);

    const handleScroll = (direction: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;
        const scrollAmount = container.clientWidth * 0.8;
        if (direction === "left") {
            container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    if (React.Children.count(children) === 0) {
        return (
             <div className="mb-10">
                <div className="flex items-center gap-2 mb-4 text-gray-400">
                     {Icon && <Icon className="w-5 h-5" />} 
                     <h2 className="text-xl font-semibold">{title}</h2>
                </div>
                <div className="p-8 border border-dashed border-zinc-800 rounded-lg text-center text-zinc-600 bg-zinc-900/30">
                    Chưa có dữ liệu.
                </div>
            </div>
        )
    }

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white">
                     {Icon && <Icon className="w-5 h-5 text-red-500" />} 
                     <h2 className="text-xl font-bold">{title}</h2>
                </div>
                <ArrowNavigation
                    onPrev={() => handleScroll("left")}
                    onNext={() => handleScroll("right")}
                />
            </div>
            <div
                ref={scrollRef}
                className="flex overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar gap-4 py-2 pb-4"
            >
                {children}
            </div>
        </div>
    );
};


export default function UserDetail() {
  const router = useRouter();
  const params = useParams();
  const { userId } = params;

  const [user, setUser] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [isFlagged, setIsFlagged] = useState(false);
  
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const backdropInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  

  useEffect(() => {
    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/profile/admin/users/${userId}`);
            const u = res.data;

            const mappedUser: UserDetailData = {
                id: u.id,
                username: u.username,
                fullName: u.display_name || u.username,
                email: u.email,
                status: u.status,
                avatarUrl: u.avatar_url,
                backdropUrl: u.preferences?.backdrop_url || null, 
                isFlagged: u.is_flagged,
                
                // Map Lịch sử
                watchHistory: u.watch_history?.map((wh: any) => ({
                    id: wh.id,
                    movieTitle: wh.episode?.season?.movie?.title || "Unknown",
                    episodeTitle: wh.episode?.title,
                    poster: wh.episode?.season?.movie?.poster_url || "/images/placeholder-poster.png",
                    watchedAt: wh.watched_at
                })) || [],

                // Map Yêu thích
                favorites: u.favourites?.map((fav: any) => ({
                    id: fav.movie.id,
                    title: fav.movie.title,
                    poster: fav.movie.poster_url || "/images/placeholder-poster.png",
                })) || [],

                // Map Playlist
                playlists: u.playlists?.map((pl: any) => ({
                    id: pl.id,
                    name: pl.name,
                    count: pl._count?.playlist_movies || 0
                })) || []
            };

            setUser(mappedUser);
            setCurrentStatus(u.status);
            setIsFlagged(u.is_flagged);
            setAvatarPreview(mappedUser.avatarUrl);
            setBackdropPreview(mappedUser.backdropUrl);

        } catch (err) {
            console.error(err);
            toast.error("Không thể tải thông tin người dùng");
        } finally {
            setLoading(false);
        }
    };

    if (userId) fetchDetail();
  }, [userId]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "backdrop" | "avatar"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === "backdrop") {
          setBackdropPreview(result);
        } else {
          setAvatarPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
        await apiClient.put(`/profile/admin/users/${userId}/status`, {
            status: currentStatus 
        });

        setIsEditing(false);
        toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
        toast.error("Cập nhật thất bại");
    }
  };

  const handleCancelEdit = () => {
    if (user) {
        setCurrentStatus(user.status);
        setAvatarPreview(user.avatarUrl);
        setBackdropPreview(user.backdropUrl);
    }
    setIsEditing(false);
  }

  const handleToggleFlag = async () => {
      try {
          const res = await apiClient.put(`/profile/admin/users/${userId}/flag`);
          setIsFlagged(res.data.isFlagged);
          toast.success(res.data.message);
      } catch (error) {
          toast.error("Lỗi khi thay đổi trạng thái cờ");
      }
  }

  if (loading) return <div className="p-10 text-white text-center">Đang tải dữ liệu...</div>;
  if (!user) return <div className="p-10 text-white text-center">Không tìm thấy người dùng</div>;

  return (
    <div className="p-4 md:p-6 text-white pb-20 max-w-[1600px] mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-gray-400 hover:text-white mb-6 -ml-2 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </Button>

      <div className="space-y-8">
        
        <div className="relative w-full bg-[#18181b] rounded-xl border border-zinc-800 overflow-hidden">

          <div 
            className={cn(
                "relative w-full h-48 sm:h-72 bg-zinc-900 flex items-center justify-center group transition-all",
                isEditing && "cursor-pointer hover:bg-zinc-800"
            )}
            onClick={() => isEditing && backdropInputRef.current?.click()}
          >
            <Image 
              src={backdropPreview || DEFAULT_BACKDROP} 
              alt="User Backdrop" 
              fill 
              className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_BACKDROP;
              }}
            />
            
            {(!backdropPreview && isEditing) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white/70 pointer-events-none">
                     <ImageIcon className="w-12 h-12 mb-2 opacity-80" />
                     <p className="text-sm font-medium shadow-black drop-shadow-md">Nhấn để thay đổi ảnh bìa</p>
                </div>
            )}
            <input
              ref={backdropInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "backdrop")}
              disabled={!isEditing}
            />
            
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                 {/* Nút Flag */}
                 <Button 
                    size="sm" 
                    variant={isFlagged ? "destructive" : "secondary"}
                    className={cn("shadow-lg gap-2", isFlagged ? "bg-red-600 hover:bg-red-700" : "bg-black/60 backdrop-blur-md hover:bg-black/80 text-white border-none")}
                    onClick={(e) => { e.stopPropagation(); handleToggleFlag(); }}
                 >
                     <Flag className={cn("w-4 h-4", isFlagged && "fill-white")} />
                     {isFlagged ? "Đã gắn cờ" : "Gắn cờ"}
                 </Button>

                 {isEditing ? (
                    <>
                        <Button size="sm" variant="outline" className="bg-black/60 backdrop-blur-md border-none text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}>
                            <X className="w-4 h-4 mr-1" /> Hủy
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-lg" onClick={(e) => { e.stopPropagation(); handleSaveChanges(); }}>
                            <Save className="w-4 h-4 mr-1" /> Lưu
                        </Button>
                    </>
                 ) : (
                    <Button size="sm" variant="secondary" className="bg-black/60 backdrop-blur-md hover:bg-black/80 text-white border-none shadow-lg gap-2" onClick={() => setIsEditing(true)}>
                         <Edit className="w-4 h-4" /> Chỉnh sửa
                    </Button>
                 )}
            </div>
          </div>

          <div className="px-6 pb-6 md:px-10 relative">
            <div className="flex flex-col md:flex-row gap-6 items-start -mt-12 md:-mt-16">
                {/* Avatar Circle */}
                <div 
                    className={cn(
                        "relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#18181b] bg-zinc-800 shadow-xl overflow-hidden flex-shrink-0 group z-10",
                        isEditing && "cursor-pointer"
                    )}
                    onClick={() => isEditing && avatarInputRef.current?.click()}
                >
                    <Avatar className="w-full h-full">
                        <AvatarImage 
                            src={avatarPreview || DEFAULT_AVATAR} 
                            alt="Avatar" 
                            className="object-cover w-full h-full"
                        />
                        <AvatarFallback className="bg-slate-700 text-3xl font-bold text-white">
                             {user.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    )}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "avatar")}
                      disabled={!isEditing}
                    />
                </div>

                {/* User Info Fields */}
                <div className="flex-1 pt-2 md:pt-16 space-y-6 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label className="text-zinc-400 text-xs uppercase font-semibold tracking-wider mt-2">Tên hiển thị</Label>
                            <Input
                                value={user.fullName}
                                disabled={!isEditing} 
                                className="mt-1.5 bg-zinc-900/50 border-zinc-700 text-white focus:border-primary disabled:opacity-100 disabled:cursor-default"
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-400 text-xs uppercase font-semibold tracking-wider mt-2">Username</Label>
                            <div className="mt-1.5 px-3 py-2 bg-zinc-900/30 border border-zinc-800 rounded-md text-zinc-300 text-sm">
                                @{user.username}
                            </div>
                        </div>
                    </div>

                    {/* Hàng 2: Email & Trạng thái */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label className="text-zinc-400 text-xs uppercase font-semibold tracking-wider">Email</Label>
                             <div className="mt-1.5 px-3 py-2 bg-zinc-900/30 border border-zinc-800 rounded-md text-zinc-300 text-sm">
                                {user.email}
                            </div>
                        </div>
                        <div>
                            <Label className="text-zinc-400 text-xs uppercase font-semibold tracking-wider">Trạng thái tài khoản</Label>
                            <div className="mt-1.5">
                                <Select
                                    value={currentStatus}
                                    onValueChange={(value) => setCurrentStatus(value)}
                                    disabled={!isEditing}
                                >
                                    <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-700 h-10 text-white disabled:opacity-100">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                        <SelectItem value="active">
                                            <span className="flex items-center text-green-500"><CheckCircle className="w-4 h-4 mr-2"/> Hoạt động</span>
                                        </SelectItem>
                                        <SelectItem value="pending_verification">
                                            <span className="flex items-center text-blue-400"><Clock className="w-4 h-4 mr-2"/> Chờ xác thực</span>
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            <span className="flex items-center text-yellow-500"><AlertCircle className="w-4 h-4 mr-2"/> Không hoạt động</span>
                                        </SelectItem>
                                        <SelectItem value="locked">
                                            <span className="flex items-center text-red-500"><XCircle className="w-4 h-4 mr-2"/> Đã khóa</span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* --- Section 3: CAROUSELS (Lịch sử, Yêu thích, Playlist) --- */}
        <div className="space-y-8">
          
          {/* 1. Lịch sử xem phim */}
          <HorizontalScrollSection title="Lịch sử xem phim" icon={Play}>
             {user.watchHistory.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-36 sm:w-40 md:w-44 group cursor-pointer" title={item.movieTitle}>
                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/50 shadow-md">
                        <Image
                            src={item.poster}
                            alt={item.movieTitle}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="text-white fill-white w-10 h-10 drop-shadow-lg"/>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-6">
                            <p className="text-[10px] text-zinc-300 text-center">
                                {new Date(item.watchedAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                    <div className="mt-2.5">
                        <p className="text-white text-sm font-medium truncate group-hover:text-red-500 transition-colors">{item.movieTitle}</p>
                        <p className="text-zinc-500 text-xs truncate">{item.episodeTitle || "Phim lẻ"}</p>
                    </div>
                </div>
             ))}
          </HorizontalScrollSection>

          {/* 2. Phim yêu thích */}
          <HorizontalScrollSection title="Phim yêu thích" icon={Heart}>
              {user.favorites.map((movie) => (
                <div key={movie.id} className="flex-shrink-0 w-36 sm:w-40 md:w-44 group cursor-pointer" title={movie.title}>
                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/50 shadow-md">
                        <Image src={movie.poster} alt={movie.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                         <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500"/>
                        </div>
                    </div>
                    <p className="mt-2.5 text-white text-sm font-medium truncate group-hover:text-red-500 transition-colors">{movie.title}</p>
                </div>
             ))}
          </HorizontalScrollSection>

          {/* 3. Playlist */}
          <HorizontalScrollSection title="Playlist cá nhân" icon={ListMusic}>
              {user.playlists.map((pl) => (
                <Card key={pl.id} className="flex-shrink-0 w-60 h-24 bg-[#18181b] border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all cursor-pointer group">
                    <CardContent className="p-4 flex items-center gap-4 h-full">
                        <div className="w-14 h-14 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                            <ListMusic className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="font-semibold text-white truncate text-sm group-hover:text-red-500 transition-colors" title={pl.name}>{pl.name}</h3>
                            <p className="text-xs text-zinc-500 mt-1 group-hover:text-zinc-400">{pl.count} phim</p>
                        </div>
                    </CardContent>
                </Card>
              ))}
          </HorizontalScrollSection>

        </div>
      </div>
    </div>
  );
}