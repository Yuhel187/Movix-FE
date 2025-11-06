'use client';

import Navbar from "@/components/layout/NavBar";
import HeroBanner from "@/components/movie/HeroBanner";
import type { Movie } from "@/types/movie";
import { MovieCarousel } from "@/components/movie/MovieCarousel"; 
import Footer from "@/components/layout/Footer";

export default function MoviesPage() {
  const featuredMovies: Movie[] = [
    {
      id: "breaking-bad",
      slug: "breaking-bad",
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
      slug: "interstellar",
      title: "Giữa Các Vì Sao",
      subTitle: "Interstellar",
      description: "A fiery young man clashes with an unflinching forest officer in a south Indian village where spirituality, fate and folklore rule the lands.",
      posterUrl: "https://image.tmdb.org/t/p/original/if4TI9LbqNIrzkoOgWjX5PZYDYe.jpg",
      backdropUrl: "https://image.tmdb.org/t/p/original/9REO1DLpmwhrBJY3mYW5eVxkXFM.jpg",
      tags: ["T18", "Hình sự", "Khoa học", "Tâm lý"],
    },
    {
      id: "the-dark-knight",
      slug: "the-dark-knight",
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
const horrorMovies: Movie[] = [
  {
    id: '74af397a-0b08-4816-a941-9cfa8b8fc3a9',
    slug: "inception",
    title: "Avengers: Endgame",
    subTitle: "Hồi kết của Avengers",
    posterUrl: "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    description:
      "Sau khi Thanos xóa sổ nửa vũ trụ, những anh hùng còn lại phải tìm cách đảo ngược thảm họa và cứu lấy thế giới.",
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Khoa học viễn tưởng", "Si`êu anh hùng"],
    rating: 9.0,
    duration: "3h 2m",
    country: "Mỹ",
    views: 12000000,
  },
  {
    id: 2,
    slug: "john-wick-4",
    title: "John Wick 4",
    subTitle: "Chương cuối của sát thủ huyền thoại",
    posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    description:
      "John Wick đối đầu với Hội Bàn Tròn trong trận chiến sinh tử để giành lại tự do của mình.",
    year: 2023,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Tội phạm", "Hồi hộp"],
    rating: 8.7,
    duration: "2h 49m",
    country: "Mỹ",
    views: 8900000,
  },
  {
    id: 3,
    slug: "demon-slayer-mugen-train",
    title: "Demon Slayer: Mugen Train",
    subTitle: "Thanh gươm diệt quỷ - Chuyến tàu vô tận",
    posterUrl: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg",
    description:
      "Tanjiro và đồng đội cùng Rengoku điều tra một chuỗi vụ mất tích bí ẩn trên chuyến tàu vô tận.",
    year: 2020,
    type: "Anime Movie",
    episode: "Full HD",
    tags: ["Anime", "Hành động", "Phiêu lưu"],
    rating: 8.6,
    duration: "1h 57m",
    country: "Nhật Bản",
    views: 7600000,
  },
  {
    id: 4,
    slug: "interstellar",
    title: "Interstellar",
    subTitle: "Cuộc du hành xuyên không gian",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description:
      "Một nhóm phi hành gia vượt qua lỗ sâu để tìm kiếm hành tinh có thể sinh sống cho loài người.",
    year: 2014,
    type: "Phim khoa học viễn tưởng",
    episode: "Full HD",
    tags: ["Sci-Fi", "Phiêu lưu", "Tâm lý"],
    rating: 8.9,
    duration: "2h 49m",
    country: "Mỹ",
    views: 10400000,
  },
  {
    id: 5,
    title: "Demon Slayer: Mugen Train",
    subTitle: "Thanh gươm diệt quỷ - Chuyến tàu vô tận",
    posterUrl: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg",
    description:
      "Tanjiro và đồng đội cùng Rengoku điều tra một chuỗi vụ mất tích bí ẩn trên chuyến tàu vô tận.",
    year: 2020,
    type: "Anime Movie",
    episode: "Full HD",
    tags: ["Anime", "Hành động", "Phiêu lưu"],
    rating: 8.6,
    duration: "1h 57m",
    country: "Nhật Bản",
    views: 7600000,
  },
  {
    id: 6,
    title: "Interstellar",
    subTitle: "Cuộc du hành xuyên không gian",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description:
      "Một nhóm phi hành gia vượt qua lỗ sâu để tìm kiếm hành tinh có thể sinh sống cho loài người.",
    year: 2014,
    type: "Phim khoa học viễn tưởng",
    episode: "Full HD",
    tags: ["Sci-Fi", "Phiêu lưu", "Tâm lý"],
    rating: 8.9,
    duration: "2h 49m",
    country: "Mỹ",
    views: 10400000,
  },
   {
    id: 7,
    title: "Avengers: Endgame",
    subTitle: "Hồi kết của Avengers",
    posterUrl: "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    description:
      "Sau khi Thanos xóa sổ nửa vũ trụ, những anh hùng còn lại phải tìm cách đảo ngược thảm họa và cứu lấy thế giới.",
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Khoa học viễn tưởng", "Siêu anh hùng"],
    rating: 9.0,
    duration: "3h 2m",
    country: "Mỹ",
    views: 12000000,
  },
  {
    id: 8,
    slug: "inception",
    title: "John Wick 4",
    subTitle: "Chương cuối của sát thủ huyền thoại",
    posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    description:
      "John Wick đối đầu với Hội Bàn Tròn trong trận chiến sinh tử để giành lại tự do của mình.",
    year: 2023,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Tội phạm", "Hồi hộp"],
    rating: 8.7,
    duration: "2h 49m",
    country: "Mỹ",
    views: 8900000,
  },
]

  return (
    <main className="dark min-h-screen bg-black">
      <Navbar />
      <section className="w-full h-screen">
        <HeroBanner movies={featuredMovies} />
      </section>
      <MovieCarousel 
        title="Top 10 phim đáng xem nhất" 
        movies={horrorMovies} 
      />
      <MovieCarousel title="Phim Hành Động" movies={horrorMovies} />
      <MovieCarousel title="Mới Cập Nhật" movies={horrorMovies} />

      <Footer />
    </main>
  );
}