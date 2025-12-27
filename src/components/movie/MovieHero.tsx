'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Heart, Share2, Loader2 } from "lucide-react";
import type { Movie } from "@/types/movie";
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { checkFavoriteStatus, toggleFavorite } from '../../services/interaction.service';
import { toast } from 'sonner';
import { AddToPlaylistDialog } from './AddToPlaylistDialog';
import { ShareDialog } from './ShareDialog';

interface MovieHeroProps {
    movie: Movie;
}

export default function MovieHero({ movie }: MovieHeroProps) {
    const { isLoggedIn } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoadingFav, setIsLoadingFav] = useState(true);
    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            setIsLoadingFav(true);
            checkFavoriteStatus(movie.id.toString())
                .then((data) => {
                    setIsFavorite(data.isFavorite);
                })
                .catch(() => {  })
                .finally(() => {
                    setIsLoadingFav(false);
                });
        } else {
            setIsLoadingFav(false);
        }
    }, [isLoggedIn, movie.id]);

    const handleToggleFavorite = async () => {
        if (!isLoggedIn) {
            toast.error('Bạn cần đăng nhập để thực hiện việc này.');
            return;
        }

        const oldState = isFavorite;
        setIsFavorite(!oldState);

        try {
            const { message } = await toggleFavorite(movie.id.toString());
            toast.success(message);
        } catch (error) {
            toast.error('Có lỗi xảy ra, vui lòng thử lại.');
            setIsFavorite(oldState);
        }
    };

    const handlePlaylistClick = () => {
        if (!isLoggedIn) {
            toast.error('Bạn cần đăng nhập để thực hiện việc này.');
            return;
        }
        setIsPlaylistOpen(true);
    }
    const handleShare = () => {
        setIsShareOpen(true);
    };

    return (
        <section className="relative h-screen w-full">
            {/* Backdrop*/}
            <Image
                src={movie.backdropUrl!}
                alt={movie.title}
                fill
                className="object-cover object-center opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            {/* Detail */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {/* Cột trái: Poster phim */}
                    <div className="relative aspect-[2/3] w-full max-w-sm mx-auto md:mx-0 rounded-lg overflow-hidden shadow-2xl">
                        <Image
                            src={movie.posterUrl!}
                            alt={`Poster of ${movie.title}`}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Cột phải: Thông tin & Actions */}
                    <div className="md:col-span-2 flex flex-col justify-center text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            {movie.title}
                        </h1>
                        <p className="mt-4 max-w-xl text-base md:text-lg text-gray-300">
                            {movie.description}
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center md:justify-start items-center gap-4">
                            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white rounded-md" asChild>
                                <Link href={`/movies/${movie.slug}/watch`}>
                                    <Play className="mr-2 h-5 w-5" />
                                    Xem ngay
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className="bg-white/20 border-white/30 hover:bg-white/30"
                                onClick={handleToggleFavorite}
                                disabled={isLoadingFav}
                            >
                                {isLoadingFav ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Heart
                                        className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                                    />
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="bg-white/20 border-white/30 hover:bg-white/30"
                                onClick={handlePlaylistClick}
                            >
                                <Plus className="h-5 w-5" />
                            </Button>

                            <Button
                                variant="outline"
                                size="lg"
                                className="bg-white/20 border-white/30 hover:bg-white/30"
                                onClick={handleShare}
                            >
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
                            {movie.tags?.map((tag) => (
                                <Badge key={tag} variant="outline" className="bg-white/10 border-white/20 text-gray-300">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <AddToPlaylistDialog
                        open={isPlaylistOpen}
                        onOpenChange={setIsPlaylistOpen}
                        movieId={movie.id.toString()}
                    />
                    <ShareDialog
                        open={isShareOpen}
                        onOpenChange={setIsShareOpen}
                        movieTitle={movie.title}
                        movieSlug={movie.slug}
                    />
                </div>
            </div>
        </section>
    );
}