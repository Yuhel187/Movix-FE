import type { Movie } from "@/types/movie";

const PLACEHOLDER_POSTER = "/images/placeholder-poster.png";
const PLACEHOLDER_BACKDROP = "/images/placeholder-backdrop.png";
const PLACEHOLDER_AVATAR = "/images/placeholder-avatar.png";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export const getTmdbImageUrl = (
  path: string | null | undefined,
  type: "poster" | "backdrop" = "poster"
): string => {
  if (path) {
    if (path.startsWith("http")) {
      return path;
    }
    return `${TMDB_IMAGE_BASE_URL}${path}`;
  }
  return type === "poster" ? PLACEHOLDER_POSTER : PLACEHOLDER_BACKDROP;
};

export const getPersonAvatarUrl = (
  path: string | null | undefined
): string => {
  if (path) {
    if (path.startsWith("http")) {
      return path;
    }
    return `${TMDB_IMAGE_BASE_URL}${path}`;
  }
  return PLACEHOLDER_AVATAR;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapTmdbToMovie = (tmdbMovie: any): Movie => {
  const releaseDate = tmdbMovie.release_date || tmdbMovie.first_air_date;
  const year = releaseDate ? parseInt(releaseDate.split('-')[0]) : undefined;

  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title || tmdbMovie.name, 
    subTitle: tmdbMovie.original_title || tmdbMovie.original_name,
    posterUrl: getTmdbImageUrl(tmdbMovie.poster_path, "poster"),
    backdropUrl: getTmdbImageUrl(tmdbMovie.backdrop_path, "backdrop"),
    description: tmdbMovie.overview,
    year: year,
    type: tmdbMovie.media_type,
    rating: tmdbMovie.vote_average,
    views: tmdbMovie.vote_count, 
  };
};