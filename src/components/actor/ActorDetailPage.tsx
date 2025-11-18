"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MovieCard } from "@/components/movie/MovieCard";
import { Movie } from "@/types/movie";
import { Actor } from "@/types/actor";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

interface ActorDetailPageProps {
  actor: Actor;
  movies: Movie[];
  isLoading?: boolean;
}

export default function ActorDetailPage({ actor, movies, isLoading }: ActorDetailPageProps) {
  const router = useRouter();

  if (isLoading) {
    return <ActorDetailSkeleton />;
  }
  
  const displayUrl = actor.avatar_url || actor.profileUrl || actor.imageUrl;

  return (
    <div className="container mx-auto px-4 pb-12 text-white">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Cột trái: Thông tin diễn viên */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div className="relative aspect-[2/3] w-full max-w-sm mx-auto md:mx-0 rounded-lg overflow-hidden shadow-2xl bg-slate-800">
            {displayUrl ? (
              <Image
                src={displayUrl}
                alt={`Poster of ${actor.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, (max-width: 1024px) 30vw, 25vw"
              />
            ) : (
               <div className="flex items-center justify-center w-full h-full">
                 <User className="w-1/2 h-1/2 text-gray-500" />
               </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center md:text-left mt-6">
            {actor.name}
          </h1>
          {actor.biography && (
             <div className="mt-4 text-gray-300 text-sm space-y-3">
              <h3 className="text-lg font-semibold text-white">Tiểu sử</h3>
              <p className="leading-relaxed">{actor.biography}</p>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-6">Các phim đã tham gia</h2>
          {movies.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                <p className="mt-4 text-lg">Không tìm thấy phim nào.</p>
             </div>
          ) : (
            <div className="dark grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  disablePreview={true} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ActorDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-12">
    <div className="flex flex-col md:flex-row gap-8 md:gap-12">
      <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
        <Skeleton className="aspect-[2/3] w-full max-w-sm mx-auto md:mx-0 rounded-lg bg-slate-700" />
        <Skeleton className="h-10 w-3/4 mt-6 bg-slate-700" />
        <Skeleton className="h-4 w-full mt-4 bg-slate-700" />
        <Skeleton className="h-4 w-full mt-2 bg-slate-700" />
        <Skeleton className="h-4 w-5/6 mt-2 bg-slate-700" />
      </div>
      <div className="flex-1">
        <Skeleton className="h-8 w-1/2 mb-6 bg-slate-700" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[2/3] w-full rounded-md bg-slate-700" />
              <Skeleton className="h-4 w-3/4 mt-2 bg-slate-700" />
              <Skeleton className="h-3 w-1/2 mt-1 bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);