"use client"

import * as React from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const genres = ["Action", "Comedy", "Drama", "Horror", "Romance"]

export function GenreSelect(props: React.ComponentProps<typeof Select>) {
  return (
    <Select {...props}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select genre" />
      </SelectTrigger>
      <SelectContent>
        {genres.map((g) => (
          <SelectItem key={g} value={g.toLowerCase()}>
            {g}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
