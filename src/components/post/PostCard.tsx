"use client"
import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
} from "@/components/ui/dialog"
import {
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  Globe,
  Eye,
  AlertTriangle,
  Pencil,
  Trash2,
  Film,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { blogService } from "@/services/blog.service"
import { toast } from "sonner"
import CreatePostModal from "./CreatePostModal"
import { ReportModal } from "@/components/common/ReportModal"
import { ReportTargetType } from "@/types/report"
import { FollowButton } from "@/components/common/FollowButton"


export interface Post {
  id?: string;
  slug?: string;
  title?: string;
  author: {
    id?: string;
    username: string;
    avatarUrl?: string;
  };
  timeAgo: string;
  content: string;
  imageUrl?: string;
  isSpoiler?: boolean;
  viewCount?: number;
  movie?: {
    id: string;
    title: string;
    poster_url: string | null;
    slug: string;
  } | null;
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  likedByCurrentUser?: boolean;
  bookmarkedByCurrentUser?: boolean;

}

interface PostCardProps {
  post: Post;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export function PostCard({ post, onDeleted, onUpdated }: PostCardProps) {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()
  const [isLiked, setIsLiked] = useState(post.likedByCurrentUser ?? false)
  const [likesCount, setLikesCount] = useState(post.stats.likes)
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarkedByCurrentUser ?? false)
  const [bookmarksCount, setBookmarksCount] = useState(post.stats.shares)
  const [isLiking, setIsLiking] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showSpoiler, setShowSpoiler] = useState(false)

  const isOwner = user?.id === post.author.id

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để thích bài viết")
      return
    }
    if (!post.id || isLiking) return
    setIsLiking(true)
    // Optimistic update
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    try {
      await blogService.toggleLike(post.id)
    } catch {
      // Rollback on error
      setIsLiked(isLiked)
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1)
      toast.error("Không thể thực hiện thao tác")
    } finally {
      setIsLiking(false)
    }
  }, [isLoggedIn, post.id, isLiking, isLiked])

  const handleBookmark = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để lưu bài viết")
      return
    }
    if (!post.id || isBookmarking) return
    setIsBookmarking(true)
    setIsBookmarked(!isBookmarked)
    setBookmarksCount(prev => isBookmarked ? prev - 1 : prev + 1)
    try {
      await blogService.toggleBookmark(post.id)
    } catch {
      setIsBookmarked(isBookmarked)
      setBookmarksCount(prev => isBookmarked ? prev + 1 : prev - 1)
      toast.error("Không thể thực hiện thao tác")
    } finally {
      setIsBookmarking(false)
    }
  }, [isLoggedIn, post.id, isBookmarking, isBookmarked])

  const handleDelete = async () => {
    if (!post.id) return
    setIsDeleting(true)
    try {
      await blogService.deleteBlogPost(post.id)
      toast.success("Đã xóa bài viết")
      setShowDeleteDialog(false)
      onDeleted?.()
    } catch {
      toast.error("Không thể xóa bài viết")
    } finally {
      setIsDeleting(false)
    }
  }

  const navigateToDetail = () => {
    if (post.slug) {
      router.push(`/blog/${post.slug}`)
    } else if (post.id) {
      router.push(`/blog/${post.id}`)
    }
  }

  const navigateToMovie = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (post.movie?.slug) {
      router.push(`/movies/${post.movie.slug}`)
    }
  }

  const detailHref = `/blog/${post.slug || post.id}`;

  return (
    <>
      <Card 
        className="w-full max-w-2xl mx-auto hover:border-zinc-600 transition-all duration-300 cursor-pointer group bg-zinc-900/40 backdrop-blur-sm border-zinc-800"
        onClick={navigateToDetail}
      >
        <CardHeader className="p-4 pb-2 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-transparent hover:ring-yellow-500/50 transition-all">
              <AvatarImage src={post.author.avatarUrl} />
              <AvatarFallback className="bg-zinc-800 text-zinc-300">{post.author.username.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm leading-normal truncate cursor-pointer hover:underline">
                  {post.author.username}
                </p>
                {post.author.id && (
                  <>
                    <span className="text-zinc-500 text-xs mt-0.5">•</span>
                    <FollowButton targetUserId={post.author.id} variant="ghost" className="h-auto p-0 text-sm hover:bg-transparent" />
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span>{post.timeAgo}</span>
                <span>•</span>
                <Globe className="h-3 w-3" />
                {post.viewCount !== undefined && (
                  <>
                    <span>•</span>
                    <Eye className="h-3 w-3" />
                    <span>{post.viewCount}</span>
                  </>
                )}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1">
              {post.isSpoiler && (
                <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  Spoiler
                </span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark bg-zinc-900 border-zinc-700 text-white">
                  {isOwner && (
                    <>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setShowEditDialog(true) }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-400 focus:text-red-400"
                        onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true) }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa bài viết
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-700" />
                    </>
                  )}
                  {user && !isOwner && post.id && (
                    <>
                      <ReportModal
                        targetType={ReportTargetType.BLOG}
                        targetId={post.id}
                        triggerElement={
                          <DropdownMenuItem
                            className="cursor-pointer text-red-500 focus:text-red-400 focus:bg-red-500/10"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Báo cáo bài viết
                          </DropdownMenuItem>
                        }
                      />
                      <DropdownMenuSeparator className="bg-zinc-700" />
                    </>
                  )}
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug || post.id}`)
                      toast.success("Đã sao chép liên kết")
                    }}
                  >
                    Sao chép liên kết
                  </DropdownMenuItem>
                  
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          {/* Movie tag */}
          {post.movie && (
            <button
              onClick={navigateToMovie}
              className="inline-flex items-center gap-1.5 mb-2 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2.5 py-1 hover:bg-blue-500/20 transition-colors"
            >
              <Film className="h-3 w-3" />
              {post.movie.title}
            </button>
          )}

          {post.title && (
            <h3 className="mb-2 text-lg font-bold text-foreground group-hover:text-yellow-400 transition-colors">
              {post.title}
            </h3>
          )}

          {/* Spoiler content blur */}
          <div
            className={cn(
              "mb-4 text-sm text-foreground/90 whitespace-pre-wrap line-clamp-4 leading-relaxed",
              post.isSpoiler && !showSpoiler && "blur-sm select-none"
            )}
          >
            {post.content}
          </div>

          {post.isSpoiler && !showSpoiler && (
            <Button
              variant="outline"
              size="sm"
              className="mb-3 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              onClick={(e) => { e.stopPropagation(); setShowSpoiler(true) }}
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Hiện nội dung spoiler
            </Button>
          )}

          {post.imageUrl && (
            <div className="mt-2 overflow-hidden rounded-lg">
              <img
                src={post.imageUrl}
                alt="Post image"
                className="max-h-96 w-full rounded-lg border border-zinc-800 object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col items-start gap-3 px-4 pb-3">
          <div className="flex w-full justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {likesCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="bg-blue-600 rounded-full p-0.5">
                    <ThumbsUp className="h-2.5 w-2.5 text-white" />
                  </span>
                  <span>{likesCount}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {post.stats.comments > 0 && (
                <span>{post.stats.comments} bình luận</span>
              )}
              {bookmarksCount > 0 && (
                <span>{bookmarksCount} đã lưu</span>
              )}
            </div>
          </div>

          <div className="w-full border-t border-zinc-800 pt-2 flex">
            <Button
              variant="ghost"
              className={cn(
                "flex-1 flex items-center justify-center transition-all text-sm h-9",
                isLiked ? "text-blue-500 font-semibold" : "text-muted-foreground hover:text-blue-400"
              )}
              onClick={handleLike}
              disabled={isLiking}
            >
              <ThumbsUp className={cn("h-4 w-4 mr-2", isLiked && "fill-current")} />
              Thích
            </Button>

            <Button
              variant="ghost"
              className="flex-1 flex items-center justify-center text-muted-foreground hover:text-white text-sm h-9"
              onClick={(e) => { e.stopPropagation(); navigateToDetail() }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Bình luận
            </Button>

            <Button
              variant="ghost"
              className={cn(
                "flex-1 flex items-center justify-center transition-all text-sm h-9",
                isBookmarked ? "text-yellow-500 font-semibold" : "text-muted-foreground hover:text-yellow-400"
              )}
              onClick={handleBookmark}
              disabled={isBookmarking}
            >
              <Bookmark className={cn("h-4 w-4 mr-2", isBookmarked && "fill-current")} />
              Lưu
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="dark bg-zinc-900 border-zinc-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?
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


      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <CreatePostModal
          setOpen={setShowEditDialog}
          onSuccess={() => {
            setShowEditDialog(false)
            onUpdated?.()
          }}
          initialData={{
            id: post.id,
            title: post.title || "",
            body: post.content,
            status: "PUBLISHED",
            isSpoiler: post.isSpoiler,
            movieId: post.movie?.id,
          }}
        />
      </Dialog>
    </>
  )
}