"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  Camera,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  ListMusic,
} from "lucide-react";
import { cn } from "@/lib/utils"; 
import { ArrowNavigation } from "@/components/movie/ArrowNavigation";
interface User {
  id: string;
  maUser: string;
  username: string;
  fullName: string;
  email: string;
  lastLogin: string;
  status: "active" | "inactive" | "locked";
  avatarUrl?: string;
  backdropUrl?: string; 
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
  lastLogin:
    i % 3 === 0 ? "01/01/2025 (30 ngày trước)" : `khainq${205+i}@gmail.com`,
  status: i % 4 === 0 ? "locked" : i % 3 === 0 ? "inactive" : "active",
  avatarUrl: i % 5 === 0 ? "/images/logo.png" : undefined,
  backdropUrl: i % 4 === 0 ? "/movies/john-wick-4.jpg" : undefined, 
  role: "User",
  type: "Người dùng thông thường",
  isFlagged: i % 6 === 0,
}));
const mockUsers: User[] = Array.from({ length: 3 }, (_, k) =>
  baseMockUsers.map((user, j) => ({
    ...user,
    id: `user-${k}-${j + 1}`,
    maUser: `U${101 + k * 15 + j}`,
    username: `user${k}${j}`,
    fullName: `${user.fullName} (${k + 1})`,
    email: `user${k}${j}@email.com`,
  }))
).flat();
const mockWatchedMovies = [
  { id: 1, title: "John Wick 4", poster: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg" },
  { id: 2, title: "Tu Jhoothi Main Makkaar", poster: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg" },
  { id: 3, title: "Bholaa", poster: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg" },
  { id: 4, title: "Pathaan", poster: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg" },
  { id: 5, title: "Ant-Man", poster: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg" },
  { id: 6, title: "Movie 6", poster: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg" },
];
// -----------------------------------------------------


export default function UserDetail() {
  const router = useRouter();
  const params = useParams();
  const { userId } = params;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [currentStatus, setCurrentStatus] = useState<User["status"] | undefined>();
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const backdropInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const scrollRefHistory = useRef<HTMLDivElement>(null!);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
      const container = ref.current;
      if (!container) return;

      const scrollAmount = container.clientWidth;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (direction === "left") {
        if (container.scrollLeft <= 0) {
          container.scrollTo({ left: maxScroll, behavior: "smooth" });
        } else {
          container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        }
      } else {
        if (container.scrollLeft >= maxScroll) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    };

  useEffect(() => {
    setLoading(true);
    const foundUser = mockUsers.find((u) => u.id === userId);
    setTimeout(() => {
      setUser(foundUser || null);
      if (foundUser) {
        setCurrentStatus(foundUser.status);
        setAvatarPreview(foundUser.avatarUrl || null);
        setBackdropPreview(foundUser.backdropUrl || null);
      }
      setLoading(false);
    }, 500);
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

  const handleSaveChanges = () => {
    console.log("Saving data...", { currentStatus, backdropPreview, avatarPreview });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (user) {
        setCurrentStatus(user.status);
        setAvatarPreview(user.avatarUrl || null);
        setBackdropPreview(user.backdropUrl || null);
    }
    setIsEditing(false);
  }


  if (loading) {
    return <UserProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="p-6 text-white">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-white hover:text-white mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <p>Không tìm thấy người dùng.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 text-white">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-white hover:text-white mb-4 -ml-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Thông tin người dùng
      </Button>

      {/* === LAYOUT MỚI THEO MẪU === */}
      <div className="space-y-6 mt-4">
        
        {/* --- Section 1: Backdrop --- */}
        <div className="relative w-full">
          <div
            className={cn(
                "relative w-full h-48 sm:h-64 rounded-md overflow-hidden bg-slate-800/50 border border-dashed border-slate-600 flex items-center justify-center group",
                isEditing && "cursor-pointer hover:border-primary"
            )}
            onClick={() => isEditing && backdropInputRef.current?.click()}
          >
            {/* ... (Backdrop) ... */}
            {backdropPreview ? (
              <Image
                src={backdropPreview}
                alt="User Backdrop"
                layout="fill"
                className="object-cover opacity-60 group-hover:opacity-70 transition-opacity"
              />
            ) : (
              <div className="text-center text-gray-400 group-hover:text-primary transition-colors z-0">
                <ImageIcon className="w-10 h-10 mx-auto mb-1" />
                <p className="text-sm font-semibold">
                  {isEditing ? "Nhấn để chọn Backdrop" : "Không có backdrop"}
                </p>
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
            {/* ... (nút Edit/Save ... */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                {isEditing && (
                    <Button variant="outline" size="sm" className="bg-black/50 border-slate-700" onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}>
                        Hủy
                    </Button>
                )}
                <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    className={cn(
                        isEditing ? "bg-red-600 hover:bg-red-700" : "bg-black/50 border-slate-700"
                    )}
                    onClick={(e) => {
                        e.stopPropagation(); 
                        if (isEditing) {
                            handleSaveChanges();
                        } else {
                            setIsEditing(true);
                        }
                    }}
                >
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
                </Button>
            </div>
          </div>

          {/* --- Section 2: Avatar + Info --- */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 relative z-10 px-6 md:px-12 -mt-16">
            
            {/* Avatar*/}
            <div className="w-full md:w-auto flex-shrink-0 space-y-2 mx-auto md:mx-0">
              <div
                className={cn(
                  "relative rounded-full overflow-hidden bg-slate-700 border-4 border-[#1F1F1F] shadow-lg group",
                  "w-64 h-64", 
                  isEditing && "cursor-pointer hover:border-primary"
                )}
                onClick={() => isEditing && avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="User Avatar"
                    layout="fill"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-primary">
                    <ImageIcon className="w-10 h-10 mb-1" />
                    <span className="text-xs">Chọn Avatar</span>
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
              {isEditing && (
                <p
                  className="text-xs text-gray-400 underline cursor-pointer hover:text-primary text-center"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  Nhấn để đổi avatar
                </p>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 mt-6 md:mt-6 md:pt-16 min-w-0">
              <div>
                <Label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Tên hiển thị
                </Label>
                <Input
                  id="displayName"
                  defaultValue={user.fullName}
                  disabled={!isEditing}
                  className="bg-[#262626] border-slate-700 focus:border-primary focus:ring-primary text-lg"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-300 mb-1"
                    >
                    Username
                    </Label>
                    <Input
                    id="username"
                    defaultValue={user.username}
                    disabled 
                    className="bg-[#1a1b1f] border-slate-700 text-gray-500"
                    />
                </div>
                <div>
                    <Label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-300 mb-1"
                    >
                    Trạng thái
                    </Label>
                    <Select
                        value={currentStatus}
                        onValueChange={(value) => setCurrentStatus(value as User["status"])}
                        disabled={!isEditing}
                    >
                        <SelectTrigger className="w-full bg-[#262626] border-slate-700 focus:border-primary focus:ring-primary">
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1b1f] border border-slate-700 text-white">
                            <SelectItem value="active">
                                <span className="flex items-center text-green-400">
                                <CheckCircle className="w-4 h-4 mr-2" /> Hoạt động
                                </span>
                            </SelectItem>
                            <SelectItem value="inactive">
                                <span className="flex items-center text-yellow-400">
                                <AlertCircle className="w-4 h-4 mr-2" /> Không hoạt động
                                </span>
                            </SelectItem>
                            <SelectItem value="locked">
                                <span className="flex items-center text-red-400">
                                <XCircle className="w-4 h-4 mr-2" /> Đã khóa
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Section 3: Lịch sử, Playlist --- */}
        <div className="space-y-8 px-6 md:px-12">
          {/* Lịch sử xem phim */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold mb-4">Lịch sử xem phim</h2>
              <ArrowNavigation
                      onPrev={() => handleScroll(scrollRefHistory, "left")}
                      onNext={() => handleScroll(scrollRefHistory, "right")}
                    />
            </div>
            <div 
                ref={scrollRefHistory} 
                className="flex overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar gap-4 py-2"
            >
                {mockWatchedMovies.map((movie) => (
                    <div
                        key={movie.id}
                        className="flex-shrink-0 w-36 sm:w-40 md:w-48 aspect-[2/3] relative rounded-lg overflow-hidden cursor-pointer group"
                    >
                        <Image
                            src={movie.poster}
                            alt={movie.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 30vw, (max-width: 768px) 25vw, 16.6vw"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                            <span className="text-white text-sm font-medium line-clamp-2">{movie.title}</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Playlist */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Playlist của người dùng</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="bg-[#262626] border-slate-700 hover:border-slate-500 cursor-pointer transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-700 rounded-md flex items-center justify-center flex-shrink-0">
                    <ListMusic className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Phim hành động</h3>
                    <p className="text-sm text-gray-400">12 phim</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#262626] border-slate-700 hover:border-slate-500 cursor-pointer transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-700 rounded-md flex items-center justify-center flex-shrink-0">
                    <ListMusic className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Xem sau</h3>
                    <p className="text-sm text-gray-400">5 phim</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const UserProfileSkeleton = () => {
  return (
    <div className="p-4 md:p-6">
      <Skeleton className="h-8 w-48 bg-slate-700 mb-4" />
      <div className="space-y-6 mt-4">
        <div className="relative w-full">
          <Skeleton className="relative w-full h-48 sm:h-64 rounded-md bg-slate-700" />
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 relative z-10 px-6 md:px-12 -mt-32">
            <div className="w-full md:w-auto flex-shrink-0 mx-auto md:mx-0">
              <Skeleton className="w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-slate-600 border-4 border-[#1F1F1F]" />
            </div>
            <div className="flex-1 space-y-4 mt-6 md:mt-0 md:pt-16">
              <Skeleton className="h-8 w-3/4 bg-slate-700" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full bg-slate-700" />
                <Skeleton className="h-10 w-full bg-slate-700" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8 px-6 md:px-12">
          <div>
            <Skeleton className="h-6 w-1/3 bg-slate-700 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full bg-slate-700 rounded-lg" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-1/3 bg-slate-700 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full bg-slate-700 rounded-lg" />
              <Skeleton className="h-24 w-full bg-slate-700 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};