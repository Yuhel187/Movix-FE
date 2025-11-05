"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, Trash } from "lucide-react";

import { cn } from "@/lib/utils"; 
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Genre {
  id: string;
  name: string;
}

interface GenreComboboxProps {
  allGenres: Genre[]; 
  selectedGenres: Genre[]; 
  onChange: (selected: Genre[]) => void; 
  onCreate: (name: string) => void; 
  onDelete: (id: string) => void; 
  
  className?: string;
}

export function GenreCombobox({
  allGenres,
  selectedGenres,
  onChange,
  onCreate,
  onDelete,
  className,
}: GenreComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Xử lý khi chọn/bỏ chọn một thể loại
  const handleSelect = (genre: Genre) => {
    const isSelected = selectedGenres.some((g) => g.id === genre.id);
    if (isSelected) {
      onChange(selectedGenres.filter((g) => g.id !== genre.id));
    } else {
      onChange([...selectedGenres, genre]);
    }
    setOpen(false); 
  };


  const handleCreate = () => {
    const name = searchQuery.trim();
    if (name) {
      onCreate(name);
      setSearchQuery(""); 
    }
  };

  // Xử lý khi nhấn nút "Xóa" (khỏi CSDL)
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Ngăn popover đóng lại
    if (window.confirm("Bạn có chắc muốn xóa vĩnh viễn thể loại này khỏi CSDL?")) {
      onDelete(id);
    }
  };

  // Tìm xem thể loại đang tìm kiếm đã có trong CSDL chưa
  const searchResultExists = allGenres.some(
    (g) => g.name.toLowerCase() === searchQuery.toLowerCase().trim()
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* 1. Popover Trigger (Nút chính) */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 bg-[#0b0b0b] border-primary text-white hover:text-white hover:bg-[#1f1f1f]"
          >
            {selectedGenres.length > 0
              ? `${selectedGenres.length} thể loại đã chọn`
              : "Chọn thể loại..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        {/* 2. Nội dung Popover (Dropdown + Tìm kiếm) */}
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#1a1b1f] border-slate-700 text-black">
          <Command>
            <CommandInput
              placeholder="Tìm thể loại..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-0 focus:ring-0"
            />
            <CommandList>
              <CommandEmpty asChild>
                {/* Khi không tìm thấy kết quả */}
                {searchQuery.trim() && !searchResultExists ? (
                  <Button
                    onClick={handleCreate}
                    className="w-[calc(100%-1rem)] m-2 bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Thêm thể loại mới: &quot;{searchQuery}&quot;
                  </Button>
                ) : (
                  <span className="p-4 text-sm text-slate-400">
                    Không tìm thấy thể loại.
                  </span>
                )}
              </CommandEmpty>

              {/* Nhóm: Các thể loại đã chọn */}
              {selectedGenres.length > 0 && (
                <CommandGroup heading="Đã chọn">
                  {selectedGenres.map((genre) => (
                    <CommandItem
                      key={genre.id}
                      value={genre.name}
                      onSelect={() => handleSelect(genre)}
                      className="text-black aria-selected:bg-primary/80"
                    >
                      <Check className={cn("mr-2 h-4 w-4 opacity-100")} />
                      {genre.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              <CommandSeparator className="bg-slate-700" />

              {/* Nhóm: Tất cả thể loại */}
              <CommandGroup heading="Tất cả thể loại (CSDL)">
                {allGenres
                  .filter(
                    (g) =>
                      !selectedGenres.some((selected) => selected.id === g.id)
                  ) 
                  .map((genre) => (
                    <CommandItem
                      key={genre.id}
                      value={genre.name}
                      onSelect={() => handleSelect(genre)}
                      className="text-black flex justify-between aria-selected:bg-primary/80"
                    >
                      <div className="flex items-center">
                        <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                        {genre.name}
                      </div>
                      
                      {/* NÚT XÓA KHỎI CSDL */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 text-slate-500 hover:bg-rose-900 hover:text-rose-400"
                        onClick={(e) => handleDelete(e, genre.id)}
                      >
                          <Trash className="h-3 w-3" />
                      </Button>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 3. Hiển thị các tag đã chọn bên dưới */}
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedGenres.map((genre) => (
          <span
            key={genre.id}
            className="flex items-center bg-slate-700 text-white text-sm font-medium px-3 py-1 rounded-full"
          >
            {genre.name}
            <button
              onClick={() => handleSelect(genre)} 
              className="ml-2 text-slate-400 hover:text-black"
            >
              <Trash className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}