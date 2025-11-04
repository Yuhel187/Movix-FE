import { MovieSearchCard } from "@/components/movie/MovieSearchCard"
import { PersonSearchCard, PersonSearchResult } from "@/components/common/PersonSearchCard"
import { Skeleton } from "@/components/ui/skeleton"
import { X } from "lucide-react"

export type MovieSearchResult = {
  id: string | number;
  slug: string;
  title: string
  original_title?: string
  poster_url: string;      
}

export type ApiSearchResult = {
  movies: MovieSearchResult[];
  people: PersonSearchResult[];
}

interface SearchResultDropdownProps {
  results: ApiSearchResult; 
  isLoading: boolean;
  onClose: () => void;
  onMovieClick: (slug: string) => void;
  onPersonClick: (personId: string | number) => void;
}

export function SearchResultDropdown({ 
  results, 
  isLoading, 
  onClose, 
  onMovieClick, 
  onPersonClick 
}: SearchResultDropdownProps) {
  
  const hasMovies = results.movies && results.movies.length > 0;
  const hasPeople = results.people && results.people.length > 0;
  const noResults = !hasMovies && !hasPeople;

  const handleMovieClick = (slug: string) => {
    onMovieClick(slug);
    onClose();
  }
  
  const handlePersonClick = (personId: string | number) => {
    onPersonClick(personId);
    onClose();
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 w-full bg-[#2b2b2b] border border-zinc-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto no-scrollbar">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-semibold text-gray-300">Danh sách phim</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <>
              <Skeleton className="w-full h-[96px] bg-zinc-700" />
              <Skeleton className="w-full h-[96px] bg-zinc-700" />
            </>
          ) : (
            <>
              {results.movies.map((movie) => (
                <MovieSearchCard
                  key={`movie-${movie.id}`}
                  slug={movie.slug}
                  title={movie.title}
                  subTitle={movie.original_title}
                  imageUrl={movie.poster_url}
                  onClick={handleMovieClick}
                />
              ))}
              {results.people.map((person) => (
                <PersonSearchCard
                  key={`person-${person.id}`}
                  person={person}
                  onClick={handlePersonClick}
                />
              ))}

              {noResults && (
                <p className="text-gray-400 text-center py-4">Không tìm thấy kết quả.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}