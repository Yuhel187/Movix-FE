"use client";

import React, { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/NavBar";
import { MovieCategoryCard } from "../movie/MovieCategoryCardProps";
import { ArrowNavigation } from "../movie/ArrowNavigation";
import { FaRobot, FaUsers, FaLock, FaSearch, FaGamepad, FaTv, FaFilter } from "react-icons/fa";
import AIChatWidget from "../ai/AIChatWidget";
import { MovieCard } from "../movie/MovieCard";
import type { Movie } from "@/types/movie"
import FilterPanel from "@/components/filter/FilterPanel"
import { Pagination } from "../common/pagination";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "../layout/Footer";

type FilterPageProps = {
    searchParams?: {
        type?: string;
    };
};

export default function FilterPage({ searchParams }: FilterPageProps) {
    const type = searchParams?.type || "Tất cả";
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
        tags: ["Hành động", "Khoa học viễn tưởng", "Siêu anh hùng"],
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
    const [showFilter, setShowFilter] = useState(false);
    const toggleFilter = () => setShowFilter(!showFilter);
    const moviesPerPage = 35;
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    const currentMovies = mockMovies.slice(indexOfFirstMovie, indexOfLastMovie);
    const [selectedTab, setSelectedTab] = useState<"phim" | "dienvien">("phim");

  return (
    <>
    <main>
        <div className="bg-black">
            <Navbar/>
            <section className="relative w-full flex overflow-hidden bg-black flex-wrap justify-between">
                    <div className="p-6 w-full">
                        <div className="flex gap-4 mb-5 mt-5 ml-5">
                            <FaSearch className="text-red-500 text-3xl" />
                            <h1 className="text-2xl text-white mb-4 font-semibold">Kết quả tìm kiếm</h1>
                            <Button
                                onClick={toggleFilter}
                                className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
                                >
                                <FaFilter />
                            Bộ lọc
                            </Button>
                        </div>       
                        <div className="flex items-center gap-3 ml-5 mb-5">
                          <button
                            onClick={() => setSelectedTab("phim")}
                            className={`px-6 py-2 rounded-full font-medium transition ${
                              selectedTab === "phim"
                                ? "bg-white text-black"
                                : "bg-[#252733] text-gray-300"
                            }`}
                          >
                            Phim
                          </button>
                          <button
                            onClick={() => setSelectedTab("dienvien")}
                            className={`px-6 py-2 rounded-full font-medium transition ${
                              selectedTab === "dienvien"
                                ? "bg-white text-black"
                                : "bg-[#252733] text-gray-300"
                            }`}
                          >
                            Diễn viên
                          </button>
                        </div>
                        <AnimatePresence>
                            {showFilter && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex justify-between items-center mb-3">
                               
                                </div>
                                <FilterPanel defaultType={type} />
                                <div className="flex justify-end mt-4">
                                </div>
                            </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
            </section>
            <section
          className={`transition-all duration-300 px-4 pb-20 ${
            showFilter ? "mt-0" : "-mt-3"
          }`}
        >
          <div
            className="
              grid 
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
              gap-4
            "
          >
            {currentMovies.map((movie) => (
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
            <Pagination
                totalPages={Math.ceil(mockMovies.length / moviesPerPage)}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                />
        </div>      
        <Footer/>
    </main>
    <AIChatWidget />
    </>
  );
}
