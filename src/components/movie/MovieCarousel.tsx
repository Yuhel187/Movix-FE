"use client";

import React, { useRef, useCallback } from "react";
import type { Movie } from "@/types/movie";
import { MovieCard } from "./MovieCard";
import { ArrowNavigation } from "./ArrowNavigation";
import { ChevronRight } from "lucide-react";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  onCardWatch?: (movie: Movie) => void;
  onCardLike?: (movie: Movie) => void;
  onCardDetail?: (movie: Movie) => void;
}

export function MovieCarousel({
  title,
  movies,
  onCardWatch,
  onCardLike,
  onCardDetail,
}: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null!);

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = (container.firstElementChild?.clientWidth || 220) + 24;
    
    container.scrollBy({ 
      left: direction === "left" ? -scrollAmount : scrollAmount, 
      behavior: "smooth" 
    });
  };
  
  const handleWatch = useCallback((movie: Movie) => {
    onCardWatch ? onCardWatch(movie) : alert(`Watch: ${movie.title}`);
  }, [onCardWatch]);

  const handleLike = useCallback((movie: Movie) => {
    onCardLike ? onCardLike(movie) : alert(`Like: ${movie.title}`);
  }, [onCardLike]);

  const handleDetail = useCallback((movie: Movie) => {
    onCardDetail ? onCardDetail(movie) : alert(`Detail: ${movie.title}`);
  }, [onCardDetail]);

  return (
    <div className="relative w-full overflow-visible dark py-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between mb-5 px-4 sm:px-8 lg:px-12">
        <a href="#" className="flex items-center gap-2 group">
          <h2 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-red-500 transition-colors">
            {title}
          </h2>
          <ChevronRight className="w-7 h-7 text-white group-hover:text-red-500 transition-colors" />
        </a>
        <ArrowNavigation
          onPrev={() => handleScroll("left")}
          onNext={() => handleScroll("right")}
        />
      </div>

      {/* Movie List */}
      <section
        ref={scrollRef}
        className="overflow-visible no-scrollbar px-4 sm:px-8 lg:px-12"
      >
        <div
          className="grid grid-flow-col auto-cols-[minmax(180px,1fr)] sm:auto-cols-[minmax(220px,1fr)] gap-6 items-start"
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onWatch={handleWatch}
              onLike={handleLike}
              onDetail={handleDetail}
            />
          ))}
        </div>
      </section>
    </div>
  );
}