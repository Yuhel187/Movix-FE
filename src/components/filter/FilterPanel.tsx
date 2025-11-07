"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"; 

type Genre = {
  id: string;
  name: string;
};
type Country = {
  id: string;
  name: string | null;
};

const types = ["Tất cả", "Phim lẻ", "Phim bộ"];
const ratings = ["Tất cả", "K (Dưới 13 tuổi)", "T13", "T16", "T18"];
const languages = ["Tất cả", "Phụ đề", "Lồng tiếng"];
const years = ["Tất cả", "2025", "2024", "2023", "2022", "2021", "2020","2019","2018","2017","2016"];

export interface FilterState {
  country: string;
  type: string;
  rating: string;
  genre: string[];
  language: string;
  year: string;
  q?: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | string[]) => void;
  onReset: () => void;
  onSubmit: () => void;
  
  genres: Genre[];
  countries: Country[];
  isLoadingGenres: boolean;
  isLoadingCountries: boolean;
}

export default function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  onSubmit,
  genres,
  countries,
  isLoadingGenres,
  isLoadingCountries
}: FilterPanelProps) {
  
  const [customYear, setCustomYear] = useState(() => 
    years.includes(filters.year) ? "" : filters.year
  );

  useEffect(() => {
    setCustomYear(years.includes(filters.year) ? "" : filters.year);
  }, [filters.year]);

  const handleSelectString = (key: keyof FilterState, value: string) => {
    onFilterChange(key, value); 
    if (key === "year") {
      setCustomYear(""); 
    }
  };

  const handleGenreToggle = (genreName: string) => {
    const currentGenres = filters.genre;
    if (genreName === "Tất cả") {
      onFilterChange("genre", []); 
      return;
    }

    const newGenres = currentGenres.includes(genreName)
      ? currentGenres.filter(g => g !== genreName)
      : [...currentGenres, genreName]; 
    
    onFilterChange("genre", newGenres);
  };

  const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomYear(value);
    if (value.trim().length === 4) {
      onFilterChange("year", value.trim());
    } else if (value.trim() === "") {
      onFilterChange("year", "Tất cả");
    }
  };

  const renderFilterSkeletons = (count = 5) => (
    Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-8 w-20 rounded-full bg-slate-700" />
    ))
  );

  return (
    <Card className="bg-[#121212] text-white shadow-none w-full">
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 font-medium text-white">Quốc gia</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.country === "Tất cả" ? "default" : "outline"}
              onClick={() => handleSelectString("country", "Tất cả")}
              className={`rounded-full ${
                filters.country === "Tất cả" ? "border border-green-600 bg-transparent" : " text-white bg-transparent"
              }`}
            >
              Tất cả
            </Button>
            {/* Logic render mới */}
            {isLoadingCountries ? renderFilterSkeletons(countries.length) : (
              countries.map(c => c.name && ( 
                <Button
                  key={c.id}
                  variant={filters.country === c.name ? "default" : "outline"}
                  onClick={() => handleSelectString("country", c.name!)} 
                  className={`rounded-full ${
                    filters.country === c.name ? "border border-green-600 bg-transparent" : " text-white bg-transparent"
                  }`}
                >
                  {c.name}
                </Button>
              ))
            )}
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
                onClick={() => handleSelectString("type", t)}
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
                onClick={() => handleSelectString("rating", t)}
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
            {/* Thêm nút "Tất cả" */}
             <Button
              variant={filters.genre.length === 0 ? "default" : "outline"}
              onClick={() => handleGenreToggle("Tất cả")} 
              className={`rounded-full ${
                filters.genre.length === 0 ? "border border-green-600 bg-transparent" : " text-white bg-transparent"
              }`}
            >
              Tất cả
            </Button>
            {isLoadingGenres ? renderFilterSkeletons(15) : (
              genres.map(g => (
                <Button
                  key={g.id}
                  variant={filters.genre.includes(g.name) ? "default" : "outline"} 
                  onClick={() => handleGenreToggle(g.name)}
                  className={`rounded-full ${
                    filters.genre.includes(g.name) ? "border border-green-600 bg-transparent" : " text-white bg-transparent"
                  }`}
                >
                  {g.name}
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Năm sản xuất*/}
        <div>
          <h3 className="mb-2 font-medium text-white">Năm sản xuất</h3>
          <div className="flex">
            <div className="flex flex-wrap gap-2">
            {years.map(y => (
              <Button
                key={y}
                variant={filters.year === y ? "default" : "outline"}
                onClick={() => handleSelectString("year", y)}
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
          <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700 text-white rounded-full">
            Lọc kết quả  →
          </Button>
          <Button onClick={onReset} variant="secondary" className="rounded-full bg-gray-700 text-white hover:bg-gray-600">
            Đặt lại
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}