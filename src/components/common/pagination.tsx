"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ totalPages, currentPage, onPageChange }: PaginationProps) {
  const handlePrev = () => {
    onPageChange(Math.max(currentPage - 1, 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(currentPage + 1, totalPages));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      onPageChange(val);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 py-10">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="rounded-full bg-[#2b2d3a] hover:bg-[#3a3d4e] text-gray-300"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-3 bg-[#2b2d3a] px-6 py-3 rounded-full">
        <span className="text-gray-300">Trang</span>
        <Input
          value={currentPage}
          onChange={handleInputChange}
          className="w-12 text-center bg-transparent border border-gray-500 text-white focus-visible:ring-0 focus-visible:border-gray-400"
        />
        <span className="text-gray-400">/ {totalPages}</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="rounded-full bg-[#2b2d3a] hover:bg-[#3a3d4e] text-gray-300"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
