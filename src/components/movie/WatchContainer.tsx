"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/movie/VideoPlayer";
import MovieSharedLayout from "@/components/movie/MovieSharedLayout";
import type { Movie } from "@/types/movie";
import type { SidebarData } from "@/services/movie.service";
import type { Episode } from "@/types/movie";

interface WatchContainerProps {
  movie: Movie;
  sidebarData: SidebarData;
}

export default function WatchContainer({ movie, sidebarData }: WatchContainerProps) {
  const searchParams = useSearchParams();
  const episodeIdFromUrl = searchParams.get("episodeId");
  const startTimeFromUrl = searchParams.get("t");

  const findEpisodeById = (id: string | null) => {
    if (!id || !movie.seasons) return null;
    for (const season of movie.seasons) {
      const ep = season.episodes.find((e) => e.id === id);
      if (ep) return ep;
    }
    return null;
  };

  const initialEpisode = useMemo(() => {
      return findEpisodeById(episodeIdFromUrl) || movie.seasons?.[0]?.episodes?.[0];
  }, [episodeIdFromUrl, movie.seasons]);

  const [currentEpisode, setCurrentEpisode] = useState<Episode | undefined>(initialEpisode);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(
      initialEpisode?.videoUrl || movie.videoUrl || ""
  );

  useEffect(() => {
    if (initialEpisode) {
        setCurrentEpisode(initialEpisode);
        setCurrentVideoUrl(initialEpisode.videoUrl || "");
    } else if (movie.videoUrl) {
        setCurrentVideoUrl(movie.videoUrl);
    }
  }, [initialEpisode, movie.videoUrl]);

  const handleEpisodeSelect = (episode: Episode) => {
    setCurrentEpisode(episode);
    if (episode.videoUrl) setCurrentVideoUrl(episode.videoUrl);
  };

  const startTime = (currentEpisode?.id === episodeIdFromUrl && startTimeFromUrl) 
    ? parseInt(startTimeFromUrl, 10) 
    : 0;

  return (
    <div className="w-full">
      <section className="pt-20 w-full max-w-6xl px-4 mx-auto flex justify-center">
        <VideoPlayer
          src={currentVideoUrl}
          poster={movie.posterUrl || ""}
          episodeId={currentEpisode?.id || ""}
          startTime={startTime}
        />
      </section>
      <MovieSharedLayout
        castData={movie.cast || []}
        sidebarData={sidebarData}
        movieId={movie.id}
        movieSlug={movie.slug}
        seasons={movie.seasons || []}
        type={movie.type}
        posterUrl={movie.posterUrl}
        onEpisodeSelect={handleEpisodeSelect}
        recommendations={movie.recommendations || []}
      />
    </div>
  );
}