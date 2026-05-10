"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostCard, Post } from "@/components/post/PostCard";
import { PostCardSkeletonList } from "@/components/post/PostCardSkeleton";
import { CreatePostTrigger } from "@/components/post/CreatePostTrigger";
import { Sparkles, MessageSquare, TrendingUp, Loader2, Search, X } from "lucide-react";
import { blogService, GetAllBlogsParams } from "@/services/blog.service";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function BlogPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<"newest" | "reviews" | "top">("newest");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const mapApiDataToPost = useCallback((item: any): Post => {
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      author: {
        id: item.user?.id,
        username: item.user?.display_name || "Unknown User",
        avatarUrl: item.user?.avatar_url || "/images/logo.png",
      },
      timeAgo: item.created_at
        ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: vi })
        : "Vừa xong",
      content: item.excerpt || item.content || "",
      imageUrl: item.thumbnail || (item.images && item.images.length > 0 ? item.images[0] : undefined),
      isSpoiler: item.is_spoiler || false,
      viewCount: item.view_count || 0,
      movie: item.movie || null,
      stats: {
        likes: item._count?.likes || 0,
        comments: item._count?.comments || 0,
        shares: item._count?.bookmarks || 0,
      },
      likedByCurrentUser: user
        ? item.likes?.some((l: any) => l.user_id === user.id) ?? false
        : false,
      bookmarkedByCurrentUser: user
        ? item.bookmarks?.some((b: any) => b.user_id === user.id) ?? false
        : false,
    };
  }, [user]);

  const fetchBlogs = useCallback(async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) setIsLoadingMore(true);
      else setIsLoading(true);

      const params: GetAllBlogsParams = {
        page: pageNum,
        limit: 10,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const response = await blogService.getAllBlogs(params);
      const newPosts = (response.data || []).map(mapApiDataToPost);

      if (isLoadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(response.pagination?.page < response.pagination?.pages);
      setPage(response.pagination?.page || 1);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [debouncedSearch, mapApiDataToPost]);

  useEffect(() => {
    setPage(1);
    fetchBlogs(1, false);
  }, [activeFilter, debouncedSearch, fetchBlogs]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchBlogs(page + 1, true);
    }
  };

  const getFilteredAndSortedPosts = () => {
    const sortedPosts = [...posts];

    if (activeFilter === "top") {
      sortedPosts.sort((a, b) => b.stats.likes - a.stats.likes);
    } else if (activeFilter === "reviews") {
      return sortedPosts.filter(p => p.movie != null);
    }

    return sortedPosts;
  };

  const displayedPosts = getFilteredAndSortedPosts();

  const handlePostCreated = () => {
    fetchBlogs(1, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePostDeleted = () => {
    fetchBlogs(1, false);
  };

  const handlePostUpdated = () => {
    fetchBlogs(1, false);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col font-sans dark text-white">
      <Navbar />

      <main className="flex-grow pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 text-center sm:text-left space-y-2 border-b border-zinc-800 pb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Cộng Đồng Movix
            </h1>
            <p className="text-zinc-400 text-sm">
              Nơi chia sẻ, thảo luận và kết nối đam mê điện ảnh.
            </p>

            {/* Search */}
            <div className="pt-2 relative">
              <Search className="absolute left-3 top-1/2 translate-y-[1px] h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:ring-yellow-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-3 w-full">
              <div className="w-full">
                <CreatePostTrigger onPostCreated={handlePostCreated} />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={activeFilter === "newest" ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveFilter("newest")}
              className={`rounded-full transition-all ${activeFilter === "newest" ? "bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Mới nhất
            </Button>
            <Button
              variant={activeFilter === "reviews" ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveFilter("reviews")}
              className={`rounded-full transition-all ${activeFilter === "reviews" ? "bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Review phim
            </Button>
            <Button
              variant={activeFilter === "top" ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveFilter("top")}
              className={`rounded-full transition-all ${activeFilter === "top" ? "bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Nổi bật
            </Button>
          </div>

          {/* Blog List */}
          <div className="space-y-6">
            {isLoading && page === 1 ? (
              <PostCardSkeletonList count={3} />
            ) : displayedPosts.length > 0 ? (
              displayedPosts.map((post) => (
                <div key={post.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <PostCard
                    post={post}
                    onDeleted={handlePostDeleted}
                    onUpdated={handlePostUpdated}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-zinc-400 text-lg">
                  {debouncedSearch
                    ? `Không tìm thấy bài viết cho "${debouncedSearch}"`
                    : "Chưa có bài viết nào trong mục này."}
                </p>
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && displayedPosts.length > 0 && (
            <div className="mt-10 text-center flex justify-center">
              <Button
                variant="ghost"
                className="text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoadingMore ? "Đang tải thêm..." : "Tải thêm bài viết"}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
