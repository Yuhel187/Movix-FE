"use client";

import React from "react";
import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import type { Genre } from "@/types/movie";
import { ChevronRight } from "lucide-react";

interface GenreSectionProps {
    genres: Genre[];
}

export function GenreSection({ genres }: GenreSectionProps) {
    if (genres.length === 0) return null;

    return (
        <section className="px-0 md:px-12">
            <div className="flex flex-row items-center justify-between mb-5 px-4 md:px-0">
                <a href="#" className="flex items-center gap-2 group">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-red-500 transition-colors">
                        Bạn đang quan tâm gì?
                    </h2>
                    <ChevronRight className="w-7 h-7 text-white group-hover:text-red-500 transition-colors" />
                </a>
            </div>

            <div className="px-4 md:px-0">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {genres.slice(0, 10).map((genre, index) => {
                            const colors = [
                                "bg-gradient-to-br from-blue-600 to-blue-800",
                                "bg-gradient-to-br from-purple-600 to-purple-800",
                                "bg-gradient-to-br from-emerald-600 to-emerald-800",
                                "bg-gradient-to-br from-rose-600 to-rose-800",
                                "bg-gradient-to-br from-orange-600 to-orange-800",
                                "bg-gradient-to-br from-cyan-600 to-cyan-800",
                                "bg-gradient-to-br from-pink-600 to-pink-800",
                                "bg-gradient-to-br from-indigo-600 to-indigo-800",
                            ];
                            const colorClass = colors[index % colors.length];

                            return (
                                <CarouselItem key={genre.id} className="pl-4 basis-auto">
                                    <Link
                                        href={`/filter?genre=${encodeURIComponent(genre.name)}`}
                                        className={`
                                            relative block w-[240px] h-[130px] p-5 rounded-xl 
                                            ${colorClass} 
                                            transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/10
                                            flex flex-col justify-between group
                                            border border-white/5
                                        `}
                                    >
                                        <h3 className="text-xl font-bold text-white group-hover:tracking-wide transition-all">
                                            {genre.name}
                                        </h3>
                                        <div className="text-xs font-medium text-white/80 group-hover:text-white flex items-center gap-1">
                                            Xem chủ đề <span className="transition-transform group-hover:translate-x-1">›</span>
                                        </div>

                                        {/* Decorative circle */}
                                        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all pointer-events-none" />
                                    </Link>
                                </CarouselItem>
                            );
                        })}

                        <CarouselItem className="pl-4 basis-auto">
                            <Link
                                href="/filter"
                                className="
                                    relative block w-[240px] h-[130px] p-5 rounded-xl 
                                    bg-zinc-800/80 hover:bg-zinc-700
                                    transition-all duration-300 hover:scale-105
                                    flex flex-col items-center justify-center
                                    border border-white/10
                                "
                            >
                                <span className="text-lg font-bold text-white">Xem tất cả</span>
                                <span className="text-sm text-zinc-400 mt-1">Khám phá kho phim</span>
                            </Link>
                        </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious className="left-0 md:-left-12 bg-white/10 border-none hover:bg-white/20 text-white" />
                    <CarouselNext className="right-0 md:-right-12 bg-white/10 border-none hover:bg-white/20 text-white" />
                </Carousel>
            </div>
        </section>
    );
}
