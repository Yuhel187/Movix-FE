import { User } from "lucide-react";

export interface PersonSearchResult {
  id: string | number;
  name: string;
  avatar_url?: string; 
}

interface PersonSearchCardProps {
  person: PersonSearchResult;
  onClick: (personId: string | number) => void;
}

export function PersonSearchCard({ person, onClick }: PersonSearchCardProps) {
  return (
    <div 
      className="flex items-center gap-4 cursor-pointer hover:bg-[#3a3a3a] p-2 rounded-md transition-colors duration-150"
      onClick={() => onClick(person.id)}
    >
      {person.avatar_url ? (
        <img src={person.avatar_url} alt={person.name} className="w-12 h-16 md:w-16 md:h-20 rounded-md object-cover flex-shrink-0 bg-zinc-700" />
      ) : (
        <div className="w-12 h-16 md:w-16 md:h-20 rounded-md bg-zinc-700 flex items-center justify-center flex-shrink-0">
          <User className="w-10 h-10 text-gray-400" />
        </div>
      )}
      <div className="flex flex-col gap-0.5 min-w-0">
        <h3 className="text-base font-semibold truncate text-white">{person.name}</h3>
        <p className="text-sm text-gray-400 mt-1">Diễn viên / Đạo diễn</p>
      </div>
    </div>
  )
}