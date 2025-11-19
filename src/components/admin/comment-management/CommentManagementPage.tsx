/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
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
import { SearchBar } from "@/components/common/search-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trash,
  Eye,
  EyeOff,
  Reply,
  AlertCircle,
  MessageSquare,
  CheckCircle,
  ShieldAlert,
  ArchiveX,
  Sparkles,
  Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommentItem } from "@/components/comment/CommentItem";
import type { Comment } from "@/types/comment";
import { cn } from "@/lib/utils";

// --- Types và Mock Data (Giữ nguyên) ---
interface CommentUser {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
}
interface CommentMovie {
  id: string;
  title: string;
  slug: string;
  posterUrl?: string;
}
type AiFlag = 'toxic' | 'spoiler' | 'spam' | 'neutral';
interface MockComment {
  id: string;
  text: string;
  createdAt: string;
  is_hidden: boolean;
  is_deleted: boolean;
  isSpoiler: boolean;
  likes: number;
  user: CommentUser;
  movie: CommentMovie;
  parent_comment_id?: string | null;
  parent_comment_user?: string | null;
  ai_flag: AiFlag;
}
const mockUsers: { [key: string]: CommentUser } = {
  user1: { id: "user1", username: "quangkhai23", name: "Nguyễn Quang Khải", avatarUrl: "/images/placeholder-avatar.png" },
  user2: { id: "user2", username: "quochoi_le", name: "Lê Bùi Quốc Huy", avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
  user3: { id: "user3", username: "toxic_user", name: "Người dùng Toxic", avatarUrl: "" },
};
const mockMovies: { [key: string]: CommentMovie } = {
  movie1: { id: "movie1", title: "John Wick 4", slug: "john-wick-4", posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg" },
  movie2: { id: "movie2", title: "Interstellar", slug: "interstellar", posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
};
const allMockComments: MockComment[] = [
  {
    id: "cmt1",
    text: "Phim hay quá! Phần 4 này John Wick chiến thật sự, mãn nhãn từ đầu đến cuối.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    is_hidden: false, is_deleted: false, isSpoiler: false, likes: 15,
    user: mockUsers.user1, movie: mockMovies.movie1,
    ai_flag: 'neutral',
  },
  {
    id: "cmt2",
    text: "Phim dở tệ, xem tốn thời gian. Diễn viên đơ, kịch bản như ***.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    is_hidden: false, is_deleted: false, isSpoiler: false, likes: 2,
    user: mockUsers.user3, movie: mockMovies.movie1,
    ai_flag: 'toxic',
  },
  {
    id: "cmt5",
    text: "Bạn nói đúng đó, mình cũng thấy vậy.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    is_hidden: false, is_deleted: false, isSpoiler: false, likes: 1,
    user: mockUsers.user2, movie: mockMovies.movie1,
    parent_comment_id: "cmt1", parent_comment_user: mockUsers.user1.username,
    ai_flag: 'neutral',
  },
  {
    id: "cmt4",
    text: "SPOILER: Cuối phim nhân vật chính bay vào hố đen nhé.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    is_hidden: false, is_deleted: false, isSpoiler: true, likes: 8,
    user: mockUsers.user1, movie: mockMovies.movie2,
    ai_flag: 'spoiler',
  },
  {
    id: "cmt3",
    text: "Không hay bằng mấy phần trước nhưng vẫn đáng xem.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    is_hidden: true, is_deleted: false, isSpoiler: false, likes: 0,
    user: mockUsers.user2, movie: mockMovies.movie1,
    ai_flag: 'neutral',
  },
  {
    id: "cmt6",
    text: "Xem phim full HD không che tại link xyz.com nè anh em",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    is_hidden: false, is_deleted: false, isSpoiler: false, likes: 0,
    user: mockUsers.user3, movie: mockMovies.movie2,
    ai_flag: 'spam',
  },
];

function transformToUiComment(mock: MockComment): Comment {
  return {
    id: mock.id,
    user: { id: mock.user.id, name: mock.user.name, avatarUrl: mock.user.avatarUrl || '' },
    createdAt: mock.createdAt,
    text: mock.text,
    isSpoiler: mock.isSpoiler,
    likes: mock.likes,
    replies: [],
  };
}

type TabId = 'all' | 'flagged' | 'hidden' | 'visible';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Tất cả', icon: Inbox },
  { id: 'flagged', label: 'Chờ duyệt (AI)', icon: Sparkles },
  { id: 'hidden', label: 'Đã ẩn', icon: EyeOff },
];

const getAiBadge = (flag: AiFlag, small = false) => {
  const sizeClass = small ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs";
  switch (flag) {
    case 'toxic':
      return <Badge variant="destructive" className={cn("bg-red-900/50 text-red-400 border border-red-600/50", sizeClass)}>Độc hại</Badge>;
    case 'spoiler':
      return <Badge variant="destructive" className={cn("bg-yellow-900/50 text-yellow-400 border border-yellow-600/50", sizeClass)}>Tiết lộ</Badge>;
    case 'spam':
      return <Badge variant="destructive" className={cn("bg-orange-900/50 text-orange-400 border border-orange-600/50", sizeClass)}>Spam</Badge>;
    default:
      return null;
  }
};

const CommentDetailPanel = ({
  comment,
  onToggleHide,
  onDelete,
}: {
  comment: MockComment | null;
  onToggleHide: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}) => {
  if (!comment) {
    return (
      <Card className="bg-[#262626] border-slate-800 text-white h-full">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-gray-500 p-4 text-center">
            <MessageSquare className="w-16 h-16 mb-4 text-slate-700" />
            <p className="font-semibold text-base text-gray-300">Chọn một bình luận</p>
            <p className="text-sm">Nội dung chi tiết và hành động sẽ xuất hiện ở đây.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const uiComment = transformToUiComment(comment);

  return (
    <Card className="bg-[#262626] border-slate-800 text-white h-full flex flex-col overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-700 flex-shrink-0">
        <h3 className="text-sm font-semibold mb-3">Ngữ cảnh</h3>
        <div className="flex items-center gap-2">
          <Image
            src={comment.movie.posterUrl || "/images/placeholder-poster.png"}
            alt={comment.movie.title}
            width={32}
            height={48}
            className="w-8 h-12 object-cover rounded-sm bg-slate-700"
          />
          <div className="text-xs">
            <p className="text-gray-400">Trên phim:</p>
            <a
              href={`/movies/${comment.movie.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white hover:underline"
            >
              {comment.movie.title}
            </a>
          </div>
        </div>
        {comment.parent_comment_id && (
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
            <Reply className="w-4 h-4" />
            <span>Trả lời <strong>@{comment.parent_comment_user || '...'}</strong></span>
          </div>
        )}
      </CardHeader>

      {/* 2. Content: Component CommentItem gốc */}
      <ScrollArea className="flex-1">
        <CardContent className="p-4">
          <CommentItem comment={uiComment} />
        </CardContent>
      </ScrollArea>

      <CardContent className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-white">Hành động</span>
          <Badge
            variant={comment.is_hidden ? "destructive" : "default"}
            className={comment.is_hidden
              ? "bg-gray-700/50 text-gray-400 border border-gray-600/50"
              : "bg-green-900/50 text-green-400 border border-green-600/50"
            }
          >
            {comment.is_hidden ? <EyeOff className="w-3 h-3 mr-1.5" /> : <CheckCircle className="w-3 h-3 mr-1.5" />}
            {comment.is_hidden ? "Đã ẩn" : "Đang hiển thị"}
          </Badge>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant={comment.is_hidden ? "default" : "outline"}
            className={`flex-1 ${comment.is_hidden ? "bg-green-600 hover:bg-green-700" : "border-yellow-500 text-yellow-500 hover:bg-yellow-600/20 hover:text-yellow-400"}`}
            onClick={() => onToggleHide(comment.id, comment.is_hidden)}
          >
            {comment.is_hidden ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {comment.is_hidden ? "Hiện" : "Ẩn"}
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onDelete(comment.id)}
          >
            <Trash className="w-4 h-4 mr-2" />
            Xóa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CommentTableSkeleton = () => (
  <Card className="h-full overflow-hidden bg-[#262626] border-slate-800 text-white">
    <ScrollArea className="h-full">
      <Table>
        <TableHeader className="sticky top-0 bg-[#262626] z-10">
          <TableRow className="border-slate-700 hover:bg-transparent">
            <TableHead className="text-white">Người dùng</TableHead>
            <TableHead className="text-white">Bình luận</TableHead>
            <TableHead className="text-white">Trạng thái (AI)</TableHead>
            <TableHead className="text-white">Phim</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 15 }).map((_, i) => (
            <TableRow key={i} className="border-slate-800">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
                  <Skeleton className="h-4 w-24 bg-slate-700" />
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-40 bg-slate-700" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full bg-slate-700" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24 bg-slate-700" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  </Card>
);

export default function CommentManagementPage() {
  const [comments, setComments] = useState<MockComment[]>([]);
  const [selectedComment, setSelectedComment] = useState<MockComment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setComments(allMockComments);
        if (allMockComments.length > 0) {
          setSelectedComment(allMockComments[0]);
        }
      } catch (err) {
        setError("Không thể tải danh sách bình luận.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadComments();
  }, []);

  const commentCounts = useMemo(() => {
    const activeComments = comments.filter(c => !c.is_deleted);
    return {
      all: activeComments.length,
      visible: activeComments.filter(c => !c.is_hidden).length,
      hidden: activeComments.filter(c => c.is_hidden).length,
      flagged: activeComments.filter(c => c.ai_flag !== 'neutral').length,
    };
  }, [comments]);

  const filteredComments = useMemo(() => {
    let filtered = comments.filter(c => !c.is_deleted);

    switch (activeTab) {
      case 'visible':
        filtered = filtered.filter(c => !c.is_hidden);
        break;
      case 'hidden':
        filtered = filtered.filter(c => c.is_hidden);
        break;
      case 'flagged':
        filtered = filtered.filter(c => c.ai_flag !== 'neutral');
        break;
      case 'all':
      default:
        break;
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(comment =>
        comment.text.toLowerCase().includes(lowerSearch) ||
        comment.user.username.toLowerCase().includes(lowerSearch) ||
        comment.movie.title.toLowerCase().includes(lowerSearch)
      );
    }
    
    if (filtered.length > 0 && !filtered.find(c => c.id === selectedComment?.id)) {
        setSelectedComment(filtered[0]);
    } else if (filtered.length === 0) {
        setSelectedComment(null);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [comments, searchTerm, activeTab, selectedComment?.id]);


  const handleToggleHide = (id: string, currentStatus: boolean) => {
    const actionText = currentStatus ? "Hiện" : "Ẩn";
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 500)),
      {
        loading: `Đang ${actionText.toLowerCase()} bình luận...`,
        success: () => {
          setComments(prev =>
            prev.map(c => (c.id === id ? { ...c, is_hidden: !c.is_hidden } : c))
          );
          if (selectedComment?.id === id) {
            setSelectedComment(prev => prev ? { ...prev, is_hidden: !prev.is_hidden } : null);
          }
          return `${actionText} bình luận thành công.`;
        },
        error: `Lỗi khi ${actionText.toLowerCase()} bình luận.`,
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn bình luận này?")) return;

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 500)),
      {
        loading: "Đang xóa bình luận...",
        success: () => {
          setComments(prev => prev.filter(c => c.id !== id));
          if (selectedComment?.id === id) {
            setSelectedComment(null);
          }
          return "Xóa bình luận thành công.";
        },
        error: "Lỗi khi xóa bình luận.",
      }
    );
  };

  const fixedHeight = "h-[calc(100vh-theme(space.16)-theme(space.24))]";

  return (
    <div className={`flex w-full gap-6 ${fixedHeight}`}>
    
      <div className="flex flex-1 flex-col space-y-4 min-h-0">
        <h1 className="text-2xl font-bold text-white flex-shrink-0">
          Quản lý Bình luận
        </h1>
        
        <Card className="bg-[#262626] border-slate-800 text-white flex-shrink-0">
          <CardHeader className="p-3 border-b border-slate-700">
            {/* Tabs AI */}
            <div className="flex items-center gap-2">
              {tabs.map((tab) => {
                const count = commentCounts[tab.id];
                const isActive = activeTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "gap-2",
                      isActive
                        ? "bg-slate-700 text-white"
                        : "text-gray-400 hover:bg-slate-800 hover:text-white",
                      tab.id === 'flagged' && count > 0 && !isActive && "text-yellow-400"
                    )}
                  >
                    <tab.icon className={cn("w-4 h-4", tab.id === 'flagged' && count > 0 && "text-yellow-500")} />
                    {tab.label}
                    {count > 0 && (
                      <Badge className={cn(
                        "px-1.5 py-0 text-xs",
                        isActive ? "bg-primary text-white" : "bg-slate-600 text-gray-200"
                      )}>
                        {count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <SearchBar
              placeholder="Tìm bình luận, người dùng, phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex-grow overflow-hidden min-h-0">
          {loading ? (
            <CommentTableSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500 bg-[#262626] border border-red-800 rounded-md p-6">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>Lỗi: {error}</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-[#262626] border border-slate-800 rounded-md p-6">
              <MessageSquare className="h-16 w-16 mb-4 text-slate-700" />
              <p className="font-semibold text-lg">Không có gì ở đây</p>
              <p className="text-sm text-slate-500">Không tìm thấy bình luận nào khớp với bộ lọc của bạn.</p>
            </div>
          ) : (
            <Card className="h-full overflow-hidden bg-[#262626] border-slate-800 text-white">
              <ScrollArea className="h-full">
                <Table className="relative w-full">
                  <TableHeader className="sticky top-0 bg-[#262626] z-10">
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-white">Người dùng</TableHead>
                      <TableHead className="text-white">Bình luận</TableHead>
                      <TableHead className="text-white">Trạng thái (AI)</TableHead>
                      <TableHead className="text-white">Phim</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.map((comment) => (
                      <TableRow
                        key={comment.id}
                        className={cn(
                          "border-slate-800 hover:bg-slate-800/50 cursor-pointer",
                          selectedComment?.id === comment.id && "bg-slate-700/60"
                        )}
                        onClick={() => setSelectedComment(comment)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.user.avatarUrl} />
                              <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="truncate w-48 text-gray-300 text-sm">
                            {comment.parent_comment_id && <Reply className="w-3 h-3 inline mr-1" />}
                            {comment.text}
                          </p>
                        </TableCell>
                        <TableCell>
                          {getAiBadge(comment.ai_flag)}
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">{comment.movie.title}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          )}
        </div>

      </div>

      {/* Cột 2: Chi tiết & Hành động (Sidebar) */}
      <div className={`hidden lg:block lg:w-80 xl:w-96 2xl:w-[450px] flex-shrink-0 ${fixedHeight}`}>
        <CommentDetailPanel
          comment={selectedComment}
          onToggleHide={handleToggleHide}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}