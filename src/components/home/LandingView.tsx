/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MovieCategoryCard } from "../movie/MovieCategoryCardProps";
import { ArrowNavigation } from "../movie/ArrowNavigation";
import { FaRobot, FaUsers, FaLock, FaSearch, FaGamepad, FaTv } from "react-icons/fa";
import AIChatWidget from "../ai/AIChatWidget";
import { MovieCard } from "../movie/MovieCard";
import type { Movie } from "@/types/movie"
import Footer from "../layout/Footer";
import Navbar from "@/components/layout/NavBar";
import { Skeleton } from "../ui/skeleton";
import { mapTmdbToMovie } from "@/lib/tmdb";
import apiClient from "@/lib/apiClient";

interface Genre {
  id: number;
  name: string;
}

const genresList: Genre[] = [
  { id: 28, name: "Hành động" },
  { id: 12, name: "Phiêu lưu" },
  { id: 16, name: "Hoạt hình" },
  { id: 35, name: "Hài" },
  { id: 80, name: "Tội phạm" },
  { id: 99, name: "Tài liệu" },
  { id: 18, name: "Chính kịch" },
  { id: 10751, name: "Gia đình" },
  { id: 14, name: "Giả tưởng" },
  { id: 36, name: "Lịch sử" },
  { id: 27, name: "Kinh dị" },
  { id: 10402, name: "Nhạc" },
  { id: 9648, name: "Bí ẩn" },
  { id: 10749, name: "Lãng mạn" },
  { id: 878, name: "Khoa học viễn tưởng" },
  { id: 10770, name: "Phim TV" },
  { id: 53, name: "Gây cấn" },
  { id: 10752, name: "Chiến tranh" },
  { id: 37, name: "Miền Tây" },
];

export default function LandingView() {
  const scrollRefGenres = useRef<HTMLDivElement>(null!);
  const scrollRefTrending = useRef<HTMLDivElement>(null!);
  const scrollRefShows = useRef<HTMLDivElement>(null!);
  
  const router = useRouter();
  
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularShows, setPopularShows] = useState<Movie[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingShows, setIsLoadingShows] = useState(true);
  const [genreMovies, setGenreMovies] = useState<Map<number, Movie[]>>(new Map());
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);

  useEffect(() => {
    // Lấy phim thịnh hành
    apiClient.get("/movies/trendingtmdb") 
      .then((res) => {
        if (Array.isArray(res.data)) {
          setTrendingMovies(res.data.map(mapTmdbToMovie));
        }
        setIsLoadingTrending(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy phim thịnh hành:", err);
        setIsLoadingTrending(false);
      });

    // Lấy TV shows phổ biến
    apiClient.get("/movies/popular-showstmdb") 
      .then((res) => { 
        if (Array.isArray(res.data)) {
          setPopularShows(res.data.map(mapTmdbToMovie));
        }
        setIsLoadingShows(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy TV shows:", err);
        setIsLoadingShows(false);
      });

    const fetchAllGenreMovies = async () => {
        const movieMap = new Map<number, Movie[]>();
        await Promise.all(
          genresList.map(async (genre) => {
            try {
              const res = await apiClient.get(`/movies/by-genre/${genre.id}`);
              if (res.status !== 200) return;
              
              const data = res.data;
              if (Array.isArray(data)) {
                movieMap.set(genre.id, data.map(mapTmdbToMovie));
              }
            } catch (err) {
              console.error(`Lỗi lấy phim cho thể loại ${genre.name}:`, err);
            }
          })
        );
        
        setGenreMovies(movieMap);
        setIsLoadingGenres(false);
      };

      fetchAllGenreMovies();
    }, []);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    const container = ref.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 4/5;
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

 const handleWatch = useCallback((movie: Movie) => {
    alert(`🎬 Xem phim: ${movie.title}`)
  }, [])

  const handleLike = useCallback((movie: Movie) => {
    alert(`❤️ Đã thích: ${movie.title}`)
  }, [])

  const handleDetail = useCallback((movie: Movie) => {
    alert(`ℹ️ Chi tiết phim: ${movie.title}`)
  }, [])

  const renderSkeletons = (count = 8) => {
    return Array(8).fill(0).map((_, i) => (
      <Skeleton key={i} className="w-[220px] h-[330px] bg-neutral-800 rounded-md" />
    ));
  };

  const handleGenreClick = (genreName: string) => {
    router.push(`/login`);
  };


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
      <div className="relative z-10 text-center text-white max-w-3xl px-4 justify-center flex flex-col items-center">
        <svg width="224" height="224" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.34292 21.7071C5.56187 22.4882 4.29521 22.4882 3.51416 21.7071C2.73311 20.9261 2.73311 19.6594 3.51416 18.8784L12.0001 10.3924L20.4859 18.8784C21.267 19.6594 21.267 20.9261 20.4859 21.7071C19.7049 22.4882 18.4382 22.4882 17.6572 21.7071L12.0001 16.05L6.34292 21.7071Z" fill="#E50914" />
              <path d="M3.51416 5.12164C4.29521 4.34059 5.56187 4.34059 6.34292 5.12164L12.0001 10.7788L17.6572 5.12164C18.4382 4.34059 19.7049 4.34059 20.4859 5.12164C21.267 5.90269 21.267 7.16935 20.4859 7.9504L12.0001 16.4363L3.51416 7.9504C2.73311 7.16935 2.73311 5.90269 3.51416 5.12164Z" fill="#E50914" />
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#E50914" />
            </svg>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Xem Phim Miễn Phí Cực Nhanh, Chất Lượng Cao Và Cập Nhật Liên Tục
        </h1>
        <p className="text-gray-300 mb-8">
          Thưởng thức hàng ngàn bộ phim bom tấn, series hấp dẫn và chương trình
          đặc sắc — miễn phí, tốc độ cao, không giới hạn.
        </p>
        <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full w-35 text-md">
         <a href="/login">
        ▶ Xem ngay</a>
        </Button>
      </div>
      
    </section>
        <div className="w-full bg-black text-white space-y-24">

  {/* === 1. Thể loại phim đa dạng === */}
  <div className="relative w-full min-h-[30vh] overflow-hidden bg-black px-4 sm:px-8 lg:px-20">
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

    <div ref={scrollRefGenres} className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-3 sm:gap-6 min-w-max">
                  {isLoadingGenres
                    ? 
                      Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="w-[300px] h-[180px] rounded-lg bg-neutral-800" />
                      ))
                    : 
                      genresList.map((genre) => {
                        // Lấy 4 phim cho thể loại này từ state
                        const moviesForThisGenre = genreMovies.get(genre.id) || [];
                        
                        // Tạo mảng poster (tối đa 4)
                        const posters = moviesForThisGenre.map(m => m.posterUrl).slice(0, 4);

                        return (
                          <div 
                            key={genre.id}
                            className="cursor-pointer"
                            onClick={() => handleGenreClick(genre.name)}
                          >
                            <MovieCategoryCard
                              category={genre.name}
                              movies={posters.map((url, idx) => ({ id: `${genre.id}-${idx}`, title: '', posterUrl: url }))}
                              onClickMore={() => handleGenreClick(genre.name)}
                            />
                          </div>
                        );
                      })}
                </div>
              </div>
  </div>

  {/* === 2. Hệ thống xem phim trực tuyến === */}
  <div className="relative w-full min-h-[30vh] overflow-hidden bg-black px-4 sm:px-8 lg:px-20">
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
            <div className="relative w-full min-h-[30vh] overflow-hidden bg-black px-4 sm:px-8 lg:px-20">
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
                className="overflow-x-auto no-scrollbar px-4 py-12"
              >
                <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-6 items-start dark text-center">
                  {isLoadingTrending
                    ? renderSkeletons() 
                    : trendingMovies.map((movie) => ( 
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
            <div className="relative w-full min-h-[30vh] overflow-hidden bg-black px-4 sm:px-8 lg:px-20">
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
                className="overflow-x-auto no-scrollbar px-4 py-12"
              >
                <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-6 items-start dark text-center">
                   {isLoadingShows
                    ? renderSkeletons() 
                    : popularShows.map((movie) => ( 
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
                      <a href="/login" className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-md text-md font-bold sm:text-md">
                        Đăng ký ngay
                      </a>
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