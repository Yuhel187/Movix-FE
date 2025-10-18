'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, ThumbsUp, Volume2 } from "lucide-react";
import type { Movie } from "@/types/movie";

interface MovieHeroProps {
    movie: Movie;
}

export default function MovieHero({ movie }: MovieHeroProps) {
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
                            src={movie.posterUrl}
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
                            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white rounded-md">
                                <Play className="mr-2 h-5 w-5" />
                                Xem ngay
                            </Button>
                            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 rounded-md">
                                <Plus className="h-5 w-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 rounded-md">
                                <ThumbsUp className="h-5 w-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 rounded-md">
                                <Volume2 className="h-5 w-5" />
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
                </div>
            </div>
        </section>
    );
}