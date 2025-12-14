"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar } from "lucide-react";
import type { Movie } from "@/types/movie";

interface MovieRecommendationsProps {
    recommendations: Movie[];
}

export default function MovieRecommendations({ recommendations }: MovieRecommendationsProps) {
    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 mt-8">
            {/* Header đồng bộ style */}
            <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-8 bg-red-600 rounded-full block mr-2"></span>
                <h2 className="text-xl font-bold text-white">Có thể bạn muốn xem</h2>
            </div>

            <div className="flex flex-col gap-3">
                {recommendations.slice(0, 6).map((movie) => (
                    <Link
                        key={movie.id}
                        href={`/movies/${movie.slug}`}
                        className="group flex flex-row gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer border border-transparent hover:border-zinc-700/50"
                    >
                        <div className="relative w-20 h-28 sm:w-24 sm:h-36 flex-shrink-0 rounded-md overflow-hidden bg-zinc-800 border border-zinc-800">
                            <Image
                                src={movie.posterUrl || "/images/placeholder-poster.png"}
                                alt={movie.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100px, 150px"
                            />

                            {movie.rating && movie.rating > 0 && (
                                <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-[10px] font-bold text-white">{movie.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
                            <h4 className="font-bold text-sm sm:text-base text-gray-100 group-hover:text-red-500 transition-colors line-clamp-2 mb-1">
                                {movie.title}
                            </h4>

                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                {movie.releaseYear && (
                                    <span className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded">
                                        <Calendar className="w-3 h-3" /> {movie.releaseYear}
                                    </span>
                                )}
                                <span className="bg-zinc-900 px-2 py-1 rounded uppercase text-[10px] font-medium">
                                    {movie.type === 'TV' ? 'Series' : 'Movie'}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}