import api from "@/lib/apiClient";
import type { Movie } from "@/types/movie";
import type { Actor } from "@/types/actor";

export interface SidebarData {
  releaseYear: number | string;
  languages: string[];
  ratings: { imdb: number; movix: number };
  genres: string[];
  director: { name: string; avatarUrl: string; origin: string };
}
export async function getMovieData(slug: string) {
  let raw: any;
  try {
    const res = await api.get(`/movies/${slug}`);
    raw = res.data;
  } catch (error: any) {
    console.error("Lỗi lấy phim:", error.response?.data || error.message);
    throw new Error("Không tìm thấy phim");
  }

  const movie: Movie = {
    id: raw.id,
    title: raw.title || raw.original_title || "Không có tiêu đề",
    subTitle: raw.original_title || raw.title || "",
    description: raw.description || "",
    posterUrl: raw.poster_url || raw.backdrop_url || "",
    backdropUrl: raw.backdrop_url || raw.poster_url || "",
    videoUrl: raw.video_url || null, 
    tags:
      raw.movie_genres?.map((mg: any) => mg.genre?.name).filter(Boolean) || [],
  };

  const castData: Actor[] =
    raw.movie_people?.map((mp: any, idx: number) => ({
      id: idx + 1,
      name: mp.person?.name || "Không rõ",
      character: mp.character || "",
      profileUrl:
        mp.person?.avatar_url ||
        "https://i.pravatar.cc/150?u=movix-default-actor",
    })) || [];

  const directorPerson = raw.movie_people?.find(
    (mp: any) => mp.person?.role_type === "director"
  )?.person;

  const sidebarData: SidebarData = {
    releaseYear: raw.release_date
      ? new Date(raw.release_date).getFullYear()
      : "Đang cập nhật",
    languages: ["Vietnamese"], // Nên lấy từ API nếu có
    ratings: {
      imdb: raw.metadata?.imdb_rating || 4.5,
      movix: raw.metadata?.movix_rating || 4.0,
    },
    genres:
      raw.movie_genres?.map((mg: any) => mg.genre?.name).filter(Boolean) || [],
    director: {
      name: directorPerson?.name || "Đang cập nhật",
      avatarUrl:
        directorPerson?.avatar_url ||
        "https://i.pravatar.cc/150?u=movix-director",
      origin: "", 
    },
  };

  return { movie, castData, sidebarData };
}