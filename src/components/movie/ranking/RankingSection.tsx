'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Heart, Eye } from 'lucide-react';
import { RankingList } from './RankingList';
import { getTopCommentedMovies, getTopLikedMovies, getTopViewedMovies } from '@/services/movie.service';
import { Movie } from '@/types/movie';

export function RankingSection() {
    const [commentedMovies, setCommentedMovies] = useState<Movie[]>([]);
    const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
    const [viewedMovies, setViewedMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [commented, liked, viewed] = await Promise.all([
                    getTopCommentedMovies(),
                    getTopLikedMovies(),
                    getTopViewedMovies(),
                ]);

                setCommentedMovies(commented);
                setLikedMovies(liked);
                setViewedMovies(viewed);
            } catch (error) {
                console.error("Failed to fetch ranking data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="w-full h-96 animate-pulse bg-white/5 rounded-xl mt-10" />;
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-10">
            <RankingList
                title="Sôi nổi nhất"
                icon={MessageCircle}
                movies={commentedMovies}
                color="text-yellow-500"
            />
            <RankingList
                title="Yêu thích nhất"
                icon={Heart}
                movies={likedMovies}
                color="text-pink-500" // Custom color for Love
            />
            <RankingList
                title="Nhiều lượt xem nhất"
                icon={Eye}
                movies={viewedMovies}
                color="text-blue-500" // Custom color for Views
            />
        </section>
    );
}
