"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { blogService } from "@/services/blog.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ThumbsUp, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Calendar, 
  Clock, 
  ChevronLeft,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MarkdownRenderer } from "@/components/post/MarkdownRenderer";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const data = await blogService.getBlogBySlug(slug as string);
        setPost(data.data);
      } catch (error) {
        console.error("Failed to fetch blog post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (isLoading) {
    return <BlogDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h1>
          <Link href="/blog">
            <Button variant="outline">Quay lại Blog</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans dark">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Navigation & Actions */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/blog">
              <Button variant="ghost" className="text-zinc-400 hover:text-white -ml-4">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Quay lại
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-zinc-400">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-zinc-400">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Header */}
          <header className="mb-10">
            {post.movie && (
              <Badge className="mb-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                {post.movie.title}
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-white">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-zinc-400 text-sm border-y border-zinc-800/50 py-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-zinc-700">
                  <AvatarImage src={post.user?.avatar_url} />
                  <AvatarFallback>{post.user?.display_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">{post.user?.display_name}</p>
                  <p className="text-xs">Tác giả</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(post.created_at), "dd MMMM, yyyy", { locale: vi })}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>10 phút đọc</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.thumbnail && (
            <div className="mb-12 rounded-2xl overflow-hidden border border-zinc-800">
              <img 
                src={post.thumbnail} 
                alt={post.title} 
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          )}

          {/* Content */}
          <article className="prose prose-invert prose-yellow max-w-none mb-16">
            <MarkdownRenderer content={post.content} />
          </article>

          {/* Interaction Bar */}
          <div className="sticky bottom-8 left-0 right-0 max-w-fit mx-auto bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl z-50">
            <button className="flex items-center gap-2 hover:text-yellow-500 transition-colors group">
              <ThumbsUp className="w-5 h-5 group-active:scale-125 transition-transform" />
              <span className="font-medium">{post._count?.likes || 0}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post._count?.comments || 0}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
              <Bookmark className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">Đã lưu</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function BlogDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
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
