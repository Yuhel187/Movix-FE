'use client';
import { useState } from "react";
import { MovieCard } from "@/components/movie/MovieCard";
import type { Movie } from "@/types/movie";

export default function FavoritesPage() {
    const [favorites] = useState<Movie[]>([
        {
            id: 1,
            title: "Inception",
            subTitle: "Giấc mơ trong mơ",
            posterUrl: "https://image.tmdb.org/t/p/original/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
            year: 2010,
            duration: "2h 28m",
            views: 2500000,
            type: "Movie",
            tags: ["Sci-Fi", "Thriller"],
            description: "Một tay trộm chuyên xâm nhập giấc mơ để đánh cắp bí mật.",
        },
        {
            id: 2,
            title: "Interstellar",
            subTitle: "Du hành giữa các vì sao",
            posterUrl: "https://image.tmdb.org/t/p/original/if4TI9LbqNIrzkoOgWjX5PZYDYe.jpg",
            year: 2014,
            duration: "2h 49m",
            views: 4000000,
            type: "Movie",
            tags: ["Adventure", "Drama", "Sci-Fi"],
            description: "Một nhóm phi hành gia tìm kiếm hành tinh mới cho nhân loại.",
        },
    ]);

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-white">Yêu thích</h1>
            <p className="mt-1 text-gray-400">
                Danh sách phim bạn đã thêm vào yêu thích.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-12"></div>
            {favorites.length === 0 ? (
                <p className="text-gray-400">Bạn chưa thêm phim nào vào danh sách yêu thích.</p>
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
