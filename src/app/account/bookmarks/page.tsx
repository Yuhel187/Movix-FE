"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PostCard, Post } from "@/components/post/PostCard";
import { blogService } from "@/services/blog.service";
import { Pagination } from "@/components/common/pagination";
import { Input } from "@/components/ui/input";
import { PostCardSkeleton } from "@/components/post/PostCardSkeleton";
import { Bookmark, Search, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useDebounce } from "@/hooks/useDebounce";

export default function BookmarksPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const mapApiDataToPost = (item: any): Post => {
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      author: {
        username: item.user?.display_name || "Người dùng Movix",
        avatarUrl: item.user?.avatar_url || "/images/logo.png",
      },
      timeAgo: item.created_at
        ? formatDistanceToNow(new Date(item.created_at), {
            addSuffix: true,
            locale: vi,
          })
        : "Vừa xong",
      content: item.excerpt || item.content || "",
      imageUrl:
        item.thumbnail ||
        (item.images && item.images.length > 0 ? item.images[0] : undefined),
      stats: {
        likes: item._count?.likes || 0,
        comments: item._count?.comments || 0,
        shares: item._count?.bookmarks || 0,
      },
    };
  };

  const fetchBookmarks = useCallback(async (pageNum: number, searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await blogService.getSavedBlogs({
        page: pageNum,
        limit: 5,
        search: searchTerm,
      });

      const mappedPosts = (response.blogs || []).map(mapApiDataToPost);
      setPosts(mappedPosts);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchBookmarks(page, debouncedSearch);
  }, [page, debouncedSearch, fetchBookmarks]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Bài viết đã lưu</h1>
          </div>
          <p className="text-gray-400">
            Quản lý các bài viết bạn đã lưu để xem lại sau.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            className="pl-10 bg-zinc-900 border-zinc-800 text-white focus:ring-yellow-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6 min-h-[400px]">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <div
                key={post.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <PostCard post={post} />
              </div>
            ))}
            
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
            <Bookmark className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-white mb-1">
              {search ? "Không tìm thấy kết quả" : "Chưa có bài viết nào"}
            </h3>
            <p className="text-sm max-w-xs mx-auto">
              {search
                ? `Không tìm thấy bài viết nào phù hợp với từ khóa "${search}"`
                : "Hãy lưu các bài viết thú vị để xem lại chúng ở đây nhé!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
