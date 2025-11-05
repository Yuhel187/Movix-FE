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
  const [selectedType, setSelectedType] = React.useState<string>(value)

  const handleSelect = (val: string) => {
    setSelectedType(val)
    onChange(val)
  }

  const clearType = () => {
    setSelectedType("")
    onChange("")
  }

  return (
    <div className="w-f">
      <div>
        <Select onValueChange={handleSelect}>
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
