'use client';

import Navbar from "@/components/layout/NavBar";
import HeroBanner from "@/components/movie/HeroBanner";
import type { Movie } from "@/types/movie";

export default function MoviesPage() {
  const featuredMovies: Movie[] = [
    {
      id: "breaking-bad",
      title: "Breaking Bad",
      description:
        "Walter White, giáo viên hóa học bị ung thư, bắt đầu hành trình sản xuất ma túy để lo cho gia đình.",
      posterUrl:
        "https://image.tmdb.org/t/p/original/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      backdropUrl:
        "https://image.tmdb.org/t/p/original/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg",
      tags: ["T18", "Hình sự", "Khoa học", "Tâm lý"],
    },
    {
      id: "interstellar",
      title: "Giữa Các Vì Sao",
      subTitle: "Interstellar",
      description: "A fiery young man clashes with an unflinching forest officer in a south Indian village where spirituality, fate and folklore rule the lands.",
      posterUrl: "https://image.tmdb.org/t/p/original/if4TI9LbqNIrzkoOgWjX5PZYDYe.jpg",
      backdropUrl: "https://image.tmdb.org/t/p/original/9REO1DLpmwhrBJY3mYW5eVxkXFM.jpg",
      tags: ["T18", "Hình sự", "Khoa học", "Tâm lý"],
    },
    {
      id: "the-dark-knight",
      title: "Kỵ Sĩ Bóng Đêm",
      subTitle: "The Dark Knight",
      description:
        "Joker gieo rắc hỗn loạn ở Gotham, buộc Batman phải đối mặt với giới hạn đạo đức của chính mình.",
      posterUrl:
        "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdropUrl:
        "https://image.tmdb.org/t/p/original/orKrjonvMHiGFjuDNKnQGkXfGe8.jpg",
      tags: ["Chính kịch", "Hành động", "Tội phạm"],
    },
  ];

  return (
    <main className="dark min-h-screen overflow-hidden">
      <Navbar />
      <section className="w-full h-screen">
        <HeroBanner movies={featuredMovies} />
      </section>
    </main>
  );
}
