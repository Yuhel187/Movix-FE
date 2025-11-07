"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/NavBar";
import AIChatWidget from "../ai/AIChatWidget";
import { MovieCard } from "../movie/MovieCard";
import type { Movie } from "@/types/movie";
import FilterPanel, { FilterState } from "@/components/filter/FilterPanel"; 
import { Pagination } from "../common/pagination";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "../layout/Footer";
import { FaFilter, FaSearch } from "react-icons/fa";
import apiClient from "@/lib/apiClient"; 
import { Skeleton } from "@/components/ui/skeleton"; 


type Genre = {
  id: string;
  name: string;
};
type Country = {
  id: string;
  name: string | null;
  
};

type FilterPageProps = {
  searchParams?: {
    q?: string;
    type?: string;
    genre?: string;
    country?: string;
    year?: string;
  };
};

const defaultFilters: FilterState = {
  country: "Tất cả",
  type: "Tất cả",
  rating: "Tất cả",
  genre: [],
  language: "Tất cả",
  year: "Tất cả",
  q: "",
};

export default function FilterPage({ searchParams }: FilterPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const clientSearchParams = useSearchParams();

  const [showFilter, setShowFilter] = useState(false);
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingFilterData, setIsLoadingFilterData] = useState(true);

  const [filters, setFilters] = useState<FilterState>(() => {
    const initialUrlType = searchParams?.type;
    let initialDisplayType = "Tất cả";
    if (initialUrlType === "phim-le") {
      initialDisplayType = "Phim lẻ";
    } else if (initialUrlType === "phim-bo") {
      initialDisplayType = "Phim bộ";
    }
    const initialGenres = searchParams?.genre ? [searchParams.genre] : [];

    return {
      ...defaultFilters,
      q: searchParams?.q || "",
      type: initialDisplayType,
      genre: initialGenres,
      country: searchParams?.country || "Tất cả",
      year: searchParams?.year || "Tất cả",
    };
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const moviesPerPage = 35; 

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setIsLoadingFilterData(true);
        const [genresRes, countriesRes] = await Promise.all([
          apiClient.get('/movies/genres'),
          apiClient.get('/movies/countries')
        ]);
        setGenres(genresRes.data || []);
        setCountries(countriesRes.data || []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu filter:", err);
      } finally {
        setIsLoadingFilterData(false);
      }
    };
    fetchFilterData();
  }, []);

  const fetchMovies = useCallback(async (currentFilters: FilterState, page: number) => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams();
    
    if (currentFilters.q) params.append("q", currentFilters.q);
    if (currentFilters.type && currentFilters.type !== "Tất cả") {
      const typeValue = currentFilters.type === 'Phim lẻ' ? 'phim-le' : (currentFilters.type === 'Phim bộ' ? 'phim-bo' : currentFilters.type);
      params.append("type", typeValue);
    }
    if (currentFilters.genre && currentFilters.genre.length > 0) {
      currentFilters.genre.forEach(g => {
        params.append("genre", g); 
      });
    }
    if (currentFilters.country && currentFilters.country !== "Tất cả") params.append("country", currentFilters.country);
    if (currentFilters.year && currentFilters.year !== "Tất cả") params.append("year", currentFilters.year);

    try {
      const res = await apiClient.get(`/movies/filter?${params.toString()}`);
      const allMovies: Movie[] = res.data;
      const total = allMovies.length;
      setTotalPages(Math.ceil(total / moviesPerPage));
      
      const paginatedMovies = allMovies.slice(
        (page - 1) * moviesPerPage,
        page * moviesPerPage
      );
      setMovies(paginatedMovies);
    } catch (err) {
      console.error("Lỗi khi lọc phim:", err);
      setError("Không thể tải kết quả lọc. Vui lòng thử lại.");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, [moviesPerPage]); 

  useEffect(() => {
    const urlType = clientSearchParams.get("type");
    let displayType = "Tất cả";
    if (urlType === "phim-le") {
      displayType = "Phim lẻ";
    } else if (urlType === "phim-bo") {
      displayType = "Phim bộ"; 
    }

  const urlGenres = clientSearchParams.getAll("genre");
  const newFilters: FilterState = {
      ...defaultFilters,
      q: clientSearchParams.get("q") || "",
      type: displayType, 
      genre: urlGenres, 
      country: clientSearchParams.get("country") || "Tất cả",
      year: clientSearchParams.get("year") || "Tất cả",
    };
    setFilters(newFilters);
    fetchMovies(newFilters, currentPage);
  }, [clientSearchParams, currentPage, fetchMovies]);

  const updateURL = (newFilters: FilterState) => {
    const params = new URLSearchParams();
    if (newFilters.q) params.set("q", newFilters.q);
    if (newFilters.type && newFilters.type !== "Tất cả") {
      const typeValue = newFilters.type === 'Phim lẻ' ? 'phim-le' : (newFilters.type === 'Phim bộ' ? 'phim-bo' : newFilters.type);
      params.set("type", typeValue);
    }
    if (newFilters.genre && newFilters.genre.length > 0) {
      newFilters.genre.forEach(g => {
        params.append("genre", g);
      });
 }
    if (newFilters.country && newFilters.country !== "Tất cả") params.set("country", newFilters.country);
    if (newFilters.year && newFilters.year !== "Tất cả") params.set("year", newFilters.year);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setCurrentPage(1); 
    updateURL(filters); 
  };

  const handleReset = () => {
    setCurrentPage(1);
    setFilters(defaultFilters);
    updateURL(defaultFilters); 
  };

  const handleWatch = useCallback((movie: Movie) => {
      router.push(movie.slug ? `/movies/${movie.slug}/watch` : '#');
  }, [router]);
  const handleDetail = useCallback((movie: Movie) => {
      router.push(movie.slug ? `/movies/${movie.slug}` : '#');
  }, [router]);

  const renderSkeletons = () => (
    Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="group relative">
        <Skeleton className="aspect-[2/3] w-full rounded-md bg-slate-800" />
        <div className="mt-2 px-0.5">
          <Skeleton className="h-4 w-3/4 bg-slate-800" />
          <div className="mt-1 flex items-center gap-3">
            <Skeleton className="h-3 w-16 bg-slate-800" />
            <Skeleton className="h-3 w-20 bg-slate-800" />
          </div>
        </div>
      </div>
    ))
  );

  return (
    <>
      <main>
        <div className="bg-black dark">
          <Navbar />
          <section className="relative w-full flex overflow-hidden bg-black flex-wrap justify-between">
            <div className="p-6 w-full">
              <div className="flex gap-4 mb-5 mt-5 ml-5">
                <FaSearch className="text-red-500 text-3xl" />
                <h1 className="text-2xl text-white mb-4 font-semibold">
                  {filters.q ? `Kết quả cho: "${filters.q}"` : "Bộ Lọc Phim"}
                </h1>
                <Button
                  onClick={() => setShowFilter(!showFilter)}
                  className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
                >
                  <FaFilter />
                  {showFilter ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                </Button>
              </div>
              
              <AnimatePresence>
                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <FilterPanel
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onSubmit={handleSubmit}
                      onReset={handleReset}
                      genres={genres}
                      countries={countries}
                      isLoadingGenres={isLoadingFilterData}
                      isLoadingCountries={isLoadingFilterData}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <section
            className={`transition-all duration-300 px-4 pb-20 ${
              showFilter ? "mt-6" : "mt-0"
            }`}
          >
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {renderSkeletons()}
              </div>
            ) : error ? (
              <div className="text-center text-red-400">{error}</div>
            ) : movies.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 min-h-[40vh] text-lg">
                Không tìm thấy phim nào khớp với bộ lọc của bạn.
              </div>  
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onWatch={handleWatch}
                    onDetail={handleDetail}
                  />
                ))}
              </div>
            )}
          </section>

          {!isLoading && !error && movies.length > 0 && (
             <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
             />
          )}
        </div>
        <Footer />
      </main>
      <AIChatWidget />
    </>
  );
}