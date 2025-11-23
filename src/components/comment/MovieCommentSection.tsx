'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { MessageSquare, Star } from 'lucide-react';
import { CommentWithReplies } from '@/types/comment';
import * as commentService from '@/services/comment.service';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface MovieCommentSectionProps {
  movieId: string;
}

export function MovieCommentSection({ movieId }: MovieCommentSectionProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'reviews'>('comments');

  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      //setIsLoading(true);
      const data = await commentService.getComments(movieId);
      setComments(data);
    } catch (error) {
      console.error('Không thể tải bình luận:', error);
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);
  useEffect(() => {
    setIsLoading
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmit = async (
    commentText: string,
    isSpoiler: boolean,
  ) => {
    const result = await commentService.postComment({
      movieId: movieId,
      comment: commentText,
      isSpoiler: isSpoiler,
    });
    await fetchComments();
    return result;
  };

  return (
    <div className="w-full max-w-4xl  bg-card rounded-lg p-6 md:p-8 text-white">
      {/* Header và Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-7 w-7 text-gray-300" />
          <h2 className="text-2xl font-bold">Bình luận</h2>
        </div>
        <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-lg">
          <Button
            variant={activeTab === "comments" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("comments")}
            className={`rounded-md ${activeTab === "comments"
                ? "bg-red-600 text-white"
                : "text-gray-400"
              }`}
          >
            Bình luận
          </Button>
          <Button
            variant={activeTab === "reviews" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("reviews")}
            className={`rounded-md ${activeTab === "reviews"
                ? "bg-red-600 text-white"
                : "text-gray-400"
              }`}
          >
            Đánh giá
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === 'comments' ? (
          <>
            {user ? (
              <CommentForm onSubmit={handleCommentSubmit} />
            ) : (
              <div className="p-4 text-center bg-zinc-800 rounded-lg">
                <p className="text-gray-400">
                  Bạn cần{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    đăng nhập
                  </Link>{' '}
                  để có thể bình luận.
                </p>
              </div>
            )}

            {isLoading ? (
              <CommentSkeleton />
            ) : (
              <CommentList
                comments={comments}
                movieId={movieId}
                onCommentUpdated={fetchComments}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-500">
            <Star className="h-16 w-16" />
            <p className="text-lg font-medium">Chưa có đánh giá</p>
          </div>
        )}
      </div>
    </div>
  );
}
const CommentSkeleton = () => (
  <div className="space-y-6 mt-8">
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    ))}
  </div>
);