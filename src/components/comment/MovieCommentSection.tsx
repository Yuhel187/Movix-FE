'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { MessageSquare, Star } from 'lucide-react';
import { CommentWithReplies } from '@/types/comment';
import * as commentService from '@/services/comment.service';
import * as interactionService from '@/services/interaction.service';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { MovieRating } from '@/components/movie/MovieRating';
import { cn } from '@/lib/utils'; 
import { RatingList } from '../movie/RatingList';

interface MovieCommentSectionProps {
  movieId: string;
}

export function MovieCommentSection({ movieId }: MovieCommentSectionProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'reviews'>('comments');
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [ratingRefreshKey, setRatingRefreshKey] = useState(0);

  const fetchComments = useCallback(async () => {
    try {
      const data = await commentService.getComments(movieId);
      setComments(data);
    } catch (error) {
      console.error('Không thể tải bình luận:', error);
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);
  const fetchRatings = useCallback(async () => {
    try {
      await interactionService.getMovieRatings(movieId);
    } catch (error) {
      console.error('Không thể tải đánh giá:', error);
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);
  const handleRatingChanged = async () => {
    await fetchRatings();
    setRatingRefreshKey(prev => prev + 1);
  };
  useEffect(() => {
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
    <div className="w-full max-w-4xl bg-card rounded-lg p-6 md:p-8 text-white min-h-[500px]">
      {/* Header và Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          {activeTab === 'comments' ? (
            <MessageSquare className="h-7 w-7 text-gray-300" />
          ) : (
            <Star className="h-7 w-7 text-yellow-500" />
          )}
          <h2 className="text-2xl font-bold">
            {activeTab === 'comments' ? 'Bình luận phim' : 'Đánh giá phim'}
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-lg">
          <Button
            variant={activeTab === "comments" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("comments")}
            className={cn(
              "rounded-md transition-all",
              activeTab === "comments" ? "bg-red-600 text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-zinc-700"
            )}
          >
            Bình luận
          </Button>
          <Button
            variant={activeTab === "reviews" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "rounded-md transition-all",
              activeTab === "reviews" ? "bg-yellow-500 text-black font-medium shadow-md" : "text-gray-400 hover:text-white hover:bg-zinc-700"
            )}
          >
            Đánh giá
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div className={cn(
          "transition-opacity duration-300",
          activeTab === 'comments' ? "block animate-in fade-in" : "hidden"
        )}>
          {user ? (
            <CommentForm onSubmit={handleCommentSubmit} />
          ) : (
            <div className="p-4 text-center bg-zinc-800 rounded-lg border border-zinc-700">
              <p className="text-gray-400">
                Bạn cần{' '}
                <Link href="/login" className="text-red-500 font-semibold hover:underline">
                  đăng nhập
                </Link>{' '}
                để tham gia bình luận.
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
        </div>
        <div className={cn(
            "transition-opacity duration-300",
            activeTab === 'reviews' ? "block animate-in fade-in" : "hidden"
        )}>
            <MovieRating 
               movieId={movieId} 
               onRatingSubmit={handleRatingChanged}
            />
            <div className="mt-8 border-t border-zinc-800 pt-6">
                <RatingList 
                    movieId={movieId} 
                    refreshTrigger={ratingRefreshKey} 
                />
            </div>
        </div>
      </div>
    </div>
  );
}

const CommentSkeleton = () => (
  <div className="space-y-6 mt-8">
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4 bg-zinc-800" />
          <Skeleton className="h-12 w-full bg-zinc-800" />
          <Skeleton className="h-4 w-1/3 bg-zinc-800" />
        </div>
      </div>
    ))}
  </div>
);