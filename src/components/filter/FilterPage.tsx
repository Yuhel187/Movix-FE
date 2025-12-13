/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
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
import { FaFilter, FaSearch, FaMagic, FaMicrophone, FaStop} from "react-icons/fa";
import apiClient from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Genre = {
  id: string;
  name: string;
};
type Country = {
  id: string;
  name: string | null;
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

const mapResponseToMovie = (m: any): Movie => {
  let displayInfo = m.metadata?.duration || undefined;
  if (m.media_type === 'TV') {
      const seasonCount = m.seasons?.length || m.metadata?.total_seasons || 0;
  }

  return {
    id: m.id,
    slug: m.slug,
    title: m.title,
    subTitle: m.original_title,
    description: m.description || "",
    posterUrl: m.poster_url || "/images/placeholder-poster.png",
    backdropUrl: m.backdrop_url,
    trailerUrl: m.trailer_url,
    videoUrl: null,
    
    releaseYear: m.release_date ? new Date(m.release_date).getFullYear() : undefined,
    tags: m.movie_genres?.map((mg: any) => mg.genre.name) || [],
    rating: m.metadata?.tmdb_rating || 0,
    
    duration: m.metadata?.duration, 
    type: m.media_type,
    seasons: m.seasons?.map((s: any) => ({
        id: s.id,
        number: s.season_number,
        title: s.title,
        episodes: [] 
    })) || []
  };
};

export default function FilterPage({ searchParams }: { searchParams?: { q?: string; type?: string; genre?: string | string[]; country?: string; year?: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const clientSearchParams = useSearchParams();

  const [showFilter, setShowFilter] = useState(false);
  
  const [showAISearch, setShowAISearch] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingFilterData, setIsLoadingFilterData] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [filters, setFilters] = useState<FilterState>(() => {
    const initialUrlType = searchParams?.type;
    let initialDisplayType = "Tất cả";
    
    if (initialUrlType === "phim-le") {
      initialDisplayType = "Phim lẻ";
    } else if (initialUrlType === "phim-bo") {
      initialDisplayType = "Phim bộ";
    }

    const initialGenres = searchParams?.genre 
      ? (Array.isArray(searchParams.genre) ? searchParams.genre : [searchParams.genre]) 
      : [];

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
    params.append('page', page.toString());
    params.append('take', moviesPerPage.toString());
    
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
      const res = await apiClient.get(`/movies/filter`, { params });
      setMovies(res.data.data.map(mapResponseToMovie));
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      console.error("Lỗi khi lọc phim:", err);
      setError("Không thể tải kết quả lọc. Vui lòng thử lại.");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, [moviesPerPage]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Chrome/Firefox thường record ra webm
        await handleSendAudio(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Lỗi truy cập micro:", err);
      toast.error("Không thể truy cập Microphone. Vui lòng cấp quyền.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendAudio = async (audioBlob: Blob) => {
    setIsAiSearching(true);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("audio", audioBlob, "voice_query.webm");

    try {
      const res = await apiClient.post('/ai/search-voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMovies(res.data.map(mapResponseToMovie));
      setTotalPages(1);
      setShowAISearch(false); 
      setAiQuery("Tìm kiếm bằng giọng nói..."); 

    } catch (err) {
      console.error("AI Voice Search Error:", err);
      setError("AI không nghe rõ hoặc không tìm thấy phim phù hợp.");
    } finally {
      setIsAiSearching(false);
      setIsLoading(false);
    }
  };

  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;
    
    setIsAiSearching(true);
    setIsLoading(true);
    setError(null);
    
    try {
        const res = await apiClient.post('/ai/search', { query: aiQuery });
        setMovies(res.data.map(mapResponseToMovie));
        setTotalPages(1); 
        setShowAISearch(false); 
    } catch (err) {
        console.error("AI Search Error:", err);
        setError("AI không thể tìm thấy phim phù hợp lúc này.");
    } finally {
        setIsAiSearching(false);
        setIsLoading(false);
    }
  };

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
    setAiQuery(""); 
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
        <div className="bg-black dark min-h-screen">
          <Navbar />
          
          {/* Header & Controls */}
          <section className="relative w-full bg-black px-6 pt-6 pb-4">
             <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl text-white font-bold flex items-center gap-2">
                        <FaSearch className="text-red-600" />
                        {aiQuery && !isLoading && !error ? "Kết quả gợi ý từ AI" : (filters.q ? `Kết quả cho: "${filters.q}"` : "Khám phá phim")}
                    </h1>
                </div>

                <div className="flex gap-3">
                  <Button
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        className={`flex items-center gap-2 border transition-all ${
                            isRecording 
                            ? 'bg-red-600 border-red-600 text-white animate-pulse' 
                            : 'bg-transparent border-red-500 text-red-400 hover:bg-red-900/20'
                        }`}
                        disabled={isAiSearching}
                    >
                        {isRecording ? <FaStop /> : <FaMicrophone />}
                        {isRecording ? "Đang nghe..." : "Voice AI"}
                    </Button>
                    <Button
                        onClick={() => { setShowAISearch(!showAISearch); setShowFilter(false); }}
                        className={`flex items-center gap-2 border ${showAISearch ? 'bg-purple-600 border-purple-600 text-white' : 'bg-transparent border-purple-500 text-purple-400 hover:bg-purple-900/20'}`}
                    >
                        <FaMagic /> {showAISearch ? "Đóng AI" : "Tìm bằng AI"}
                    </Button>

                    <Button
                        onClick={() => { setShowFilter(!showFilter); setShowAISearch(false); }}
                        variant="outline"
                        className="bg-yellow-600/10 border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-white"
                    >
                        <FaFilter className="mr-2" />
                        Bộ lọc
                    </Button>
                </div>
             </div>

             {/* KHU VỰC TÌM KIẾM AI */}
             <AnimatePresence>
                {showAISearch && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-4 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl"
                    >
                        <h3 className="text-purple-200 font-semibold mb-2 flex items-center gap-2">
                            <FaMagic /> Mô tả bộ phim bạn muốn xem
                        </h3>
                        <div className="flex gap-3 flex-col sm:flex-row">
                            <Textarea 
                                placeholder="Ví dụ: Một bộ phim buồn về tình yêu ở Paris, kết thúc bi thảm..."
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                className="bg-black/50 border-purple-500/50 text-white focus:border-purple-400 min-h-[80px]"
                            />
                            <Button 
                                onClick={handleAISearch}
                                disabled={isAiSearching || !aiQuery.trim()}
                                className="h-auto py-4 sm:w-32 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                            >
                                {isAiSearching ? "Đang suy nghĩ..." : "Tìm kiếm"}
                            </Button>
                        </div>
                        <p className="text-xs text-purple-400/60 mt-2 italic">
                            * AI sẽ phân tích ngữ nghĩa câu nói của bạn để tìm phim phù hợp nhất trong kho dữ liệu.
                        </p>
                    </motion.div>
                )}
             </AnimatePresence>

             {/* KHU VỰC BỘ LỌC THƯỜNG */}
             <AnimatePresence>
                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-4"
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
          </section>

          {/* KẾT QUẢ HIỂN THỊ */}
          <section className="px-6 pb-20">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
                {renderSkeletons()}
              </div>
            ) : error ? (
              <div className="text-center text-red-400 py-10">{error}</div>
            ) : movies.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 min-h-[40vh] text-lg">
                Không tìm thấy phim nào khớp với yêu cầu của bạn.
              </div>  
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
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

          {/* Phân trang */}
          {!isLoading && !error && movies.length > 0 && totalPages > 1 && (
             <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={(page) => {
                    setCurrentPage(page);
                }}
             />
          )}
        </div>
        <Footer />
      </main>
      <AIChatWidget />
    </>
  );
}