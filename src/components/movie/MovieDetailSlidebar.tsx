import {
  Calendar,
  Globe,
  Star,
  LayoutGrid,
  User,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "./StarRating";
import type { Director } from "@/types/director";

interface MovieDetailSidebarProps {
  releaseYear: number | string;
  languages: string[];
  ratings: {
    imdb: number;
    movix: number;
  };
  genres: string[];
  director: Director;
  duration?: string;
}

// Component con để tạo các mục
const DetailSection = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-gray-400">
      {icon}
      <h3 className="text-sm font-medium uppercase tracking-wider whitespace-nowrap">{title}</h3>
    </div>
    <div>{children}</div>
  </div>
);

export function MovieDetailSidebar({
  releaseYear,
  languages,
  ratings,
  genres,
  director,
  duration,
}: MovieDetailSidebarProps) {
  return (
    <aside className="w-full max-w-sm space-y-8 rounded-lg bg-zinc-900/50 p-6 text-white">
      {/* Năm ra mắt */}
      <DetailSection icon={<Calendar size={18} />} title="Năm ra mắt">
        <p className="text-lg font-semibold text-white">{releaseYear}</p>
      </DetailSection>

      <DetailSection icon={<Clock size={18} />} title="Thời lượng">
        <p className="text-lg font-semibold text-white">{duration || "N/A"}</p>
      </DetailSection>


      {/* Ngôn ngữ */}
      <DetailSection icon={<Globe size={18} />} title="Available Languages">
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <Badge
              key={lang}
              variant="outline"
              className="bg-zinc-700/50 border-zinc-600 text-gray-200 px-3 py-1"
            >
              {lang}
            </Badge>
          ))}
        </div>
      </DetailSection>

      {/* Đánh giá */}
      <DetailSection icon={<Star size={18} />} title="Đánh giá">
        <div className="grid grid-cols-2 gap-4">
          {/* Box IMDb */}
          <div className="rounded-md bg-zinc-800/60 p-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-300">IMDb</span>
              <div className="flex items-center gap-2">
                <StarRating rating={ratings.imdb / 2} size={18} />
                <span className="font-semibold">{ratings.imdb.toFixed(1)}</span>
              </div>
            </div>
          </div>
          {/* Box Movix */}
          <div className="rounded-md bg-zinc-800/60 p-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-300">Movix</span>
              <div className="flex items-center gap-2">
                <StarRating rating={ratings.movix / 2} size={18} />
                <span className="font-semibold">{ratings.movix.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </DetailSection>

      {/* Thể loại */}
      <DetailSection icon={<LayoutGrid size={18} />} title="Thể loại">
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Badge
              key={genre}
              variant="outline"
              className="bg-zinc-700/50 border-zinc-600 text-gray-200 px-3 py-1"
            >
              {genre}
            </Badge>
          ))}
        </div>
      </DetailSection>

      {/* Đạo diễn */}
      <DetailSection icon={<User size={18} />} title="Đạo diễn">
        <div className="flex items-center gap-3 rounded-md bg-zinc-800/60 p-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={director.avatarUrl} alt={director.name} />
            <AvatarFallback>
              {director.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-white">{director.name}</p>
            <p className="text-sm text-gray-400">{director.origin}</p>
          </div>
        </div>
      </DetailSection>
    </aside>
  );
}