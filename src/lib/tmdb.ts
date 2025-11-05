import type { Movie } from "@/types/movie";

export const getTmdbImageUrl = (path: string | null | undefined): string => {
  if (!path) {
    return "/images/poster-placeholder.png"; 
  }
  return `https://image.tmdb.org/t/p/w500${path}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapTmdbToMovie = (tmdbMovie: any): Movie => {
  const releaseDate = tmdbMovie.release_date || tmdbMovie.first_air_date;
  const year = releaseDate ? parseInt(releaseDate.split('-')[0]) : undefined;

  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title || tmdbMovie.name, 
    subTitle: tmdbMovie.original_title || tmdbMovie.original_name,
    posterUrl: getTmdbImageUrl(tmdbMovie.poster_path),
    backdropUrl: getTmdbImageUrl(tmdbMovie.backdrop_path),
    description: tmdbMovie.overview,
    year: year,
    type: tmdbMovie.media_type,
    rating: tmdbMovie.vote_average,
    views: tmdbMovie.vote_count, 
  };
};