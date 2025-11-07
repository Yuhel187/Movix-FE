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
  ArrowRight,
  MoreHorizontal,
  AlertCircle,
  Filter as FilterIcon,
} from "lucide-react";
import type { Movie } from "@/types/movie";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { MovieCard } from "@/components/movie/MovieCard";

const baseMockMovies: Movie[] = [
    {
      id: 1,
      title: "Morbius",
      posterUrl: "https://image.tmdb.org/t/p/w500/6JjfSchsU6daXk2AKX8EEBjO3Fm.jpg",
      year: 2022,
      type: "Phim lẻ",
      tags: ["Hành động", "Phiêu lưu"],
      duration: "1h 44m",
      views: 1200000,
    },
    {
      id: 2,
      title: "John Wick 4",
      posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
      year: 2023,
      type: "Phim lẻ",
      tags: ["Hành động", "Tội phạm"],
      duration: "2h 49m",
      views: 8900000,
    },
    {
      id: 3,
      title: "Demon Slayer: Mugen Train",
      posterUrl: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg",
      year: 2020,
      type: "Anime Movie",
      tags: ["Anime", "Hành động"],
      duration: "1h 57m",
      views: 7600000,
    },
    {
      id: 4,
      title: "Interstellar",
      posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      year: 2014,
      type: "Phim lẻ",
      tags: ["Sci-Fi", "Phiêu lưu"],
      duration: "2h 49m",
      views: 10400000,
    },
    {
      id: 5,
      title: "Avengers: Endgame",
      posterUrl: "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
      year: 2019,
      type: "Phim lẻ",
      tags: ["Hành động", "Sci-Fi"],
      duration: "3h 2m",
      views: 12000000,
    },
    {
      id: 6,
      title: "Pathaan",
      posterUrl: "https://image.tmdb.org/t/p/w500/sKDSGvdBL2trg0i2dsD0WDF2c9s.jpg",
      year: 2023,
      type: "Phim lẻ",
      tags: ["Hành động", "Hồi hộp"],
      duration: "2h 26m",
      views: 5500000,
    },
    {
      id: 7,
      title: "The Mother",
      posterUrl: "https://image.tmdb.org/t/p/w500/vnG3oKR0m8iCVnS1uG2T33jLCaD.jpg",
      year: 2023,
      type: "Phim lẻ",
      tags: ["Hành động", "Hồi hộp"],
      duration: "1h 56m",
      views: 4300000,
    },
    {
      id: 8,
      title: "Spider-Man: No Way Home",
      posterUrl: "https://image.tmdb.org/t/p/w500/uJYYizSuA9Y3DCs0qS4qWvHfZg4.jpg",
      year: 2021,
      type: "Phim lẻ",
      tags: ["Hành động", "Phiêu lưu", "Sci-Fi"],
      duration: "2h 28m",
      views: 15000000,
    },
    {
      id: 9,
      title: "Dune",
      posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
      year: 2021,
      type: "Phim lẻ",
      tags: ["Sci-Fi", "Phiêu lưu"],
      duration: "2h 35m",
      views: 9800000,
    },
     {
      id: 10,
      title: "The Batman",
      posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
      year: 2022,
      type: "Phim lẻ",
      tags: ["Hành động", "Tội phạm", "Drama"],
      duration: "2h 56m",
      views: 11000000,
    },
  ];


const mockMovies: Movie[] = Array.from({ length: 4 }, (_, i) =>
  baseMockMovies.map((movie, j) => ({
    ...movie,
    id: `${i}-${j}-${movie.id}`,
    title: `${movie.title} ${i > 0 ? i + 1 : ''}`.trim()
  }))
).flat();

async function fetchMoviesFromDatabase(): Promise<Movie[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMovies);
    }, 1000);
  });
}

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

const RenderPreviewCard = ({ movie }: { movie: Movie | null }) => {
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

  return (
    <Card className="bg-[#262626] border-slate-800 text-white p-4 h-full">
      <CardContent className="p-0">
        <div className="max-w-xs mx-auto">
          <div className="aspect-[2/3] relative w-full rounded-md overflow-hidden bg-slate-800">
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 320px, (max-width: 1536px) 384px, 450px"
            />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-center mt-4">{movie.title}</h2>

        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" className="flex-1 border-slate-700 bg-primary hover:bg-slate-800">
            Đi tới <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="default" className="flex-1 bg-primary hover:bg-primary/90">
            Chi tiết
          </Button>
        </div>

        <div className="border-t border-slate-700 my-6"></div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="bg-amber-600 border-amber-600 text-white hover:bg-amber-700 hover:text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa thông tin
          </Button>
          <Button variant="destructive">
            <Trash className="h-4 w-4 mr-2" />
            Xóa phim
          </Button>
        </div>
      </CardContent>
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
        <div key={movie.id} className="relative cursor-pointer text-center">
          <MovieCard
            movie={movie}
            onDetail={handleAction}
            onWatch={handleAction}
          />
          <div
            className="absolute inset-0 z-10"
            onClick={() => onSelectMovie(movie)}
            aria-label={`Select ${movie.title}`}
          />
        </div>
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
                  src={movie.posterUrl}
                  alt={movie.title}
                  width={40}
                  height={56}
                  className="w-10 h-14 object-cover rounded-md bg-slate-800"
                />
                <span className="truncate w-40">{movie.title}</span>
              </div>
            </TableCell>
            <TableCell className="text-gray-300">
              {movie.tags?.slice(0, 2).join(", ")}
            </TableCell>
            <TableCell className="text-gray-300">{movie.type}</TableCell>
            <TableCell className="text-gray-300">{movie.year}</TableCell>
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFilter, setShowFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingFilterData, setIsLoadingFilterData] = useState(true);
  const [pendingFilters, setPendingFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);

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
    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentPage(1);

        const data = await fetchMoviesFromDatabase();

        setMovies(data);
        if (data.length > 0) {
          setSelectedMovie(data[0]);
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

    if (!showAddForm) {
        loadMovies();
    } else {
        setLoading(false); 
    }
  }, [showAddForm]);

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !appliedFilters.type || appliedFilters.type === "Tất cả" || movie.type === appliedFilters.type;
    const matchesCountry = !appliedFilters.country || appliedFilters.country === "Tất cả" || movie.country === appliedFilters.country;
    const matchesGenre = appliedFilters.genre.length === 0 
      || (movie.tags?.some(tag => appliedFilters.genre.includes(tag)) ?? false);
    const matchesYear = !appliedFilters.year || appliedFilters.year === "Tất cả" || movie.year?.toString() === appliedFilters.year;

    return matchesSearch && matchesType && matchesCountry && matchesGenre && matchesYear;
  });

  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
  const indexOfLastMovie = currentPage * MOVIES_PER_PAGE;
  const indexOfFirstMovie = indexOfLastMovie - MOVIES_PER_PAGE;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);

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

    if (currentMovies.length === 0 && filteredMovies.length > 0) {
       setCurrentPage(1);
       return null;
    } else if (filteredMovies.length === 0) {
       return (
         <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-[#262626] border border-slate-800 rounded-md">
           <p>{searchTerm ? `Không tìm thấy phim nào khớp với "${searchTerm}".` : "Không tìm thấy phim nào trong kho."}</p>
         </div>
       );
    }


    return viewMode === "list" ? (
      <RenderListView movies={currentMovies} onSelectMovie={setSelectedMovie} />
    ) : (
      <RenderGridView movies={currentMovies} onSelectMovie={setSelectedMovie} />
    );
  };

  const toggleFilter = () => {
    if (showFilter) {
      setPendingFilters(appliedFilters);
    }
    setShowFilter(!showFilter);
  };

  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    setPendingFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setAppliedFilters(pendingFilters); 
    setCurrentPage(1); 
    setShowFilter(true); 
  };

  const handleReset = () => {
    setPendingFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
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
                  setCurrentPage(1);
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

           {!loading && !error && filteredMovies.length > MOVIES_PER_PAGE && (
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
                <div className="h-full overflow-y-auto no-scrollbar">
                <RenderPreviewCard movie={selectedMovie} />
                </div>
            </aside>
        )}

      <aside className={`hidden lg:block fixed right-0 ${sidebarTopOffset} ${sidebarHeight} lg:w-80 xl:w-96 2xl:w-[450px] pr-6 pl-0 py-0 z-40`}>
        <div className="h-full overflow-y-auto no-scrollbar">
          <RenderPreviewCard movie={selectedMovie} />
        </div>
      </aside>
    </div>
  );
}