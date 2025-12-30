import { LucideIcon } from "lucide-react";
import { Movie } from "@/types/movie";
import { RankingItem } from "./RankingItem";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RankingListProps {
    title: string;
    icon: LucideIcon;
    movies: Movie[];
    color?: string; // Optional accent color class
    valueKey?: keyof Movie;
    unit?: string;
}

export function RankingList({ title, icon: Icon, movies, color = "text-yellow-500", valueKey = "views", unit = "lượt xem" }: RankingListProps) {
    // Only take top 5 for the list display
    const topMovies = movies.slice(0, 5);

    const getValue = (movie: Movie) => {
        const val = movie[valueKey];
        return typeof val === 'number' ? val : 0;
    };

    return (
        <div className="flex flex-col h-full bg-white/5 rounded-2xl p-6 border border-white/10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Icon className={`w-6 h-6 ${color}`} />
                <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                    {title}
                </h2>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2 flex-grow">
                {topMovies.map((movie, index) => (
                    <RankingItem
                        key={movie.id}
                        rank={index + 1}
                        movie={movie}
                        trend={(movie as any).trend || 'stable'}
                        count={getValue(movie)}
                        unit={unit}
                    />
                ))}

                {movies.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        Chưa có dữ liệu
                    </div>
                )}
            </div>

            {/* Footer / See More */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="text-sm text-gray-400 hover:text-primary transition-colors inline-flex items-center gap-1">
                            Xem thêm
                        </button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold uppercase tracking-wider text-white">
                                <Icon className={`w-6 h-6 ${color}`} />
                                Top 10 {title}
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-4 mt-4">
                            <div className="flex flex-col gap-2">
                                {movies.slice(0, 10).map((movie, index) => (
                                    <RankingItem
                                        key={movie.id}
                                        rank={index + 1}
                                        movie={movie}
                                        trend={(movie as any).trend || 'stable'}
                                        count={getValue(movie)}
                                        unit={unit}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
