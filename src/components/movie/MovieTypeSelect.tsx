"use client"

import * as React from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const movieTypes = [
  { value: "single", label: "Phim lẻ" },
  { value: "series", label: "Phim bộ" },
]

export function MovieTypeSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {

  const handleSelect = (val: string) => {
    onChange(val)
  }
  
  return (
    <div className="w-f">
      <div>
        <Select value={value} onValueChange={handleSelect}>
          <SelectTrigger className="w-full bg-[#0b0b0b] border border-slate-700 text-white rounded-lg">
            <SelectValue placeholder="Chọn loại phim" />
          </SelectTrigger>

          <SelectContent className="bg-[#0b0b0b] border border-slate-700 text-white">
            {movieTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
