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
                    <CarouselContent className="-ml-4 py-8">
                        {genres.slice(0, 10).map((genre, index) => {
                            const colors = [
                                "from-sky-400/40 to-blue-600/20 border-sky-400/30",
                                "from-violet-400/40 to-purple-600/20 border-violet-400/30",
                                "from-teal-400/40 to-teal-600/20 border-teal-400/30",
                                "from-neutral-300/40 to-neutral-600/20 border-neutral-400/30",
                                "from-rose-400/40 to-rose-600/20 border-rose-400/30",
                                "from-cyan-300/40 to-cyan-600/20 border-cyan-400/30",
                                "from-indigo-400/40 to-indigo-600/20 border-indigo-400/30",
                                "from-emerald-400/40 to-emerald-600/20 border-emerald-400/30",
                            ];

                            const colorClass = colors[index % colors.length];

                            return (
                                <CarouselItem key={genre.id} className="pl-4 basis-auto">
                                    <Link
                                        href={`/filter?genre=${encodeURIComponent(genre.name)}`}
                                        className={`
                                            relative w-[240px] h-[140px] p-6 rounded-2xl 
                                            bg-gradient-to-br ${colorClass}
                                            backdrop-blur-md
                                            border
                                            transition-all duration-500 ease-out
                                            hover:-translate-y-3 hover:scale-105 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)]
                                            flex flex-col justify-between group
                                            overflow-hidden
                                        `}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-60 pointer-events-none" />
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-500" />

                                        <div className="relative z-10">
                                            <h3 className="text-2xl font-black text-white tracking-tight group-hover:tracking-wide transition-all duration-300 drop-shadow-lg">
                                                {genre.name}
                                            </h3>
                                        </div>

                                        <div className="relative z-10 flex items-center justify-between">
                                            <span className="text-xs font-bold text-white/70 uppercase tracking-wider group-hover:text-white transition-colors">
                                                Khám phá
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white text-white group-hover:text-black transition-all duration-300">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                </CarouselItem>
                            );
                        })}

                        <CarouselItem className="pl-4 basis-auto">
                            <Link
                                href="/filter"
                                className="
                                    relative w-[240px] h-[140px] p-6 rounded-2xl 
                                    bg-zinc-900/60 backdrop-blur-xl border border-white/10
                                    hover:bg-zinc-800/80 hover:border-white/30
                                    transition-all duration-500 ease-out
                                    hover:-translate-y-3 hover:scale-105 hover:shadow-2xl
                                    flex flex-col items-center justify-center
                                    group overflow-hidden
                                "
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <span className="text-xl font-bold text-white relative z-10">Xem tất cả</span>
                                <span className="text-sm text-zinc-400 mt-2 relative z-10 group-hover:text-zinc-200 transition-colors">Khám phá kho phim</span>
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
