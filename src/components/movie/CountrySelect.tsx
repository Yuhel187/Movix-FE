"use client"

import * as React from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const countries = ["Anh", "Canada", "Hàn Quốc", "Hồng Kông", "Mỹ", "Nhật Bản", "Pháp", "Thái Lan", "Trung Quốc", "Úc", "Đài Loan", "Đức", "Việt Nam"]

export function CountrySelect(props: React.ComponentProps<typeof Select>) {
  return (
    <Select {...props}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        {countries.map((c) => (
          <SelectItem key={c} value={c.toLowerCase()}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}