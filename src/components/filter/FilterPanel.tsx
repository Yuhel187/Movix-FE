"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface FilterPanelProps {
  defaultType?: string
  defaultCountry?: string
}

const countries = ["Tất cả", "Anh", "Canada", "Hàn Quốc", "Mỹ", "Nhật Bản", "Pháp", "Trung Quốc", "Đài Loan", "Đức"]
const types = ["Tất cả", "Phim lẻ", "Phim bộ"]
const ratings = ["Tất cả", "K (Dưới 13 tuổi)", "T13", "T16", "T18"]
const genres = ["Tất cả", "Anime", "Hành động", "Tình cảm", "Kinh dị", "Hài", "Chiến tranh","Anime2", "Hành động2", "Tình cảm2", "Kinh dị2", "Hài2", "Chiến tranh2","Anime3", "Hành động3", "Tình cảm3", "Kinh dị3", "Hài3", "Chiến tranh3"]
const languages = ["Tất cả", "Phụ đề", "Lồng tiếng"]
const years = ["Tất cả", "2025", "2024", "2023", "2022", "2021", "2020","2019","2018","2017","2016"]

export default function FilterPanel({ defaultType = "Tất cả", defaultCountry = "Tất cả" }: FilterPanelProps) {
  const [filters, setFilters] = useState({
    country: defaultCountry,
    type: defaultType,
    rating: "Tất cả",
    genre: "Tất cả",
    language: "Tất cả",
    year: "Tất cả",
  })
  const [customYear, setCustomYear] = useState("")
  const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomYear(value)
    if (value.trim() !== "") {
      setFilters({ ...filters, year: "Tất cả" })
    }
  }
  const handleSelect = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
    if (key === "year") setCustomYear("")
  }

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      type: defaultType,
      country: defaultCountry,
    }))
  }, [defaultType, defaultCountry])

  return (
    <Card className="bg-[#121212] text-white shadow-none w-full">
      <CardContent className="space-y-6">
        {/* Quốc gia */}
        <div>
          <h3 className="mb-2 font-medium text-white">Quốc gia</h3>
          <div className="flex flex-wrap gap-2">
            {countries.map(c => (
              <Button
                key={c}
                variant={filters.country === c ? "default" : "outline"}
                onClick={() => handleSelect("country", c)}
                className={`rounded-full ${
                  filters.country === c ? "border border-green-600 bg-transparent" : " text-white bg-transparent"
                }`}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        {/* Loại phim */}
        <div>
          <h3 className="mb-2 font-medium text-white">Loại phim</h3>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <Button
                key={t}
                variant={filters.type === t ? "default" : "outline"}
                onClick={() => handleSelect("type", t)}
                className={`rounded-full ${
                  filters.type === t ? "border border-green-600 bg-transparent" : " text-white bg-transparent"
                }`}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        {/* Xếp hạng */}
        <div>
          <h3 className="mb-2 font-medium text-white">Xếp hạng</h3>
          <div className="flex flex-wrap gap-2">
            {ratings.map(t => (
              <Button
                key={t}
                variant={filters.rating === t ? "default" : "outline"}
                onClick={() => handleSelect("rating", t)}
                className={`rounded-full ${
                  filters.rating === t ? "border border-green-600 bg-transparent" : " text-white bg-transparent"
                }`}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        {/* Thể loại */}
        <div>
          <h3 className="mb-2 font-medium text-white">Thể loại</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map(g => (
              <Button
                key={g}
                variant={filters.genre === g ? "default" : "outline"}
                onClick={() => handleSelect("genre", g)}
                className={`rounded-full ${
                  filters.genre === g ? "border border-green-600 bg-transparent" : " text-white bg-transparent"
                }`}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        {/* Năm sản xuất */}
        <div>
          <h3 className="mb-2 font-medium text-white">Năm sản xuất</h3>
          <div className="flex">
            <div className="flex flex-wrap gap-2">
            {years.map(y => (
              <Button
                key={y}
                variant={filters.year === y ? "default" : "outline"}
                onClick={() => handleSelect("year", y)}
                className={`rounded-full ${
                  filters.year === y ? "border border-green-600 bg-transparent" : " text-white bg-transparent"
                }`}
              >
                {y}
              </Button>
            ))}
          </div>
          <div>
            <Input
              placeholder="Nhập năm..."
              className="w-40 bg-[#1a1a1a] text-white border-white ml-5"
              value={customYear}
              onChange={handleYearInput}
            />
          </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-4">
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full">
            Lọc kết quả  →
          </Button>
          <Button variant="secondary" className="rounded-full bg-gray-700 text-white hover:bg-gray-600">
            Đặt lại
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
