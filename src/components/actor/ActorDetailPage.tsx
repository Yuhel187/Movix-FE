"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Briefcase, Film } from "lucide-react";
import type { Person } from "@/types/person";
import { Badge } from "@/components/ui/badge";

export default function ActorDetailPage({ person }: { person: Person }) {
  return (
    <div className="pt-24 pb-12 container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
            {person.avatarUrl ? (
              <Image
                src={person.avatarUrl}
                alt={person.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-gray-600">
                 <User size={64} />
              </div>
            )}
          </div>

          <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-5 space-y-4 border border-zinc-800">
            <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-2">
               Thông tin cá nhân
            </h3>
            <InfoRow icon={<Briefcase size={16}/>} label="Nghề nghiệp" value={person.role} />
            <InfoRow icon={<User size={16}/>} label="Giới tính" value={person.gender || "N/A"} />
            <InfoRow icon={<Calendar size={16}/>} label="Ngày sinh" value={person.birthday || "N/A"} />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{person.name}</h1>
            <Badge variant="outline" className="text-zinc-400 border-zinc-700">
               {person.role}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-red-600 rounded-full block"></span>
              Tiểu sử
            </h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {person.biography}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-red-600 rounded-full block"></span>
              Các phim đã tham gia
            </h2>
            
            {person.credits && person.credits.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {person.credits.map((movie) => (
                  <Link 
                    href={`/movies/${movie.slug}`} 
                    key={movie.id}
                    className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 border border-transparent hover:border-zinc-600 transition-all"
                  >
                    {movie.posterUrl ? (
                       <Image
                         src={movie.posterUrl}
                         alt={movie.title}
                         fill
                         className="object-cover group-hover:scale-105 transition-transform duration-500"
                       />
                    ) : (
                       <div className="flex items-center justify-center h-full w-full text-gray-600">
                          <Film size={32} />
                       </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <p className="text-white font-bold text-sm line-clamp-2">{movie.title}</p>
                      <p className="text-gray-300 text-xs mt-1 line-clamp-1 italic">{movie.roleName}</p>
                      <p className="text-red-500 text-xs font-bold mt-1">{movie.year}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Chưa có thông tin phim tham gia.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-center gap-3 group">
    <div className="text-zinc-500 group-hover:text-red-500 transition-colors">{icon}</div>
    <div>
      <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-sm text-gray-200 font-medium">{value}</p>
    </div>
  </div>
);