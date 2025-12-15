'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getMovieRatings, RatingItem } from '@/services/interaction.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface RatingListProps {
  movieId: string;
  refreshTrigger?: number;
}

export function RatingList({ movieId, refreshTrigger }: RatingListProps) {
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setIsLoading(true);
        const data = await getMovieRatings(movieId);
        setRatings(data);
      } catch (error) {
        console.error("Lỗi tải danh sách đánh giá:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [movieId, refreshTrigger]);

  if (isLoading) {
    return <RatingListSkeleton />;
  }

  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 italic">
        Chưa có ai đánh giá phim này. Hãy là người đầu tiên!
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-white mb-4">
        Người dùng đánh giá ({ratings.length})
      </h4>
      <ScrollArea className="h-[400px] w-full pr-4">
        <div className="space-y-4">
          {ratings.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-zinc-700">
                  <AvatarImage src={item.user.avatar_url || ''} alt={item.user.username} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-400">
                    {(item.user.display_name || item.user.username || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-zinc-200">
                    {item.user.display_name || item.user.username}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {item.created_at 
                      ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: vi }) 
                      : 'Vừa xong'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                <span className="font-bold text-yellow-500">{item.rating}</span>
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function RatingListSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      <Skeleton className="h-6 w-40 bg-zinc-800" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-zinc-800" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-zinc-800" />
              <Skeleton className="h-3 w-20 bg-zinc-800" />
            </div>
          </div>
          <Skeleton className="h-8 w-12 rounded-md bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}