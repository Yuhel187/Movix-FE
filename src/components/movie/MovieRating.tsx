'use client';

import { useState, useEffect } from 'react';
import { Star, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
    getRatingStats,
    getMyRating,
    rateMovie,
    deleteRating,
    RatingStats
} from '@/services/interaction.service';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MovieRatingProps {
    movieId: string;
    onRatingSubmit?: () => void;
}

export const MovieRating = ({ movieId, onRatingSubmit }: MovieRatingProps) => {
    const { isLoggedIn } = useAuth();

    const [stats, setStats] = useState<RatingStats>({ average: 0, count: 0 });
    const [myRating, setMyRating] = useState<number | null>(null); 
    const [selectedRating, setSelectedRating] = useState<number>(0); 
    const [hoverRating, setHoverRating] = useState<number>(0);

    const [loadingStats, setLoadingStats] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingStats(true);
            try {
                const statsData = await getRatingStats(movieId);
                setStats(statsData);

                if (isLoggedIn) {
                    const myRateData = await getMyRating(movieId);
                    if (myRateData.hasRated && myRateData.rating) {
                        setMyRating(myRateData.rating);
                        setSelectedRating(myRateData.rating); 
                    }
                }
                if (onRatingSubmit) onRatingSubmit();
            } catch (error) {
                console.error("Lỗi tải đánh giá:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        if (movieId) fetchData();
    }, [movieId, isLoggedIn]);
    const handleSubmitRating = async () => {
        if (!isLoggedIn) {
            toast.error("Bạn cần đăng nhập để đánh giá phim.");
            return;
        }

        if (selectedRating === 0) {
            toast.error("Vui lòng chọn số sao trước khi gửi.");
            return;
        }

        setIsSubmitting(true);
        try {
            await rateMovie(movieId, selectedRating);
            setMyRating(selectedRating);
            toast.success(`Đã lưu đánh giá ${selectedRating}/10 điểm!`);
            const newStats = await getRatingStats(movieId);
            setStats(newStats);
            if (onRatingSubmit) onRatingSubmit();
        } catch (error) {
            toast.error("Lỗi khi lưu đánh giá. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleDeleteRating = async () => {
        if (!confirm("Bạn muốn xóa đánh giá của mình?")) return;
        setIsSubmitting(true);
        try {
            await deleteRating(movieId);
            setMyRating(null);
            setSelectedRating(0); 
            setHoverRating(0);
            toast.success("Đã xóa đánh giá.");

            const newStats = await getRatingStats(movieId);
            setStats(newStats);
            if (onRatingSubmit) onRatingSubmit();
        } catch (error) {
            toast.error("Xóa đánh giá thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStarColor = (index: number) => {
        const activeVal = hoverRating || selectedRating || (myRating || 0);
        return index <= activeVal ? "fill-yellow-500 text-yellow-500" : "text-zinc-600";
    };
    const hasChanges = selectedRating > 0 && selectedRating !== myRating;

    if (loadingStats) {
        return <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-40 bg-zinc-800" />
            <Skeleton className="h-16 w-full bg-zinc-800" />
        </div>;
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 space-y-6">
            {/* Header*/}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">Đánh giá từ cộng đồng</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-4xl font-bold text-yellow-500">{stats.average}</span>
                        <span className="text-zinc-400">/ 10</span>
                        <span className="text-sm text-zinc-500 ml-2">({stats.count} lượt)</span>
                    </div>
                </div>

                {isLoggedIn && myRating && (
                    <div className="flex items-center gap-3 bg-zinc-800/80 px-4 py-2 rounded-full border border-zinc-700">
                        <div className="text-right">
                            <span className="block text-xs text-zinc-400">Đánh giá của bạn</span>
                            <span className="text-xl font-bold text-white">{myRating}<span className="text-xs font-normal text-zinc-500">/10</span></span>
                        </div>
                        <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                            onClick={handleDeleteRating} disabled={isSubmitting}
                            title="Xóa đánh giá"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="h-px bg-zinc-800 w-full" />

            <div className="space-y-4 flex flex-col items-center">
                <p className="text-center text-sm font-medium text-zinc-300">
                    {myRating ? "Cập nhật đánh giá của bạn" : "Chạm vào sao để chấm điểm"}
                </p>

                <div className="flex items-center justify-center gap-1 sm:gap-2">
                    {[...Array(10)].map((_, i) => {
                        const starValue = i + 1;
                        return (
                            <button
                                key={starValue}
                                disabled={isSubmitting}
                                onMouseEnter={() => setHoverRating(starValue)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setSelectedRating(starValue)} 
                                className="transition-transform hover:scale-110 focus:outline-none p-1"
                            >
                                <Star className={cn("w-6 h-6 sm:w-8 sm:h-8 transition-colors", getStarColor(starValue))} />
                            </button>
                        );
                    })}
                </div>

                <p className="text-center text-sm text-yellow-500 font-medium h-5">
                    {(hoverRating || selectedRating) > 0 ? `${hoverRating || selectedRating} điểm` : ""}
                </p>

                {hasChanges && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 mt-2">
                        <Button
                            onClick={handleSubmitRating}
                            disabled={isSubmitting}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold gap-2"
                        >
                            {isSubmitting ? "Đang lưu..." : "Gửi đánh giá"}
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {!isLoggedIn && (
                <div className="text-center p-3 bg-zinc-800/50 rounded-lg text-sm text-zinc-400">
                    Vui lòng <span className="text-white font-semibold">đăng nhập</span> để đánh giá.
                </div>
            )}
        </div>
    );
};