"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ThumbsUp,
  Bookmark,
  Eye,
  Calendar,
  ArrowLeft,
  Film,
  AlertTriangle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Share2,
  MessageCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { blogService } from "@/services/blog.service";
import { BlogPost } from "@/types/blog";
import { MarkdownRenderer } from "@/components/post/MarkdownRenderer";
import CreatePostModal from "@/components/post/CreatePostModal";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user, isLoggedIn } = useAuth();

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState(false);

  const fetchedRef = useRef(false);

  const fetchBlog = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await blogService.getBlogBySlug(slug);
      const data: BlogPost = response.data;
      setBlog(data);
      setLikesCount(data._count?.likes ?? data.likes?.length ?? 0);
      setBookmarksCount(data._count?.bookmarks ?? data.bookmarks?.length ?? 0);
      if (user) {
        setIsLiked(data.likes?.some((l) => l.user_id === user.id) ?? false);
        setIsBookmarked(data.bookmarks?.some((b) => b.user_id === user.id) ?? false);
      }
    } catch (err: any) {
      console.error("Failed to fetch blog:", err);
      if (err.response?.status === 404) {
        setError("Bài viết không tồn tại hoặc đã bị xóa.");
      } else {
        setError("Có lỗi xảy ra khi tải bài viết.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug, user]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchBlog();
    }
  }, [fetchBlog]);

  const isOwner = user?.id === blog?.user?.id;

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để thích bài viết");
      return;
    }
    if (!blog?.id || isLiking) return;
    setIsLiking(true);
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    try {
      await blogService.toggleLike(blog.id);
    } catch {
      setIsLiked(isLiked);
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
      toast.error("Không thể thực hiện thao tác");
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để lưu bài viết");
      return;
    }
    if (!blog?.id || isBookmarking) return;
    setIsBookmarking(true);
    setIsBookmarked(!isBookmarked);
    setBookmarksCount((prev) => (isBookmarked ? prev - 1 : prev + 1));
    try {
      await blogService.toggleBookmark(blog.id);
    } catch {
      setIsBookmarked(isBookmarked);
      setBookmarksCount((prev) => (isBookmarked ? prev + 1 : prev - 1));
      toast.error("Không thể thực hiện thao tác");
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleDelete = async () => {
    if (!blog?.id) return;
    setIsDeleting(true);
    try {
      await blogService.deleteBlogPost(blog.id);
      toast.success("Đã xóa bài viết");
      router.push("/blog");
    } catch {
      toast.error("Không thể xóa bài viết");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết bài viết");
  };

  if (isLoading) {
    return <BlogDetailSkeleton />;
  }

  if (error || !blog) {
    return (
      <div className="bg-black min-h-screen flex flex-col font-sans dark text-white">
        <Navbar />
        <main className="flex-grow pt-24 pb-20 px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h1 className="text-2xl font-bold text-white mb-3">
              {error || "Bài viết không tồn tại"}
            </h1>
            <p className="text-zinc-400 mb-8">
              Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <Button
              onClick={() => router.push("/blog")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col font-sans dark text-white">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4 md:px-8">
        <article className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-white -ml-4"
              onClick={() => router.push("/blog")}
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Quay lại
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-white">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark bg-zinc-900 border-zinc-700 text-white">
                  {isOwner && (
                    <>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setShowEditDialog(true)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-400 focus:text-red-400"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa bài viết
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-700" />
                    </>
                  )}
                  <DropdownMenuItem className="cursor-pointer" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Sao chép liên kết
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <header className="mb-10">
            {blog.movie && (
              <Badge 
                onClick={() => router.push(`/movies/${blog.movie!.slug}`)}
                className="mb-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold cursor-pointer"
              >
                <Film className="h-3.5 w-3.5 mr-1.5" />
                Review: {blog.movie.title}
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-white">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-zinc-400 text-sm border-y border-zinc-800/50 py-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-zinc-700">
                  <AvatarImage src={blog.user?.avatar_url || undefined} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-300">
                    {blog.user?.display_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">{blog.user?.display_name || "Unknown"}</p>
                  <p className="text-xs">Tác giả</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(blog.created_at), "dd MMMM, yyyy", { locale: vi })}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>10 phút đọc</span>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{blog.view_count} lượt xem</span>
              </div>
              
              {blog.is_spoiler && (
                <Badge
                  variant="outline"
                  className="text-amber-400 border-amber-500/30 text-[10px] py-0"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Spoiler
                </Badge>
              )}
            </div>
          </header>

          {blog.excerpt && (
            <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <p className="text-zinc-300 italic text-sm leading-relaxed">
                {blog.excerpt}
              </p>
            </div>
          )}

          {blog.thumbnail && (
            <div className="mb-12 rounded-2xl overflow-hidden border border-zinc-800">
              <img
                src={blog.thumbnail}
                alt={blog.title}
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          )}

          {blog.is_spoiler && !showSpoiler && (
            <div className="mb-8 p-8 border-2 border-amber-500/30 rounded-2xl bg-amber-500/5 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-amber-400 mb-2">
                Cảnh báo Spoiler!
              </h3>
              <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                Bài viết này chứa nội dung tiết lộ cốt truyện. Bạn có muốn xem không?
              </p>
              <Button
                onClick={() => setShowSpoiler(true)}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8"
              >
                Tôi muốn đọc
              </Button>
            </div>
          )}

          {(!blog.is_spoiler || showSpoiler) && (
            <>
              <div className="prose prose-lg prose-invert max-w-none mb-12
                prose-headings:text-white prose-p:text-zinc-300 prose-a:text-yellow-400 
                prose-strong:text-white prose-code:text-yellow-300 prose-blockquote:border-yellow-500/50">
                <MarkdownRenderer content={blog.content} />
              </div>

              {blog.images && blog.images.length > 0 && (
                <div className="mb-12 space-y-6">
                  {blog.images.map((img, idx) => (
                    <div key={idx} className="overflow-hidden rounded-2xl border border-zinc-800">
                      <img
                        src={img}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full max-h-[700px] object-contain bg-zinc-900"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="sticky bottom-8 left-0 right-0 max-w-fit mx-auto bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl z-50">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "flex items-center gap-2 transition-colors group",
                isLiked ? "text-blue-400" : "hover:text-blue-400 text-zinc-400"
              )}
            >
              <ThumbsUp className={cn("w-5 h-5 group-active:scale-125 transition-transform", isLiked && "fill-current")} />
              <span className="font-medium">{likesCount}</span>
            </button>
            
            <div className="w-px h-5 bg-zinc-800" />
            
            <button 
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => toast.info("Chức năng bình luận đang được phát triển")}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{blog._count?.comments || 0}</span>
            </button>
            
            <div className="w-px h-5 bg-zinc-800" />
            
            <button 
              onClick={handleBookmark}
              disabled={isBookmarking}
              className={cn(
                "flex items-center gap-2 transition-colors group",
                isBookmarked ? "text-yellow-500" : "hover:text-yellow-500 text-zinc-400"
              )}
            >
              <Bookmark className={cn("w-5 h-5 group-active:scale-125 transition-transform", isBookmarked && "fill-current")} />
              <span className="font-medium">{isBookmarked ? "Đã lưu" : bookmarksCount}</span>
            </button>

            <div className="w-px h-5 bg-zinc-800" />

            <button 
              onClick={handleShare}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </article>
      </main>

      <Footer />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="dark bg-zinc-900 border-zinc-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Đang xóa..." : "Xóa bài viết"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <CreatePostModal
          setOpen={setShowEditDialog}
          onSuccess={() => {
            setShowEditDialog(false);
            fetchedRef.current = false;
            fetchBlog();
          }}
          initialData={{
            id: blog.id,
            title: blog.title,
            body: blog.content,
            excerpt: blog.excerpt,
            isSpoiler: blog.is_spoiler,
            movieId: blog.movie?.id,
            status: blog.status,
            thumbnail: blog.thumbnail || undefined,
            images: blog.images,
          }}
        />
      </Dialog>
    </div>
  );
}

function BlogDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans dark">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full pt-28 px-4">
        <Skeleton className="h-8 w-32 mb-8 bg-zinc-800" />
        <Skeleton className="h-16 w-full mb-6 bg-zinc-800" />
        <Skeleton className="h-16 w-3/4 mb-10 bg-zinc-800" />
        <div className="flex gap-4 mb-10">
          <Skeleton className="h-12 w-12 rounded-full bg-zinc-800" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-zinc-800" />
            <Skeleton className="h-3 w-20 bg-zinc-800" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl mb-12 bg-zinc-800" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full bg-zinc-800" />
          <Skeleton className="h-4 w-full bg-zinc-800" />
          <Skeleton className="h-4 w-5/6 bg-zinc-800" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
