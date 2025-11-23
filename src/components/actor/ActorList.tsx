"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Person } from "@/types/person";

interface ActorListProps {
  people: Person[];
}

export default function ActorList({ people }: ActorListProps) {
  if (!people || people.length === 0) {
    return <div className="text-center text-gray-500 py-10">Không có dữ liệu.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {people.map((person) => (
        <Link href={`/peoples/${person.id}`} key={person.id} className="group">
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all duration-300">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-800">
              {person.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={person.avatarUrl}
                  alt={person.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-600">
                  <User size={48} />
                </div>
              )}
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 w-full p-3">
                 <p className="text-white font-semibold truncate text-sm md:text-base">
                    {person.name}
                 </p>
                 <p className="text-xs text-gray-400">
                    {person.role}
                 </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}