"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Clock, CalendarDays } from "lucide-react";
import MovieCast from "@/components/movie/MovieCast";
import { MovieCommentSection } from "@/components/comment/MovieCommentSection";
import { MovieDetailSidebar } from "@/components/movie/MovieDetailSlidebar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Actor } from "@/types/actor";
import type { SidebarData } from "@/services/movie.service"; 

interface Episode {
  id: string;
  episodeNumber: number; 
  title: string | null;
  runtime: number | null; 
  videoUrl: string | null; 
  createdAt: string;
}

interface Season {
  id: string;
  seasonNumber: number; 
  title: string | null;
  overview: string | null;
  episodes: Episode[];
}

const mockSeasons: Season[] = [
  {
    id: "s1",
    seasonNumber: 1,
    title: "Mùa 1: Khởi nguồn",
    overview: "Sự khởi đầu của hành trình...",
    episodes: [
      { 
        id: "e101", 
        episodeNumber: 1, 
        title: "Thức tỉnh", 
        runtime: 45, // int
        videoUrl: null,
        createdAt: "2023-01-15"
      },
      { 
        id: "e102", 
        episodeNumber: 2, 
        title: "Đồng minh mới", 
        runtime: 42,
        videoUrl: null,
        createdAt: "2023-01-22"
      },
    ]
  },
  {
    id: "s2",
    seasonNumber: 2,
    title: "Mùa 2: Đại chiến",
    overview: null,
    episodes: [
      { 
        id: "e201", 
        episodeNumber: 1, 
        title: "Sự trở lại", 
        runtime: 50,
        videoUrl: null,
        createdAt: "2024-05-10"
      },
    ]
  }
];

interface MovieSharedLayoutProps {
  castData: Actor[];
  sidebarData: SidebarData;
  movieId: string; 
}

export default function MovieSharedLayout({ 
  castData, 
  sidebarData, 
  movieId 
}: MovieSharedLayoutProps) {
  
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(mockSeasons[0]?.id);

  const currentSeason = mockSeasons.find(s => s.id === selectedSeasonId);
  const isSeries = mockSeasons.length > 0;

  return (
    <div className="relative z-10 bg-black px-4 md:px-8 lg:px-[7rem] py-12">
      <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
        
        {/* --- Cột Trái --- */}
        <div className="flex flex-1 flex-col gap-12 min-w-0">
          
          {/* List Episodes (Chỉ hiện nếu là TV Series) */}
          {isSeries && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="w-1 h-8 bg-red-600 rounded-full block mr-2"></span>
                  Danh sách tập
                </h2>
                
                <Select 
                  value={selectedSeasonId} 
                  onValueChange={setSelectedSeasonId}
                >
                  <SelectTrigger className="w-[200px] bg-[#1a1b1f] border-zinc-700 text-white focus:ring-0">
                    <SelectValue placeholder="Chọn mùa" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1b1f] border-zinc-700 text-white">
                    {mockSeasons.map((season) => (
                      <SelectItem key={season.id} value={season.id}>
                        {season.title || `Mùa ${season.seasonNumber}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-[#121212] border-zinc-800 p-0 overflow-hidden shadow-none">
                <ScrollArea className="h-[400px] w-full pr-4">
                  <div className="flex flex-col p-2 gap-2">
                    {currentSeason?.episodes.map((ep) => (
                      <div 
                        key={ep.id} 
                        className="group flex flex-col sm:flex-row gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer border border-transparent hover:border-zinc-700/50"
                      >
                        {/* Thumbnail Mock (Vì Episode schema chưa có field ảnh, dùng ảnh mặc định) */}
                        <div className="relative w-full sm:w-40 h-24 flex-shrink-0 rounded-md overflow-hidden bg-zinc-800 border border-zinc-800">
                          <Image 
                            src={"https://placehold.co/600x400/1a1a1a/FFF?text=EP+" + ep.episodeNumber} 
                            alt={ep.title || `Tập ${ep.episodeNumber}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                          {ep.runtime && (
                            <span className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm text-[10px] font-medium text-white px-1.5 py-0.5 rounded">
                                {ep.runtime} phút
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
                          <div className="flex items-center justify-between mb-1">
                             <h4 className="font-bold text-base text-gray-100 group-hover:text-red-500 transition-colors truncate pr-2">
                                Tập {ep.episodeNumber}: {ep.title || "Không có tiêu đề"}
                             </h4>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                             <span className="flex items-center gap-1.5">
                                  <CalendarDays className="w-3.5 h-3.5" /> {new Date(ep.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          )}

          {/* Cast */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-8 bg-red-600 rounded-full block mr-2"></span>
              <h2 className="text-2xl font-bold text-white">Diễn viên</h2>
            </div>
            <MovieCast cast={castData} />
          </div>

          {/* Comments */}
          <MovieCommentSection movieId={movieId} /> 
        </div>

        {/* --- Cột Phải --- */}
        <div className="w-full lg:w-auto flex-shrink-0">
          <MovieDetailSidebar {...sidebarData} />
        </div>

      </div>
    </div>
  );
}