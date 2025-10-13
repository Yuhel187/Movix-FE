"use client"
import { MovieCard } from "@/components/movie/MovieCard";
import type { Movie } from "@/types/movie" 

const demoMovie: Movie = {
  id: 1,
  title: "Nhất Tiếu Tuý Ca",
  subTitle: "Fated Hearts",
  posterUrl: "https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  year: 2025,
  type: "T13",
  episode: "Tập 10",
  tags: ["Cổ Trang", "Bí Ẩn", "Lãng Mạn"],
  description: "Phim cực hay",
  duration: "45 phút",
  views: 1234567
}

export default function Page() {
  return (
    <main className="dark grid grid-cols-8 gap-4 p-6 bg-background min-h-screen">
      <MovieCard
        movie={demoMovie}
        onWatch={(m) => alert(`Xem phim: ${m.title}`)}
        onLike={(m) => alert(`Đã thích: ${m.title}`)}
      />
      <MovieCard
        movie={demoMovie}
        onWatch={(m) => alert(`Xem phim: ${m.title}`)}
        onLike={(m) => alert(`Đã thích: ${m.title}`)}
      />
      <MovieCard
        movie={demoMovie}
        onWatch={(m) => alert(`Xem phim: ${m.title}`)}
        onLike={(m) => alert(`Đã thích: ${m.title}`)}
      />
      <MovieCard
        movie={demoMovie}
        onWatch={(m) => alert(`Xem phim: ${m.title}`)}
        onLike={(m) => alert(`Đã thích: ${m.title}`)}
      />
      <MovieCard
        movie={demoMovie}
        onWatch={(m) => alert(`Xem phim: ${m.title}`)}
        onLike={(m) => alert(`Đã thích: ${m.title}`)}
      />
      <MovieCard
        movie={demoMovie}
        onWatch={(m) => alert(`Xem phim: ${m.title}`)}
        onLike={(m) => alert(`Đã thích: ${m.title}`)}
      />
      <MovieCard
        movie={demoMovie}
        onWatch={(m) => alert(`Xem phim: ${m.title}`)}
        onLike={(m) => alert(`Đã thích: ${m.title}`)}
      />
    </main>
  )
}
