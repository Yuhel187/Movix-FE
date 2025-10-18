"use client";

import React, { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/NavBar";
import { MovieCategoryCard } from "../movie/MovieCategoryCardProps";
import { ArrowNavigation } from "../movie/ArrowNavigation";
import { FaRobot, FaUsers, FaLock, FaSearch, FaGamepad, FaTv } from "react-icons/fa";
import AIChatWidget from "../ai/AIChatWidget";
import { MovieCard } from "../movie/MovieCard";
import type { Movie } from "@/types/movie"
import Footer from "../layout/Footer";
export default function HomeView() {
  const scrollRefGenres = useRef<HTMLDivElement>(null!);
  const scrollRefTrending = useRef<HTMLDivElement>(null!);
  const scrollRefShows = useRef<HTMLDivElement>(null!);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    const container = ref.current;
    if (!container) return;

    const scrollAmount = container.clientWidth;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction === "left") {
      if (container.scrollLeft <= 0) {
        container.scrollTo({ left: maxScroll, behavior: "smooth" });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    } else {
      if (container.scrollLeft >= maxScroll) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };
    // for test
    const trendingActionMovies = [
  { id: "1", title: "Movie 1", posterUrl: "/images/testavt.webp" },
  { id: "2", title: "Movie 2", posterUrl: "/images/testavt.webp" },
  { id: "3", title: "Movie 3", posterUrl: "/images/testavt.webp" },
  { id: "4", title: "Movie 4", posterUrl: "/images/testavt.webp" },
];
    //giới thiệu tính năng
    const features = [
    {
      icon: <FaTv className="text-red-500 text-3xl" />,
      title: "Hệ thống khuyến nghị thông minh",
      desc: "Khám phá kho phim theo cách cá nhân hóa nhất! Mỗi bộ phim được gợi ý đều 'chuẩn gu' nhờ công nghệ AI.",
    },
    {
      icon: <FaSearch className="text-red-500 text-3xl" />,
      title: "Công cụ tìm kiếm đa dạng, mọi thể loại - mọi chủ đề",
      desc: "Bạn thích phim hành động, lãng mạn hay tài liệu sâu sắc? Công cụ tìm kiếm thông minh sẽ dẫn đúng bộ phim mong muốn.",
    },
    {
      icon: <FaRobot className="text-red-500 text-3xl" />,
      title: "Chatbot AI tích hợp giúp tìm phim phù hợp tâm trạng",
      desc: "Không còn băn khoăn 'hôm nay xem gì'? Chatbot AI sẽ gợi ý bộ phim phù hợp cảm xúc của bạn.",
    },
    {
      icon: <FaUsers className="text-red-500 text-3xl" />,
      title: "Xem phim cùng bạn bè",
      desc: "Biến mỗi buổi xem phim thành một cuộc hẹn giải trí! Dù xa cách, bạn vẫn có thể cùng thưởng thức phim với bạn bè.",
    },
    {
      icon: <FaGamepad className="text-red-500 text-3xl" />,
      title: "Cộng đồng an toàn và năng động",
      desc: "Gia nhập cộng đồng yêu phim sôi nổi, nơi mọi người chia sẻ cảm nhận và tạo mối kết nối lành mạnh.",
    },
    {
      icon: <FaLock className="text-red-500 text-3xl" />,
      title: "Quản lý & Bảo mật hiện đại",
      desc: "Yên tâm tận hưởng khoảnh khắc giải trí với hệ thống bảo mật tiên tiến, bảo vệ dữ liệu người dùng tuyệt đối.",
    },
  ];

  //Phim test
  const mockMovies: Movie[] = [
  {
    id: 1,
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
 const handleWatch = useCallback((movie: Movie) => {
    alert(`🎬 Xem phim: ${movie.title}`)
  }, [])

  const handleLike = useCallback((movie: Movie) => {
    alert(`❤️ Đã thích: ${movie.title}`)
  }, [])

  const handleDetail = useCallback((movie: Movie) => {
    alert(`ℹ️ Chi tiết phim: ${movie.title}`)
  }, [])
  return (
    <>
    <main>
      <div>
    <Navbar/>
    <section className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: "url('images/background-homepage.jpg')",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
      <div className="relative z-10 text-center text-white max-w-3xl px-4">
        <img
          src="images/logo.png"
          alt="Logo"
          className="mx-auto w-64 mb-6 drop-shadow-lg"
        />

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Xem Phim Miễn Phí Cực Nhanh, Chất Lượng Cao Và Cập Nhật Liên Tục
        </h1>
        <p className="text-gray-300 mb-8">
          Thưởng thức hàng ngàn bộ phim bom tấn, series hấp dẫn và chương trình
          đặc sắc — miễn phí, tốc độ cao, không giới hạn.
        </p>
        <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full w-35 text-md">
          Xem ngay
        </Button>
      </div>
      
    </section>
        <div className="w-full bg-black text-white space-y-24">

  {/* === 1. Thể loại phim đa dạng === */}
  <div className="relative w-full min-h-[50vh] overflow-hidden bg-black px-4 sm:px-8 lg:px-20">
    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-10 gap-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center sm:text-left">
        Khám phá những thể loại phim đa dạng
      </h1>
      <div>
        <ArrowNavigation
          onPrev={() => handleScroll(scrollRefGenres, "left")}
          onNext={() => handleScroll(scrollRefGenres, "right")}
        />

      </div>
    </div>

    <section ref={scrollRefGenres} className="overflow-x-auto no-scrollbar">
      <div className="flex gap-6 min-w-max">
        {Array(5)
          .fill(null)
          .map((_, i) => (
            <MovieCategoryCard
              key={i}
              category="Hành động"
              movies={trendingActionMovies}
              onClickMore={() => console.log("Xem thêm")}
            />
          ))}
      </div>
    </section>
  </div>

  {/* === 2. Hệ thống xem phim trực tuyến === */}
  <div className="relative w-full min-h-[50vh] overflow-hidden bg-black px-4 sm:px-8 lg:px-20">
    <div className="mb-10 text-center sm:text-left">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
        Hệ thống xem phim trực tuyến hiện đại bậc nhất,
        <br className="hidden sm:block" /> nhiều chức năng đa dạng hóa trải nghiệm của bạn!
      </h1>
    </div>

    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-gradient-to-b from-neutral-900 to-black text-white p-6 rounded-2xl border border-neutral-800 hover:border-red-500 transition-all hover:scale-105 shadow-lg hover:shadow-red-900/30"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="text-red-500 text-3xl">{f.icon}</div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
            </div>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  </div>

  {/* === 3. Phim thịnh hành === */}
  <div className="relative w-full min-h-[60vh] overflow-hidden bg-black px-4 sm:px-8 lg:px-20">
    <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center sm:text-left">
        Phim đang thịnh hành
      </h1>
      <ArrowNavigation
        onPrev={() => handleScroll(scrollRefTrending, "left")}
        onNext={() => handleScroll(scrollRefTrending, "right")}
      />
    </div>

    <section
      ref={scrollRefTrending}
      className="overflow-x-auto no-scrollbar px-4"
    >
  <div
    className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-6 items-start"
  >
    {mockMovies.map((movie) => (
      <MovieCard
        key={movie.id}
        movie={movie}
        onWatch={handleWatch}
        onLike={handleLike}
        onDetail={handleDetail}
      />
    ))}
  </div>
</section>
  </div>

  {/* === 4. Chương trình truyền hình === */}
  <div className="relative w-full min-h-[60vh] overflow-hidden bg-black px-4 sm:px-8 lg:px-20">
    <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center sm:text-left">
        Chương trình truyền hình đáng xem nhất
      </h1>
      <ArrowNavigation
        onPrev={() => handleScroll(scrollRefShows, "left")}
        onNext={() => handleScroll(scrollRefShows, "right")}
      />

    </div>

    <section
      ref={scrollRefShows}
      className="overflow-x-auto no-scrollbar px-4"
    >
      <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-6 items-start">
        {mockMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onWatch={handleWatch}
            onLike={handleLike}
            onDetail={handleDetail}
          />
        ))}
      </div>
    </section>

  </div>

  {/* === 5. Kêu gọi đăng ký === */}
  <div className="relative w-full bg-black px-4 sm:px-8 lg:px-20 pb-24">
    <div className="relative w-full rounded-md overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{
          backgroundImage: "url('images/background-homepage.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 p-6 sm:p-10 text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left">
          Chưa có tài khoản? Tạo ngay!
        </h2>
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <p className="text-sm sm:text-base text-center sm:text-left max-w-xl">
            Hãy tạo tài khoản để sử dụng những tính năng nâng cao tăng thêm trải nghiệm xem phim của bạn!
          </p>
          <button className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-md text-sm sm:text-md">
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

    </div>
        <Footer/>
    </main>
    <AIChatWidget />
    </>
  );
}
