"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter, 
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ShieldAlert,
  History,
  Archive,
  Ban,
  Heart,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { adminBlogService } from "@/services/admin.blog.service";
import { BlogPost, PostStatus } from "@/types/blog";
import { BlogCommentSection } from "@/components/comment/BlogCommentSection";

export default function BlogManager() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pagination & Filter States
  const [pagination, setPagination] = useState({
    page: 1,
    take: 10,
    total: 0,
    totalPages: 1,
  });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminBlogService.getAllBlogs({
        page: pagination.page,
        take: pagination.take,
        status: statusFilter,
        search: debouncedSearch,
      });

      setBlogs(data.blogs);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      console.error("Lỗi khi tải danh sách bài viết:", error);
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.take, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [statusFilter, debouncedSearch]);

  const handleUpdateStatus = async (blogId: string, newStatus: PostStatus) => {
    try {
      setUpdatingId(blogId);
      await adminBlogService.updateBlogStatus(blogId, newStatus);
      toast.success(`Đã cập nhật trạng thái bài viết thành công`);
      
      // Update local state
      setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, status: newStatus } : b));
      if (selectedBlog?.id === blogId) {
        setSelectedBlog(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
      if (viewDialogOpen) setViewDialogOpen(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case PostStatus.PUBLISHED: return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Đã đăng</Badge>;
      case PostStatus.HIDDEN: return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Đã ẩn</Badge>;
      case PostStatus.REJECTED: return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Đã từ chối</Badge>;
      case PostStatus.ARCHIVED: return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Lưu trữ</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-white/90">Quản lý Blog</h2>
           <p className="text-gray-400 mt-1">Duyệt và quản lý tất cả bài viết trên hệ thống.</p>
        </div>
      </div>

      <Card className="bg-[#1F1F1F] border-slate-800 text-white">
          <CardHeader className="pb-3">
              <div className="flex md:flex-row flex-col gap-4 justify-between">
                  <div className="relative w-full md:w-1/3">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                          placeholder="Tìm theo tiêu đề, slug..."
                          className="pl-9 bg-[#262626] border-slate-700 focus:border-purple-500"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                  </div>
                  <div className="flex items-center gap-2">
                       <Filter className="h-4 w-4 text-gray-400" />
                       <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[180px] bg-[#262626] border-slate-700">
                              <SelectValue placeholder="Trạng thái" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#262626] border-slate-700 text-white">
                              <SelectItem value="ALL">Tất cả</SelectItem>
                              <SelectItem value={PostStatus.PUBLISHED}>Đã đăng</SelectItem>
                              <SelectItem value={PostStatus.REJECTED}>Từ chối</SelectItem>
                              <SelectItem value={PostStatus.HIDDEN}>Đã ẩn</SelectItem>
                              <SelectItem value={PostStatus.ARCHIVED}>Lưu trữ</SelectItem>
                          </SelectContent>
                       </Select>
                  </div>
              </div>
          </CardHeader>
          <CardContent>
              <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-[#1F1F1F]/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                    </div>
                )}
                <Table>
                    <TableHeader className="bg-[#141414] hover:bg-[#141414]">
                        <TableRow className="border-slate-800 hover:bg-[#141414]">
                            <TableHead className="text-gray-400">Tiêu đề / Slug</TableHead>
                            <TableHead className="text-gray-400">Tác giả</TableHead>
                            <TableHead className="text-gray-400">Trạng thái</TableHead>
                            <TableHead className="text-gray-400 text-center">Tương tác</TableHead>
                            <TableHead className="text-gray-400">Ngày tạo</TableHead>
                            <TableHead className="text-gray-400 text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {blogs.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                                    Không tìm thấy bài viết nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            blogs.map((blog) => (
                                <TableRow key={blog.id} className="border-slate-800 hover:bg-[#262626]/50">
                                    <TableCell className="max-w-[300px]">
                                        <div className="font-medium text-white truncate" title={blog.title}>{blog.title}</div>
                                        <div className="text-xs text-gray-500 truncate">{blog.slug}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <img 
                                                src={blog.user?.avatar_url || '/images/placeholder-avatar.png'} 
                                                alt="avatar" 
                                                className="h-6 w-6 rounded-full object-cover"
                                            />
                                            <span className="text-gray-300 text-sm">{blog.user?.display_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {updatingId === blog.id ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                                                <span className="text-xs text-gray-500">Đang xử lý...</span>
                                            </div>
                                        ) : (
                                            getStatusBadge(blog.status)
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col text-xs text-gray-500">
                                            <span>{blog._count?.likes || 0} thích</span>
                                            <span>{blog._count?.bookmarks || 0} lưu</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                                        {format(new Date(blog.created_at), "HH:mm:ss dd/MM/yyyy", { locale: vi })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-slate-700"
                                                onClick={() => {
                                                    setSelectedBlog(blog);
                                                    setViewDialogOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-slate-700"
                                                        disabled={updatingId === blog.id}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#262626] border-slate-700 text-white w-48">
                                                    <DropdownMenuLabel>Hành động nhanh</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-slate-700" />
                                                    
                                                    {/* Duyệt & Đăng bài cho bài bị từ chối */}
                                                    {blog.status === PostStatus.REJECTED && (
                                                        <DropdownMenuItem 
                                                            className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer text-green-400"
                                                            onClick={() => handleUpdateStatus(blog.id, PostStatus.PUBLISHED)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" /> Duyệt & Đăng bài
                                                        </DropdownMenuItem>
                                                    )}
                                                    
                                                    {/* Ẩn bài cho bài đang Đã đăng */}
                                                    {blog.status === PostStatus.PUBLISHED && (
                                                        <DropdownMenuItem 
                                                            className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer text-red-400"
                                                            onClick={() => handleUpdateStatus(blog.id, PostStatus.HIDDEN)}
                                                        >
                                                            <ShieldAlert className="h-4 w-4 mr-2" /> Ẩn bài viết
                                                        </DropdownMenuItem>
                                                    )}

                                                    {/* Khôi phục cho bài Đã ẩn hoặc Lưu trữ */}
                                                    {(blog.status === PostStatus.HIDDEN || blog.status === PostStatus.ARCHIVED) && (
                                                        <DropdownMenuItem 
                                                            className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer text-blue-400"
                                                            onClick={() => handleUpdateStatus(blog.id, PostStatus.PUBLISHED)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" /> Khôi phục bài
                                                        </DropdownMenuItem>
                                                    )}


                                                    {/* Lưu trữ cho bài không phải Lưu trữ */}
                                                    {blog.status !== PostStatus.ARCHIVED && (
                                                        <DropdownMenuItem 
                                                            className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer text-gray-400"
                                                            onClick={() => handleUpdateStatus(blog.id, PostStatus.ARCHIVED)}
                                                        >
                                                            <Archive className="h-4 w-4 mr-2" /> Lưu trữ
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                      <p className="text-sm text-gray-500">
                          Hiển thị {(pagination.page - 1) * pagination.take + 1} - {Math.min(pagination.page * pagination.take, pagination.total)} trong tổng số {pagination.total}
                      </p>
                      <div className="flex items-center gap-2">
                          <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-slate-700 text-gray-400 hover:text-white"
                              disabled={pagination.page <= 1}
                              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          >
                              <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                          </Button>
                          <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                  let pageNum = pagination.page <= 3 ? i + 1 : pagination.page + i - 2;
                                  if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - (4 - i);
                                  if (pageNum < 1) pageNum = i + 1;
                                  if (pageNum > pagination.totalPages) return null;

                                  return (
                                      <Button
                                          key={i}
                                          variant={pagination.page === pageNum ? "default" : "outline"}
                                          size="sm"
                                          className={pagination.page === pageNum ? "bg-purple-600 hover:bg-purple-700" : "bg-transparent border-slate-700 text-gray-400"}
                                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                      >
                                          {pageNum}
                                      </Button>
                                  );
                              })}
                          </div>
                          <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-slate-700 text-gray-400 hover:text-white"
                              disabled={pagination.page >= pagination.totalPages}
                              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          >
                              Sau <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                      </div>
                  </div>
              )}
          </CardContent>
      </Card>

      {/* --- VIEW BLOG DIALOG --- */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-[#1F1F1F] border-slate-800 text-white sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-6xl max-h-[95vh] overflow-y-auto p-0 gap-0 custom-scrollbar">
            {selectedBlog && (
                <>
                    <DialogHeader className="sr-only">
                        <DialogTitle>{selectedBlog.title}</DialogTitle>
                        <DialogDescription>Chi tiết bài viết {selectedBlog.title}</DialogDescription>
                    </DialogHeader>

                    {/* Cover Image */}
                    <div className="relative w-full bg-slate-900 overflow-hidden border-b border-slate-800">
                        {selectedBlog.thumbnail ? (
                            <img 
                                src={selectedBlog.thumbnail} 
                                alt={selectedBlog.title} 
                                className="w-full h-auto max-h-[600px] object-contain block mx-auto"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-gray-500">
                                Không có ảnh bìa
                            </div>
                        )}
                        <div className="absolute top-4 left-4 z-10">
                            {getStatusBadge(selectedBlog.status)}
                        </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        {/* Header Info */}
                        <div>
                            <h2 className="text-3xl font-bold leading-tight mb-4 text-white">{selectedBlog.title}</h2>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-b border-slate-800 pb-6">
                                <div className="flex items-center gap-2">
                                    <img 
                                        src={selectedBlog.user?.avatar_url || '/images/placeholder-avatar.png'} 
                                        alt="avatar" 
                                        className="h-8 w-8 rounded-full object-cover border border-purple-500/30"
                                    />
                                    <span className="text-white font-medium text-base">{selectedBlog.user?.display_name}</span>
                                </div>
                                <span className="hidden sm:inline">•</span>
                                <span>{format(new Date(selectedBlog.created_at), "HH:mm:ss, dd/MM/yyyy", { locale: vi })}</span>
                                {selectedBlog.movie && (
                                    <>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="text-blue-400">Phim: {selectedBlog.movie.title}</span>
                                    </>
                                )}
                                <div className="flex items-center gap-3 ml-auto">
                                    <div className="flex items-center gap-1.5 text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-full border border-rose-400/20">
                                        <Heart className="h-3.5 w-3.5 fill-rose-400" />
                                        <span className="font-bold text-xs">{selectedBlog._count?.likes || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sky-400 bg-sky-400/10 px-2.5 py-1 rounded-full border border-sky-400/20">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span className="font-bold text-xs">{selectedBlog._count?.comments || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="space-y-8">
                            <div 
                                className="text-gray-300 leading-relaxed whitespace-pre-line text-lg font-light blog-content-preview"
                                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                            />

                            <div className="pt-10 border-t border-slate-800/50">
                                <BlogCommentSection blogId={selectedBlog.id} />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-800 gap-4">
                             <Button variant="ghost" onClick={() => setViewDialogOpen(false)} className="w-full sm:w-auto hover:bg-slate-800 text-gray-400 hover:text-white">
                                Đóng lại
                             </Button>
                             <div className="flex gap-3 w-full sm:w-auto">
                                {selectedBlog.status !== PostStatus.PUBLISHED && (
                                     <Button 
                                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-medium"
                                        disabled={updatingId === selectedBlog.id}
                                        onClick={() => handleUpdateStatus(selectedBlog.id, PostStatus.PUBLISHED)}
                                     >
                                        {updatingId === selectedBlog.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                        Duyệt & Đăng bài
                                     </Button>
                                )}
                                {selectedBlog.status === PostStatus.PUBLISHED && (
                                    <Button 
                                        variant="destructive"
                                        className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 font-medium"
                                        disabled={updatingId === selectedBlog.id}
                                        onClick={() => handleUpdateStatus(selectedBlog.id, PostStatus.HIDDEN)}
                                    >
                                        {updatingId === selectedBlog.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
                                        Ẩn bài viết
                                    </Button>
                                )}
                                {selectedBlog.status === PostStatus.HIDDEN && (
                                    <Button 
                                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                        disabled={updatingId === selectedBlog.id}
                                        onClick={() => handleUpdateStatus(selectedBlog.id, PostStatus.PUBLISHED)}
                                    >
                                        {updatingId === selectedBlog.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                        Khôi phục bài
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}