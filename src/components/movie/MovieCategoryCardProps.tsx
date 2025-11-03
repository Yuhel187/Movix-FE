"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  posterUrl: string;
}

interface MovieCategoryCardProps {
  category: string;
  movies: Movie[];
  onClickMore?: () => void;
}

export function MovieCategoryCard({ category, movies, onClickMore }: MovieCategoryCardProps) {
  return (
    <Card className="bg-[#1a1b1f] w-64 rounded-xl overflow-hidden h-85 gap-2 ml-5 ">
      <CardContent className="p-2 grid grid-cols-2 gap-2">
        {movies.slice(0, 4).map((movie) => (
          <img
            key={movie.id}
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-28 object-cover rounded-md"
          />
        ))}
      </CardContent>
      <CardHeader className="flex items-center justify-between px-3 py-2">
        <span className="text-gray-100 font-semibold">{category}</span>
        <ArrowRight className="w-4 h-4 text-gray-400 cursor-pointer" onClick={onClickMore} />
      </CardHeader>
    </Card>
  );
}
