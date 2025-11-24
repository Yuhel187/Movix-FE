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
  const findInitialUrl = () => {
    if (episodeIdFromUrl && movie.seasons) {
      for (const season of movie.seasons) {
        const ep = season.episodes.find(e => e.id === episodeIdFromUrl);
        if (ep?.videoUrl) return ep.videoUrl;
      }
    }
    return movie.videoUrl || movie.seasons?.[0]?.episodes?.[0]?.videoUrl || "";
  };
  const currentEpisode = useMemo(() => {
    if (episodeIdFromUrl && movie.seasons) {
      for (const season of movie.seasons) {
        const ep = season.episodes.find((e) => e.id === episodeIdFromUrl);
        if (ep) return ep;
      }
    }
    return movie.seasons?.[0]?.episodes?.[0];
  }, [episodeIdFromUrl, movie.seasons]);

  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(findInitialUrl());


  useEffect(() => {
    const newUrl = findInitialUrl();
    if (newUrl && newUrl !== currentVideoUrl) {
      setCurrentVideoUrl(newUrl);
    }
  }, [episodeIdFromUrl]);

  const handleEpisodeSelect = (episode: Episode) => {
    if (episode.videoUrl) setCurrentVideoUrl(episode.videoUrl);
  };

  return (
    <div className="w-full">
      <section className="pt-20 w-full max-w-6xl px-4 mx-auto flex justify-center">
        <VideoPlayer
          src={currentVideoUrl}
          poster={movie.posterUrl || ""}
          episodeId={currentEpisode?.id || ""}
        />
      </section>
      <MovieSharedLayout
        castData={movie.cast || []}
        sidebarData={sidebarData}
        movieId={movie.id}
        movieSlug={movie.slug}
        seasons={movie.seasons || []}
        type={movie.type}
        onEpisodeSelect={handleEpisodeSelect}
      />
    </div>
  );
}