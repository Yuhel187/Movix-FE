import Link from "next/link";
import { Movie } from "@/types/movie";
import { MoveUp, MoveDown, Minus } from "lucide-react";

interface RankingItemProps {
    rank: number;
    movie: Movie;
    trend?: 'up' | 'down' | 'stable';
    count?: number;
    unit?: string;
}

export function RankingItem({ rank, movie, trend = 'stable', count, unit = "lượt xem" }: RankingItemProps) {
    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <MoveUp className="w-4 h-4 text-green-500" />;
            case 'down':
                return <MoveDown className="w-4 h-4 text-red-500" />;
            default:
                return <Minus className="w-4 h-4 text-gray-500" />;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return "text-yellow-500"; // Gold
            case 2:
                return "text-gray-300";   // Silver
            case 3:
                return "text-amber-700";  // Bronze
            default:
                return "text-gray-500 opacity-50";
        }
    };

    return (
        <Link href={`/movies/${movie.slug}`} className="group flex items-center gap-4 p-2 hover:bg-white/5 rounded-lg transition-colors">
            {/* Rank Number */}
            <div className={`w-8 text-3xl font-bold font-heading text-center ${getRankColor(rank)}`}>
                {rank}.
            </div>

            {/* Trend Icon */}
            <div className="flex items-center justify-center w-6">
                {getTrendIcon()}
            </div>

            {/* Poster */}
            <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden rounded-md border border-white/10 group-hover:border-primary transition-colors">
                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Info */}
            <div className="flex flex-col min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-primary truncate transition-colors">
                    {movie.title}
                </h3>
                {movie.subTitle && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                        {movie.subTitle}
                    </p>
                )}
                {(count !== undefined && count >= 0) && (
                    <p className="text-xs text-gray-500 mt-1">
                        {count.toLocaleString()} {unit}
                    </p>
                )}
            </div>
        </Link>
    );
}
