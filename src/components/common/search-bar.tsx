import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchBarProps {
  placeholder?: string
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({ placeholder = "Tìm kiếm phim, diễn viên", value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="
          pl-10
          bg-[#1a1b1f]
          text-gray-100
          placeholder-gray-400
          border-0
          focus-visible:ring-0
          rounded-xl
          h-10 sm:h-12
          text-sm sm:text-base
          w-full
        "
      />
    </div>
  )
}
