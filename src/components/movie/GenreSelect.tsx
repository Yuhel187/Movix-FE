"use client"

import * as React from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

// Danh sách thể loại phim (có thể lấy từ DB sau này)
const genres = [
  "Hành động",
  "Tình cảm",
  "Kinh dị",
  "Hài",
  "Tâm lý",
  "Hoạt hình",
  "Phiêu lưu",
  "Khoa học viễn tưởng",
  "Tài liệu",
]

export function GenreSelect() {
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([])

  const addGenre = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  const removeGenre = (index: number) => {
    const updated = [...selectedGenres]
    updated.splice(index, 1)
    setSelectedGenres(updated)
  }

  return (
    <div className="mt-6">
      <label className="text-sm text-slate-300">Thể loại phim</label>

      {/* Hiển thị danh sách tag */}
      <div className="mt-3 flex flex-wrap gap-2">
        {selectedGenres.map((genre, i) => (
          <div
            key={genre}
            className="flex items-center gap-2 bg-[#1f2937] text-white rounded-full px-3 py-1"
          >
            <span className="text-sm">{genre}</span>
            <button
              onClick={() => removeGenre(i)}
              className="text-xs opacity-70 hover:opacity-100"
              aria-label={`Remove tag ${genre}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Dropdown chọn thể loại */}
      <div className="mt-4">
        <Select
          onValueChange={(value) => addGenre(value)}
        >
          <SelectTrigger className="w-full bg-[#0b0b0b] border border-slate-700 text-white rounded-lg">
            <SelectValue placeholder="Chọn thể loại phim" />
          </SelectTrigger>

          <SelectContent className="bg-[#0b0b0b] border border-slate-700 text-white">
            {genres
              .filter((g) => !selectedGenres.includes(g))
              .map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
