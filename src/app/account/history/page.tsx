'use client';

import { useEffect, useState } from "react";
import { MovieCard } from "@/components/movie/MovieCard";
import { getWatchHistory, HistoryItem } from "@/services/history.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, PlayCircle } from "lucide-react";
import Link from "next/link";
import type { Movie } from "@/types/movie"; 

export default function HistoryPage() {
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await getWatchHistory();
                setHistoryItems(response.data);
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const calculateProgress = (current: number, total: number | null) => {
        if (!total || total === 0) return 0;
        const percentage = (current / (total * 60)) * 100; 
        return Math.min(percentage, 100); 
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        return `${m} phút`;
    };

    return (
       <div className="max-w-7xl">
            <div className="flex items-center gap-3 mb-2">
                <Clock className="w-8 h-8 text-red-600" />
                <h1 className="text-3xl font-bold text-white">Lịch sử xem</h1>
            </div>
            <p className="text-gray-400 mb-8">
                Tiếp tục theo dõi các bộ phim bạn đang xem dở.
            </p>

            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : historyItems.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-xl text-gray-300 font-medium">Bạn chưa xem phim nào</p>
                    <p className="text-gray-500 mt-2">Hãy bắt đầu thưởng thức các bộ phim bom tấn ngay!</p>
                    <Link 
                        href="/" 
                        className="inline-block mt-6 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                    >
                        Khám phá ngay
                    </Link>
                </div>
            ) : (
                <div className="dark grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {historyItems.map((item) => {
                        const movieData = item.episode.season.movie;
                        const episode = item.episode;
                        const progressPercent = calculateProgress(item.progress_seconds, episode.runtime);
                        const watchLink = `/movies/${movieData.slug}/watch?episodeId=${episode.id}&t=${item.progress_seconds}`;
                        const mappedMovie: Movie = {
                            id: movieData.id,
                            slug: movieData.slug,
                            title: movieData.title,
                            subTitle: movieData.original_title,
                            description: "", 
                            posterUrl: movieData.poster_url || "/images/placeholder-poster.png",
                            backdropUrl: movieData.poster_url || "/images/placeholder-backdrop.png",
                            trailerUrl: null,
                            videoUrl: null,
                            type: "MOVIE", 
                            releaseYear: "N/A", 
                            tags: [],
                            duration: episode.runtime ? `${episode.runtime} phút` : undefined
                        };

                        return (
                            <div key={item.id} className="relative group">
                                <MovieCard
                                    movie={mappedMovie}
                                    subTitle={`Tập ${episode.episode_number} - Đã xem ${formatTime(item.progress_seconds)}`}
                                    watchUrl={watchLink}
                                />
                                
                                {/* Thanh tiến trình (Progress Bar) */}
                                <div className="absolute bottom-[70px] left-0 right-0 h-1 bg-gray-700 mx-2 rounded-full overflow-hidden z-10">
                                    <div 
                                        className="h-full bg-red-600" 
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <Link
                                    href={watchLink}
                                    className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg"
                                >
                                    <div className="bg-red-600 p-3 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-200 shadow-lg">
                                        <PlayCircle className="w-8 h-8 text-white fill-current" />
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}