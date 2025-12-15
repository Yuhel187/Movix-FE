/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import FilterPanel, { FilterState } from "@/components/filter/FilterPanel";
import { Pagination } from "@/components/common/pagination";
import AddMovieForm from "./AddMovieForm";
import apiClient from "@/lib/apiClient"; 
import { SearchBar } from "@/components/common/search-bar";
import {
  List,
  Grid,
  Plus,
  Trash,
  Edit,
  MoreHorizontal,
  AlertCircle,
  Filter as FilterIcon,
} from "lucide-react";
import type { Movie } from "@/types/movie";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { MovieCard } from "@/components/movie/MovieCard";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, X, Tv, Film as FilmIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

const RenderPreviewCard = ({ movie, onMovieDeleted, onEditMovie }: { 
  movie: Movie | null;
  onMovieDeleted: (movieId: string) => void; 
  onEditMovie: (slug: string) => void;
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  if (!movie) {
    return (
      <Card className="bg-[#262626] border-slate-800 text-white p-4 h-full">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <span className="text-gray-400 text-sm">
            Chọn một phim để xem chi tiết
          </span>
        </CardContent>
      </Card>
    );
  }

  const movieData = movie as any; 
  const isDeleted = movieData.is_deleted;
  const isActive = movieData.is_active;
  let contentInfo = { icon: <FilmIcon className="w-4 h-4 mr-2" />, text: "Phim lẻ" };
  if (movieData.media_type === 'TV') {
    const totalSeasons = movieData.seasons?.length || 0;
    const totalEpisodes = movieData.seasons?.reduce((acc: number, season: any) => acc + (season._count?.episodes || 0), 0) || 0;
    contentInfo = {
      icon: <Tv className="w-4 h-4 mr-2" />,
      text: `${totalSeasons} Mùa / ${totalEpisodes} Tập`
    };
  }
  const genres: string[] = movieData.movie_genres?.map((mg: any) => mg.genre.name) || [];
  
  const displayPoster =  movie.posterUrl || movie.poster_url || "/images/placeholder-poster.png"; 

  const handleDelete = async () => {
    if (!movie || !movie.id) return;
    
    const toastId = toast.loading("Đang xóa phim...");
    try {
      await apiClient.delete(`/movies/${movie.id.toString()}`);
      toast.success("Đã xóa phim thành công.", { id: toastId });
      onMovieDeleted(movie.id.toString());
    } catch (err) {
      console.error(err);
      toast.error("Xóa phim thất bại.", { id: toastId });
    }
    setIsAlertOpen(false);
  };

  return (
    <Card className="bg-[#262626] border-slate-800 text-white h-full flex flex-col overflow-hidden shadow-xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        
        <div className="max-w-[160px] mx-auto">
          <div className="aspect-[2/3] relative rounded-md overflow-hidden bg-slate-800">
            <Image
              src={displayPoster || "/images/placeholder-poster.png"}
              alt={movie.title}
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold">{movie.title}</h2>
          <div className="flex justify-center mt-3">
            {isDeleted ? (
              <Badge className="bg-red-900/30 text-red-500 border border-red-600/50">
                <Trash className="w-3 h-3 mr-1.5" /> Đã xóa
              </Badge>
            ) : isActive ? (
              <Badge className="bg-green-700/30 text-green-400 border border-green-600/50">
                <Check className="w-3 h-3 mr-1.5" /> Đang hiện
              </Badge>
            ) : (
              <Badge className="bg-gray-700/30 text-gray-400 border border-gray-600/50">
                <X className="w-3 h-3 mr-1.5" /> Đang ẩn
              </Badge>
            )}
          </div>
        </div>

        <div className="border-t border-slate-700"></div>

        <div className="space-y-2 text-sm">
          <h3 className="text-xs uppercase text-gray-400 font-semibold mb-2">Thông tin nhanh</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Nội dung:</span>
            <span className="font-medium flex items-center">
              {contentInfo.icon} {contentInfo.text}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Năm SX:</span>
            <span className="font-medium">
              {(movie as any).release_date ? new Date((movie as any).release_date).getFullYear() : movie.releaseYear || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-gray-400">Quốc gia:</span>
             <span className="font-medium">{movieData.country?.name || 'N/A'}</span>
          </div>
           <div className="flex justify-between items-center">
             <span className="text-gray-400">Mã TMDB:</span>
             <span className="font-medium text-gray-300">{movieData.tmdb_id || 'N/A'}</span>
          </div>
        </div>

        <div className="border-t border-slate-700"></div>

        <div className="space-y-2 text-sm pb-2">
          <h3 className="text-xs uppercase text-gray-400 font-semibold mb-2">Thể loại</h3>
          <div className="flex flex-wrap gap-1.5">
            {genres.length > 0 ? genres.map(genre => (
              <Badge key={genre} variant="secondary" className="bg-slate-700 text-gray-300">
                {genre}
              </Badge>
            )) : (
              <p className="text-gray-500 text-xs">Chưa gán thể loại.</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-2 bg-[#262626] border-t border-slate-800 shrink-0 z-10 flex flex-col gap-3">
        <Button
          variant="outline"
          className="bg-amber-600 border-amber-600 text-white hover:bg-amber-700 hover:text-white"
          onClick={() => onEditMovie(movie.slug as string)}
          disabled={isDeleted}
        >
          <Edit className="h-4 w-4 mr-2" />
          Chỉnh sửa thông tin
        </Button>
        <Button
          variant="destructive"
          onClick={() => setIsAlertOpen(true)}
          disabled={isDeleted}
          className={isDeleted ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Trash className="h-4 w-4 mr-2" />
          {isDeleted ? "Đã xóa" : "Xóa phim"}
        </Button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
         <AlertDialogContent>
           <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa (soft delete) phim <strong className="text-white">{movie.title}</strong>. <br/>Phim sẽ bị ẩn khỏi người dùng. Bạn có chắc chắn muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Tiếp tục xóa
            </AlertDialogAction>
          </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

const RenderGridView = ({
  movies,
  onSelectMovie,
}: {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}) => {
  const handleAction = useCallback((movie: Movie) => {
    onSelectMovie(movie);
  }, [onSelectMovie]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-7 gap-x-4 gap-y-8 dark">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onDetail={handleAction} 
          onWatch={handleAction}
          disablePreview={true} 
        />
      ))}
    </div>
  );
};

const RenderListView = ({
  movies,
  onSelectMovie,
}: {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}) => (
  <Card className="bg-[#262626] border-slate-800 text-white">
    <Table>
      <TableHeader>
        <TableRow className="border-slate-700 hover:bg-transparent">
          <TableHead className="text-white">Tên phim</TableHead>
          <TableHead className="text-white">Thể loại</TableHead>
          <TableHead className="text-white">Loại phim</TableHead>
          <TableHead className="text-white">Năm</TableHead>
          <TableHead className="text-white">Last change</TableHead>
          <TableHead className="text-white text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movies.map((movie) => (
          <TableRow
            key={movie.id}
            className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
            onClick={() => onSelectMovie(movie)}
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <Image
                  src={movie.posterUrl || movie.poster_url || "/images/placeholder-poster.png"} 
                  alt={movie.title}
                  width={40}
                  height={56}
                  className="w-10 h-14 object-cover rounded-md bg-slate-800"
                />
                <span className="truncate w-40">{movie.title}</span>
              </div>
            </TableCell>
            <TableCell className="text-gray-300">
              {(movie as any).movie_genres?.map((mg: any) => mg.genre.name).slice(0, 2).join(", ") || movie.tags?.slice(0, 2).join(", ")}
            </TableCell>
            <TableCell className="text-gray-300">
              {(movie as any).media_type === 'TV' ? 'Phim bộ' : 'Phim lẻ'}
            </TableCell>
            <TableCell className="text-gray-300">
              {(movie as any).release_date ? new Date((movie as any).release_date).getFullYear() : movie.releaseYear}
            </TableCell>
            <TableCell className="text-gray-300">2025-10-26</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

const MovieGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-7 gap-x-4 gap-y-8">
    {Array.from({ length: 35 }).map((_, i) => (
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
    ))}
  </div>
);


const MovieListSkeleton = () => (
  <Card className="bg-[#262626] border-slate-800 text-white">
    <Table>
      <TableHeader>
        <TableRow className="border-slate-700 hover:bg-transparent">
          <TableHead className="text-white">Tên phim</TableHead>
          <TableHead className="text-white">Thể loại</TableHead>
          <TableHead className="text-white">Loại phim</TableHead>
          <TableHead className="text-white">Năm</TableHead>
          <TableHead className="text-white">Last change</TableHead>
          <TableHead className="text-white text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRow key={i} className="border-slate-800">
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-14 rounded-md bg-slate-800" />
                <Skeleton className="h-4 w-40 bg-slate-800" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24 bg-slate-800" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16 bg-slate-800" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-12 bg-slate-800" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20 bg-slate-800" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-8 w-8 rounded-full bg-slate-800 ml-auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

const MOVIES_PER_PAGE = 35;

export default function MovieStoragePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFilter, setShowFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingFilterData, setIsLoadingFilterData] = useState(true);
  const [pendingFilters, setPendingFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);

  const handleGoToEditPage = (slug: string) => {
      if (!slug) {
        toast.error("Phim này bị lỗi, không có slug để chỉnh sửa.");
        return;
      }
      router.push(`/admin/movie-management?slug=${slug}`);
    };

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

  useEffect(() => {
    // 1. Tạo hàm fetchMovies mới
    const fetchMovies = async () => {
      if (showAddForm) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // 2. Chuẩn bị params cho API
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('take', MOVIES_PER_PAGE.toString());
        params.append('status', 'all');

        // Thêm filter từ state
        if (appliedFilters.q) params.append('q', appliedFilters.q);
        if (appliedFilters.type && appliedFilters.type !== "Tất cả") {
            const typeValue = appliedFilters.type === 'Phim lẻ' ? 'phim-le' : (appliedFilters.type === 'Phim bộ' ? 'phim-bo' : appliedFilters.type);
            params.append("type", typeValue);
        }
        if (appliedFilters.genre && appliedFilters.genre.length > 0) {
            appliedFilters.genre.forEach(g => params.append('genre', g));
        }
        if (appliedFilters.country && appliedFilters.country !== "Tất cả") {
            params.append("country", appliedFilters.country);
        }
        if (appliedFilters.year && appliedFilters.year !== "Tất cả") {
            params.append("year", appliedFilters.year);
        }
        // Thêm search term
        if (searchTerm.trim()) {
            params.set('q', searchTerm.trim());
        }

        // 3. Gọi API
        const res = await apiClient.get('/movies/filter', { params });
        
        // 4. Cập nhật state từ response của API
        setMovies(res.data.data);
        setTotalPages(res.data.pagination.totalPages || 1);
        
        if (currentPage === 1 && res.data.data.length > 0) {
            setSelectedMovie(res.data.data[0]);
        } else if (res.data.data.length === 0) {
            setSelectedMovie(null);
        }

      } catch (err: unknown) {
        let message = "Đã xảy ra lỗi khi tải phim";
        if (err instanceof Error && err.message) {
          message = err.message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    // 5. Gọi hàm fetch
    fetchMovies();
    
    // 6. Cập nhật dependencies
  }, [showAddForm, appliedFilters, currentPage, searchTerm]);

const handleMarkMovieAsDeleted = (movieId: string) => {
    const newMovies = movies.map(m => {
        if (m.id.toString() === movieId) {
            return { ...m, is_deleted: true, is_active: false } as any;
        }
        return m; 
    });
    
    setMovies(newMovies);

    // Cập nhật phim đang chọn (nếu đang xem đúng phim vừa xóa)
    if (selectedMovie?.id.toString() === movieId) {
        setSelectedMovie(prev => prev ? ({ ...prev, is_deleted: true, is_active: false } as any) : null);
    }
};

  const renderContent = () => {
    if (loading) {
      return viewMode === "list" ? <MovieListSkeleton /> : <MovieGridSkeleton />;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500 bg-[#262626] border border-red-800 rounded-md">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>Lỗi: {error}</p>
        </div>
      );
    }

    if (movies.length === 0 && totalPages > 1 && currentPage > 1) {
       setCurrentPage(1); 
       return null;
    } else if (movies.length === 0) {
       return (
         <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-[#262626] border border-slate-800 rounded-md">
           <p>{searchTerm || appliedFilters.q ? `Không tìm thấy phim nào khớp.` : "Không tìm thấy phim nào trong kho."}</p>
         </div>
       );
    }

    return viewMode === "list" ? (
      <RenderListView movies={movies} onSelectMovie={setSelectedMovie} />
    ) : (
      <RenderGridView movies={movies} onSelectMovie={setSelectedMovie} />
    );
  };

  const toggleFilter = () => {
    if (showFilter) {
      setPendingFilters(appliedFilters);
    }
    setShowFilter(!showFilter);
  };

  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
      if (key === 'q') {
          setSearchTerm(value as string); 
      }
      setPendingFilters(prev => ({ ...prev, [key]: value }));
    };

  const handleSubmit = () => {
    setAppliedFilters({ ...pendingFilters, q: searchTerm || pendingFilters.q });
    setCurrentPage(1); 
    setShowFilter(true); 
  };

  const handleReset = () => {
    setPendingFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const sidebarTopOffset = "top-[calc(4rem+1.5rem)]";
  const sidebarHeight = "h-[calc(100vh-4rem-1.5rem-1.5rem)]";

  if (showAddForm) {
      return <AddMovieForm onClose={() => setShowAddForm(false)} />;
  }

  return (
    <div className="relative flex w-full">
      <main className="flex-1 overflow-y-auto lg:pr-[calc(theme(space.80)+theme(space.6))] xl:pr-[calc(theme(space.96)+theme(space.6))] 2xl:pr-[calc(450px+theme(space.6))]">
        <div className="pt-6 pb-6 px-6">
          <div className="flex flex-col md:flex-row justify-between items-top gap-4 mb-6">
            <h1 className="text-2xl font-bold text-white">Kho phim</h1>
            <div className="flex-1 w-full md:w-auto md:max-w-lg">
              <SearchBar
                placeholder="Tìm kiếm trong kho phim..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPendingFilters(prev => ({ ...prev, q: e.target.value }));
                }}
              />
            </div>

            <div className="flex items-top gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-white bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white"
                }
                aria-label="Chuyển sang chế độ danh sách"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-white bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white"
                }
                aria-label="Chuyển sang chế độ lưới"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowAddForm(true)} 
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm phim
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <Button
              onClick={toggleFilter}
              className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
            >
              <FilterIcon className="h-4 w-4" />
              Bộ lọc
            </Button>
          </div>

          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <FilterPanel
                  filters={pendingFilters}
                  onFilterChange={handleFilterChange}
                  onSubmit={handleSubmit}
                  onReset={handleReset}
                  genres={genres}
                  countries={countries}
                  isLoadingGenres={isLoadingFilterData}
                  isLoadingCountries={isLoadingFilterData}
                />
                <div className="h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="transition-all duration-300">
            {renderContent()}
          </div>

           {!loading && !error && totalPages > 1 && (
             <Pagination
               totalPages={totalPages}
               currentPage={currentPage}
               onPageChange={setCurrentPage}
             />
           )}
        </div>
      </main>

      {!showAddForm && (
        <aside className={`hidden lg:block fixed right-0 ${sidebarTopOffset} ${sidebarHeight} lg:w-80 xl:w-96 2xl:w-[450px] pr-6 pl-0 py-0 z-40`}>
          <div className="h-full overflow-hidden"> 
            <RenderPreviewCard 
              movie={selectedMovie}
              onMovieDeleted={handleMarkMovieAsDeleted}
              onEditMovie={handleGoToEditPage}
            />
          </div>

        </aside>
      )}
    </div>
  );
}