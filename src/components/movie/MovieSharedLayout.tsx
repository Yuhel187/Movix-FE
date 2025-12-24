"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Play } from "lucide-react";
import MovieCast from "@/components/movie/MovieCast";
import { MovieCommentSection } from "@/components/comment/MovieCommentSection";
import { MovieDetailSidebar } from "@/components/movie/MovieDetailSlidebar";
import MovieRecommendations from "@/components/movie/MovieRecommendations"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Actor } from "@/types/actor";
import type { SidebarData } from "@/services/movie.service";
import type { Season, Episode, Movie } from "@/types/movie"; 

interface MovieSharedLayoutProps {
  castData: Actor[];
  sidebarData: SidebarData;
  movieId: string;
  seasons: Season[];
  movieSlug: string;
  type?: string;
  recommendations?: Movie[]; 
  onEpisodeSelect?: (episode: Episode) => void;
}

export default function MovieSharedLayout({
  castData,
  sidebarData,
  movieId,
  movieSlug,
  seasons = [],
  type,
  recommendations = [],
  onEpisodeSelect,
}: MovieSharedLayoutProps) {

  const isSeries = type === "TV" || (seasons && seasons.length > 0);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (isSeries && seasons.length > 0) {
      setSelectedSeasonId(seasons[0].id);
    }
  }, [seasons, isSeries]);
  const currentSeason = seasons.find((s) => s.id === selectedSeasonId);

  return (
    <div className="relative z-10 bg-black px-4 md:px-8 lg:px-[7rem] py-12">
      <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
        
        <div className="flex flex-1 flex-col gap-12 min-w-0">
          
          {isSeries && currentSeason && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="w-1 h-8 bg-red-600 rounded-full block mr-2"></span>
                  Danh sách tập
                </h2>
                {/* ... Select mùa ... */}
                <Select
                  value={selectedSeasonId}
                  onValueChange={setSelectedSeasonId}
                >
                  <SelectTrigger className="w-[200px] bg-[#1a1b1f] border-zinc-700 text-white focus:ring-0">
                    <SelectValue placeholder="Chọn mùa" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1b1f] border-zinc-700 text-white">
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id}>
                        {season.title || `Mùa ${season.number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-[#121212] border-zinc-800 p-0 overflow-hidden shadow-none">
                <ScrollArea className="h-[400px] w-full pr-4">
                  <div className="flex flex-col p-2 gap-2">
                    {currentSeason.episodes?.map((ep) => (
                      <div
                        key={ep.id}
                        onClick={() => {
                              if (onEpisodeSelect) {
                                onEpisodeSelect(ep);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              } else {
                                router.push(`/movies/${movieSlug}/watch?episodeId=${ep.id}`);
                              }
                            }}
                        className="group flex flex-col sm:flex-row gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer border border-transparent hover:border-zinc-700/50"
                      >
                         {/* Thumbnail  */}
                         <div className="relative w-full sm:w-40 h-24 flex-shrink-0 rounded-md overflow-hidden bg-zinc-800 border border-zinc-800">
                          {/* Debug: {ep.videoImageUrl} */}
                          <Image
                            src={ep.videoImageUrl || `https://placehold.co/600x400/1a1a1a/FFF?text=EP+${ep.number}`}
                            alt={ep.title || `Tập ${ep.number}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                          {ep.runtime ? (
                            <span className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm text-[10px] font-medium text-white px-1.5 py-0.5 rounded">
                              {ep.runtime} phút
                            </span>
                          ) : null}
                        </div>

                        {/* Thông tin Tập */}
                        <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
                          <h4 className="font-bold text-base text-gray-100 group-hover:text-red-500 transition-colors truncate pr-2">
                            Tập {ep.number}: {ep.title || `Episode ${ep.number}`}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-8 bg-red-600 rounded-full block mr-2"></span>
              <h2 className="text-2xl font-bold text-white">Diễn viên</h2>
            </div>
            <MovieCast cast={castData} />
          </div>

          <MovieCommentSection movieId={movieId} />
        </div>

        <div className="w-full lg:w-auto flex-shrink-0">
          <MovieDetailSidebar 
            {...sidebarData} 
            director={sidebarData.director || { name: "Unknown", avatarUrl: "", origin: "" }}
          />
          <MovieRecommendations recommendations={recommendations} />
        </div>

      </div>
    </div>
  );
}