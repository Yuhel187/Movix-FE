"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ActorCard } from "@/components/movie/ActorCard"; 
import { Pagination } from "@/components/common/pagination";
import { Actor } from "@/types/actor"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

interface ActorPageProps {
  allActors: Actor[]; 
  isLoading?: boolean;
}

const ACTORS_PER_PAGE = 24;

export default function ActorListPage({ allActors, isLoading }: ActorPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredActors = useMemo(() => {
    return allActors.filter((actor) =>
      actor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allActors, searchTerm]);

  const totalPages = Math.ceil(filteredActors.length / ACTORS_PER_PAGE);
  const currentActors = filteredActors.slice(
    (currentPage - 1) * ACTORS_PER_PAGE,
    currentPage * ACTORS_PER_PAGE
  );

  const handleActorClick = (actorId: string | number) => {
    router.push(`/peoples/${actorId}`);
  };

  const ActorSkeleton = () => (
    <div className="flex flex-col items-center space-y-2">
      <Skeleton className="w-full aspect-[2/3] rounded-md bg-slate-700" />
      <Skeleton className="h-4 w-20 bg-slate-700" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 pb-12 text-white">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Diễn viên</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-6 gap-y-8">
          {Array.from({ length: ACTORS_PER_PAGE }).map((_, i) => (
            <ActorSkeleton key={i} />
          ))}
        </div>
      ) : currentActors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 text-gray-400">
          <Users className="w-16 h-16" />
          <p className="mt-4 text-lg">Không tìm thấy diễn viên nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-6 gap-y-8">
          {currentActors.map((actor) => (
            <div
              key={actor.id}
              className="cursor-pointer transition-transform duration-300 hover:scale-105 hover:opacity-80"
              onClick={() => handleActorClick(actor.id)}
            >
              <ActorCard
                name={actor.name}
                profileUrl={actor.profileUrl}
                imageUrl={actor.imageUrl}
                avatar_url={actor.avatar_url}
                layout="vertical"
              />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredActors.length > ACTORS_PER_PAGE && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}