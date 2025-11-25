/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Inbox,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommentItem } from "@/components/comment/CommentItem";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/apiClient";
import { Pagination } from "@/components/common/pagination";
import { CommentData } from "@/types/comment";

type TabId = 'all' | 'flagged' | 'hidden';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Tất cả', icon: Inbox },
  { id: 'flagged', label: 'Cần xem xét (AI)', icon: Sparkles },
  { id: 'hidden', label: 'Đã ẩn', icon: EyeOff },
];

interface AdminCommentData extends CommentData {
  movie: {
    id: string;
    title: string;
    slug: string;
    poster_url: string | null;
  };
  toxicity_score: number;
  is_hidden: boolean;
}

export default function CommentManagementPage() {
  const [comments, setComments] = useState<AdminCommentData[]>([]);
  const [selectedComment, setSelectedComment] = useState<AdminCommentData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("all");
  
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        take: 20,
        q: debouncedSearchTerm,
        filter: activeTab, 
      };
      
      const res = await apiClient.get('/comments/admin/list', { params });
      
      setComments(res.data.data);
      setPagination(prev => ({
        ...prev,
        totalPages: res.data.pagination.totalPages,
        total: res.data.pagination.total
      }));
      
      if (res.data.data.length > 0) {
        setSelectedComment((prev) => {
            if (prev && res.data.data.some((c: AdminCommentData) => c.id === prev.id)) {
                return res.data.data.find((c: AdminCommentData) => c.id === prev.id) || res.data.data[0];
            }
            return res.data.data[0];
        });
      } else {
          setSelectedComment(null);
      }

    } catch (err) {
      console.error("Lỗi fetch comments:", err);
      toast.error("Lỗi tải danh sách bình luận");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, debouncedSearchTerm, activeTab]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [activeTab, debouncedSearchTerm]);

  // 1. Ẩn/Hiện bình luận
  const handleToggleHide = async (id: string, currentStatus: boolean) => {
    const actionText = currentStatus ? "Hiện" : "Ẩn";
    const previousComments = [...comments];
    
    setComments(prev => prev.map(c => c.id === id ? { ...c, is_hidden: !c.is_hidden } : c));
    if (selectedComment?.id === id) {
        setSelectedComment((prev: any) => ({ ...prev, is_hidden: !prev.is_hidden }));
    }

    try {
        await apiClient.put(`/comments/admin/${id}/toggle-hide`);
        toast.success(`Đã ${actionText.toLowerCase()} bình luận.`);
    } catch (error) {
        setComments(previousComments);
        if (selectedComment?.id === id) {
             setSelectedComment((prev: any) => ({ ...prev, is_hidden: currentStatus }));
        }
        toast.error(`Lỗi khi ${actionText.toLowerCase()} bình luận.`);
    }
  };

  // 2. Xóa bình luận (Soft delete)
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này? Hành động này sẽ ẩn bình luận vĩnh viễn.")) return;
    
    try {
        await apiClient.delete(`/comments/admin/${id}`);
        
        setComments(prev => prev.filter(c => c.id !== id));
        if (selectedComment?.id === id) setSelectedComment(null);
        
        toast.success("Đã xóa bình luận.");
    } catch (error) {
        toast.error("Lỗi khi xóa bình luận.");
    }
  };

  // Helper xác định AI Flag để hiển thị Badge
  const getAiStatus = (comment: AdminCommentData) => {
      const score = comment.toxicity_score || 0;
      if (score > 0.7) return { label: "Độc hại", color: "text-red-400 border-red-500 bg-red-900/30" };
      if (comment.is_spoiler) return { label: "Spoiler", color: "text-yellow-400 border-yellow-500 bg-yellow-900/30" };
      return null;
  };

  const fixedHeight = "h-[calc(100vh-theme(space.16)-theme(space.24))]";

  return (
    <div className={`flex w-full gap-6 ${fixedHeight}`}>
      
      <div className="flex flex-1 flex-col space-y-4 min-h-0">
        <h1 className="text-2xl font-bold text-white flex-shrink-0">Quản lý Bình luận</h1>
        
        <Card className="bg-[#262626] border-slate-800 text-white flex-shrink-0">
          <CardHeader className="p-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "gap-2",
                    activeTab === tab.id ? "bg-slate-700 text-white" : "text-gray-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <SearchBar
              placeholder="Tìm nội dung, người dùng, tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex-grow overflow-hidden min-h-0">
          {loading && comments.length === 0 ? (
             <CommentTableSkeleton />
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-[#262626] border border-slate-800 rounded-md p-6">
              <MessageSquare className="h-16 w-16 mb-4 text-slate-700" />
              <p className="font-semibold text-lg">Không tìm thấy dữ liệu</p>
              <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <Card className="h-full overflow-hidden bg-[#262626] border-slate-800 text-white flex flex-col">
              <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
                <div className="pb-4">
                  <Table className="relative w-full">
                    <TableHeader className="sticky top-0 bg-[#262626] z-10">
                      <TableRow className="border-slate-700 hover:bg-transparent">
                        <TableHead className="text-white pl-4">Người dùng</TableHead>
                        <TableHead className="text-white">Nội dung</TableHead>
                        <TableHead className="text-white">AI Đánh giá</TableHead>
                        <TableHead className="text-white">Phim</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comments.map((comment) => {
                        const aiStatus = getAiStatus(comment);
                        return (
                          <TableRow
                            key={comment.id}
                            className={cn(
                              "border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors",
                              selectedComment?.id === comment.id && "bg-slate-700/60"
                            )}
                            onClick={() => setSelectedComment(comment)}
                          >
                            <TableCell className="pl-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.user?.avatar_url || ''} />
                                  <AvatarFallback>{comment.user?.display_name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-white">{comment.user?.display_name}</span>
                                  <span className="text-xs text-gray-500">@{comment.user?.username || 'unknown'}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="truncate w-64 text-gray-300 text-sm">
                                {comment.parent_comment_id && <Reply className="w-3 h-3 inline mr-1 text-gray-500" />}
                                {comment.comment}
                              </p>
                            </TableCell>
                            <TableCell>
                              {aiStatus ? (
                                  <Badge variant="outline" className={`${aiStatus.color} border whitespace-nowrap`}>
                                      {aiStatus.label} {((comment.toxicity_score || 0) * 100).toFixed(0)}%
                                  </Badge>
                              ) : (
                                  <Badge variant="outline" className="text-green-400 border-green-900 bg-green-900/10 whitespace-nowrap">An toàn</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-300 text-sm max-w-[150px] truncate" title={comment.movie?.title}>
                                {comment.movie?.title}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {pagination.totalPages > 1 && (
                  <div className="border-t border-slate-800 p-2 bg-[#262626]">
                      <Pagination 
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={(p) => setPagination(prev => ({...prev, page: p}))}
                      />
                  </div>
              )}
            </Card>
          )}
        </div>
      </div>

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

const CommentTableSkeleton = () => (
    <Card className="h-full overflow-hidden bg-[#262626] border-slate-800 text-white">
      <div className="p-4 space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3 bg-slate-700" />
              <Skeleton className="h-4 w-full bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </Card>
);

const CommentDetailPanel = ({ 
    comment, 
    onToggleHide, 
    onDelete 
}: { 
    comment: AdminCommentData | null, 
    onToggleHide: (id: string, status: boolean) => void, 
    onDelete: (id: string) => void 
}) => {
  if (!comment) {
    return (
      <Card className="bg-[#262626] border-slate-800 text-white h-full">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MessageSquare className="w-16 h-16 mb-4 mx-auto opacity-50" />
            <p>Chọn bình luận để xem chi tiết</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayComment: any = {
      ...comment,
      user: {
          ...comment.user,
          avatar_url: comment.user.avatar_url 
      }
  };

  return (
    <Card className="bg-[#262626] border-slate-800 text-white h-full flex flex-col">
      <CardHeader className="p-4 border-b border-slate-700 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-400 uppercase">Thông tin ngữ cảnh</h3>
        <div className="flex items-center gap-3 mt-2">
            <Image 
                src={comment.movie?.poster_url || "/images/placeholder-poster.png"} 
                alt="Poster" width={40} height={60} className="rounded bg-slate-800 object-cover"
            />
            <div className="overflow-hidden">
                <p className="font-bold text-sm line-clamp-1" title={comment.movie?.title}>{comment.movie?.title}</p>
                <a 
                    href={`/movies/${comment.movie?.slug}`} 
                    target="_blank" 
                    className="text-xs text-blue-400 hover:underline truncate block"
                >
                    Xem trang phim
                </a>
            </div>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4">
        <div className="pb-10 space-y-6">
            <div className="break-words break-all whitespace-pre-wrap w-full">
                <CommentItem 
                    comment={displayComment} 
                    movieId={comment.movie?.id} 
                    onCommentUpdated={() => {}} 
                />
            </div>
            
            <div className="bg-black/20 p-3 rounded border border-slate-700">
                <p className="text-xs text-gray-400 mb-2 font-semibold">CHỈ SỐ ĐỘC HẠI (TOXICITY SCORE)</p>
                <div className="flex items-center gap-3">
                    <div className="h-3 flex-1 bg-slate-700 rounded-full overflow-hidden min-w-0">
                        <div 
                            className={`h-full transition-all duration-500 ${comment.toxicity_score > 0.7 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${(comment.toxicity_score || 0) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-mono font-bold text-white flex-shrink-0">
                        {((comment.toxicity_score || 0) * 100).toFixed(1)}%
                    </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                    * Điểm trên 70% được coi là có khả năng độc hại cao.
                </p>
            </div>

        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-700 space-y-3 bg-[#1F1F1F] flex-shrink-0">
         <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Trạng thái hiện tại:</span>
            <Badge variant={comment.is_hidden ? "destructive" : "secondary"} className="capitalize">
                {comment.is_hidden ? "Đang ẩn" : "Đang hiển thị"}
            </Badge>
         </div>
         <div className="grid grid-cols-2 gap-3">
            <Button 
                variant={comment.is_hidden ? "default" : "secondary"}
                className={cn(
                    "w-full",
                    comment.is_hidden ? "bg-green-600 hover:bg-green-700" : "bg-slate-700 hover:bg-slate-600 text-white"
                )}
                onClick={() => onToggleHide(comment.id, comment.is_hidden)}
            >
                {comment.is_hidden ? <Eye className="w-4 h-4 mr-2"/> : <EyeOff className="w-4 h-4 mr-2"/>}
                {comment.is_hidden ? "Hiển thị lại" : "Ẩn bình luận"}
            </Button>
            <Button 
                variant="destructive" 
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => onDelete(comment.id)}
            >
                <Trash className="w-4 h-4 mr-2"/> Xóa vĩnh viễn
            </Button>
         </div>
      </div>
    </Card>
  );
};