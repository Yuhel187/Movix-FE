import MovieHero from "@/components/movie/MovieHero";
import Navbar from "@/components/layout/NavBar";
import type { Movie } from "@/types/movie";
import type { Actor } from "@/types/actor";
import MovieCast from "@/components/movie/MovieCast";
import  {MovieCommentSection}  from "@/components/comment/MovieCommentSection";
import Footer from "@/components/layout/Footer";
import { MovieDetailSidebar } from "@/components/movie/MovieDetailSlidebar";
import api from "@/lib/apiClient";
async function getMovie(slug: string) {
  try {
    const res = await api.get(`/movies/${slug}`);
    return res.data;
  } catch (error: any) {
    console.error("Lỗi lấy phim:", error.response?.data || error.message);
    throw new Error("Không tìm thấy phim");
  }
}

export default async function MovieDetailPage({ params }: { params: { slug: string } }) {
  const raw = await getMovie(params.slug);

  const movie: Movie = {
    id: raw.id,
    title: raw.title || raw.original_title || "Không có tiêu đề",
    subTitle: raw.original_title || raw.title || "",
    description: raw.description || "",
    posterUrl: raw.poster_url || raw.backdrop_url || "",
    backdropUrl: raw.backdrop_url || raw.poster_url || "",
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

  const sidebarData = {
    releaseYear: raw.release_date
      ? new Date(raw.release_date).getFullYear()
      : "Đang cập nhật",
    languages: ["Vietnamese"],
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

    return (
        <main className="dark min-h-screen bg-black text-white">
            <div className="absolute top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            <MovieHero movie={movie} />
            <div className="relative z-10 bg-black px-[7rem] py-12">
              
              <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
                
                <div className="flex flex-1 flex-col gap-12">
                  <MovieCast cast={castData} />
                  <MovieCommentSection />
                </div>
                
                {/* Cột phụ (Sidebar) */}
                <div className="w-full lg:w-auto">
                  <MovieDetailSidebar {...sidebarData} />
                </div>

              </div>
            </div>
        </main>
    );
}