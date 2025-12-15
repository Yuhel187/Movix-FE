'use client';
import { useState, useEffect } from "react";
import { MovieCard } from "@/components/movie/MovieCard";
import type { Movie } from "@/types/movie"; //
import { getFavoriteMovies } from "@/services/interaction.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getFavoriteMovies()
            .then((data) => {
                setFavorites(data);
            })
            .catch((err) => {
                console.error("Lỗi khi tải danh sách yêu thích:", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const LoadingSkeleton = () => (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
        </div>
    );

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center text-center text-gray-400 h-60">
            <Heart className="w-16 h-16" />
            <h3 className="mt-4 text-lg font-semibold text-white">
                Chưa có phim yêu thích
            </h3>
            <p className="mt-1 text-sm">
                Hãy nhấn trái tim ở trang phim để thêm vào đây.
            </p>
        </div>
    );

    return (
        <div className="max-w-7xl">
            <div className="flex items-center gap-3 mb-2">
                <Heart className="w-8 h-8 text-red-600" />
                <h1 className="text-3xl font-bold text-white">Yêu thích</h1>
            </div>
            <p className="mt-1 mx-1 text-gray-400 my-7">
                Danh sách phim bạn đã thêm vào yêu thích.
            </p>
            {isLoading ? (
                <LoadingSkeleton />
            ) : favorites.length === 0 ? (
                <div className="mt-8">
                    <EmptyState />
                </div>
            ) : (
                <div className="dark grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {favorites.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}
        </div>
    );
}