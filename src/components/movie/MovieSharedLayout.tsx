import MovieCast from "@/components/movie/MovieCast";
import { MovieCommentSection } from "@/components/comment/MovieCommentSection";
import { MovieDetailSidebar } from "@/components/movie/MovieDetailSlidebar";
import type { Actor } from "@/types/actor";
import type { SidebarData } from "@/services/movie.service"; 

interface MovieSharedLayoutProps {
  castData: Actor[];
  sidebarData: SidebarData;
}

export default function MovieSharedLayout({ castData, sidebarData }: MovieSharedLayoutProps) {
  return (
    <div className="relative z-10 bg-black px-[7rem] py-12">
      <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
        <div className="flex flex-1 flex-col gap-12">
          <MovieCast cast={castData} />
          <MovieCommentSection />
        </div>
        <div className="w-full lg:w-auto">
          <MovieDetailSidebar {...sidebarData} />
        </div>

      </div>
    </div>
  );
}