import api from "@/lib/apiClient";
import type { Movie, MovieResponse, Season } from "@/types/movie";
import type { Actor } from "@/types/actor";
import type { Director } from "@/types/director";
import { getTmdbImageUrl, getPersonAvatarUrl } from "@/lib/tmdb";

export interface SidebarData {
  releaseYear: number | string;
  languages: string[];
  ratings: { imdb: number; movix: number };
  genres: string[];
  director: Director | null;
}
function mapToMovie(raw: MovieResponse): Movie {
  const releaseYear = raw.release_date
    ? new Date(raw.release_date).getFullYear()
    : "N/A";
  
  const tags = raw.movie_genres?.map((mg) => mg.genre?.name).filter(Boolean) || [];

  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title || raw.original_title || "Chưa có tên",
    subTitle: raw.original_title || "",
    description: raw.description || "",
    
    posterUrl: getTmdbImageUrl(raw.poster_url, "poster"),
    backdropUrl: getTmdbImageUrl(raw.backdrop_url, "backdrop"),
    
    trailerUrl: raw.trailer_url || null,
    videoUrl: null,
    
    type: raw.media_type === "TV" ? "TV" : "MOVIE",
    releaseYear: releaseYear,
    tags: tags,
    
    rating: raw.metadata?.tmdb_rating || 0,
    duration: raw.metadata?.duration || "N/A",
    views: 0,
    cast: [],
    director: undefined,
    seasons: []
  };
}
export async function getMovieData(slug: string) {
  let raw: MovieResponse;
  
  try {
    const res = await api.get<MovieResponse>(`/movies/${slug}`);
    raw = res.data;
  } catch (error: any) {
    console.error("Lỗi lấy phim:", error.response?.data || error.message);
    throw new Error("Không tìm thấy phim");
  }

  const castData: Actor[] = raw.movie_people
    ?.filter(mp => mp.person.role_type === "actor" || mp.credit_type === "cast")
    .map((mp, idx) => ({
      id: mp.person.id, 
      name: mp.person.name || "Không rõ",
      character: mp.character || "Unknown",
      profileUrl: getPersonAvatarUrl(mp.person.avatar_url),
    })) || [];
  const directorRaw = raw.movie_people?.find(
    (mp) => mp.person.role_type === "director" || mp.credit_type === "crew" 
  );

  const director: Director | null = directorRaw ? {
      name: directorRaw.person.name,
      avatarUrl: getPersonAvatarUrl(directorRaw.person.avatar_url),
      origin: "Unknown"
  } : null;
  const seasons: Season[] = raw.seasons?.map(s => ({
    id: s.id,
    number: s.season_number,
    title: s.title || `Season ${s.season_number}`,
    episodes: s.episodes?.map(e => ({
      id: e.id,
      number: e.episode_number,
      title: e.title || `Episode ${e.episode_number}`,
      videoUrl: e.video_url,
      runtime: e.runtime || 0
    })) || []
  })) || [];

  let mainVideoUrl = raw.trailer_url;

  if (raw.media_type === "MOVIE") {
    const firstEpLink = seasons?.[0]?.episodes?.[0]?.videoUrl;
    if (firstEpLink) {
      mainVideoUrl = firstEpLink;
    }
  }
  const releaseYear = raw.release_date
    ? new Date(raw.release_date).getFullYear()
    : "Đang cập nhật";

  const tags = raw.movie_genres?.map((mg) => mg.genre?.name).filter(Boolean) || [];

  const movie: Movie = {
    id: raw.id,
    slug: raw.slug,
    title: raw.title || raw.original_title || "Không có tiêu đề",
    subTitle: raw.original_title || raw.title || "",
    description: raw.description || "",
    
    posterUrl: getTmdbImageUrl(raw.poster_url, "poster"),
    backdropUrl: getTmdbImageUrl(raw.backdrop_url, "backdrop"),
    
    trailerUrl: raw.trailer_url || null,
    videoUrl: mainVideoUrl || null, 
    seasons: seasons,               
    
    type: raw.media_type,           
    releaseYear: releaseYear,
    tags: tags,
    cast: castData,
    director: director || undefined,
    rating: raw.metadata?.tmdb_rating || 0,
    duration: raw.metadata?.duration || "N/A",
    views:0,
  };

  const sidebarData: SidebarData = {
    releaseYear: releaseYear,
    languages: ["Vietnamese", "English"], 
    ratings: {
      imdb: raw.metadata?.tmdb_rating || 0,
      movix: 9.0,
    },
    genres: tags,
    director: director,
  };

  return { movie, sidebarData };
}
export async function getTrendingMovies(): Promise<Movie[]> {
  try {
    const { data } = await api.get<MovieResponse[]>('/movies/trending');
    return data.map(mapToMovie);
  } catch (error) {
    console.error("Lỗi lấy phim Trending:", error);
    return [];
  }
}
export interface MovieSection {
  id: string;
  title: string;
  movies: Movie[];
}

export async function getDynamicSections(): Promise<MovieSection[]> {
  try {
    const { data } = await api.get<any[]>('/homepage');
    return data.map((section: any) => ({
      id: section.id,
      title: section.title,
      movies: section.movie_links
        .map((link: any) => link.movie ? mapToMovie(link.movie) : null)
        .filter(Boolean) as Movie[]
    }));
  } catch (error) {
    console.error("Lỗi lấy dynamic sections:", error);
    return [];
  }
}