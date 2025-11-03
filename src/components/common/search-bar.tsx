import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchBarProps {
  placeholder?: string; 
}

export function SearchBar({ placeholder = "Tìm kiếm phim, diễn viên" }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder} 
        className="pl-10 bg-[#1a1b1f] text-gray-100 placeholder-gray-400 border-0 focus-visible:ring-0 rounded-xl h-10 w-80"
      />
    </div>
  );
}