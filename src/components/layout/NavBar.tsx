'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Search, Bell, ChevronDown, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SearchResultDropdown, ApiSearchResult } from '@/components/common/SearchResultDropdown';
import api from '@/lib/apiClient'; 

type Genre = { id: string; name: string };
type Country = { id: string; name: string | null };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Custom hook để debounce giá trị
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};


const Navbar = () => {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('Phim hay');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  const [searchResults, setSearchResults] = useState<ApiSearchResult>({ movies: [], people: [] });
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const navItems = ['Chủ đề', 'Phim hay', 'Thể loại', 'Phim lẻ', 'Phim bộ', 'Quốc gia', 'Diễn viên'];

  useEffect(() => {
    if (!API_URL) return;
    Promise.all([
      fetch(`${API_URL}/genres`).then(res => res.json()).catch(() => []),
      fetch(`${API_URL}/countries`).then(res => res.json()).catch(() => []),
    ]).then(([genres, countries]) => {
      setGenres(genres);
      setCountries(countries);
    });
  }, []);

  useEffect(() => {
    if (debouncedSearchText) {
      setIsSearchLoading(true);
      setIsDropdownOpen(true);

      api.get(`/movies/search?q=${debouncedSearchText}`)
        .then(res => {
          setSearchResults(res.data);
        })
        .catch(err => {
          console.error("Lỗi tìm kiếm:", err);
          setSearchResults({ movies: [], people: [] });
        })
        .finally(() => {
          setIsSearchLoading(false);
        });

    } else {
      setIsDropdownOpen(false);
      setSearchResults({ movies: [], people: [] });
      setIsSearchLoading(false);
    }
  }, [debouncedSearchText]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigate = (type: 'genre' | 'country', value: string) => {
    router.push(`/filter?${type}=${encodeURIComponent(value)}`);
    setIsMenuOpen(false);
  };

  const handleClickNavItem = (item: string) => {
    setActiveItem(item);
    if (item === 'Phim lẻ') {
      router.push('/filter?type=phim-le');
    } else if (item === 'Phim bộ') {
      router.push('/filter?type=phim-bo');
    }
  };

  const handleMovieResultClick = (slug: string) => {
    router.push(`/movies/${slug}`);
    setIsDropdownOpen(false);
    setSearchText("");
  };

  const handlePersonResultClick = (personId: string | number) => {
    alert(`Đã click vào Person ID: ${personId}. (Cài đặt trang chi tiết sau)`);
    setIsDropdownOpen(false);
    setSearchText("");
  };


  const renderDropdownItems = (item: string) => {
    if (item === 'Thể loại') {
      if (!genres.length) return <DropdownMenuItem disabled>Đang tải...</DropdownMenuItem>;
      return genres.map((g) => (
        <DropdownMenuItem key={g.id} onClick={() => handleNavigate('genre', g.name)}>
          {g.name}
        </DropdownMenuItem>
      ));
    }
    if (item === 'Quốc gia') {
      if (!countries.length) return <DropdownMenuItem disabled>Đang tải...</DropdownMenuItem>;
      return countries.map((c) => (
        <DropdownMenuItem key={c.id} onClick={() => handleNavigate('country', c.name || '')}>
          {c.name}
        </DropdownMenuItem>
      ));
    }
    return null;
  };

  const renderNavItem = (item: string) => {
    const isActive = activeItem === item;
    const commonClasses = "px-4 py-2 text-sm rounded-md transition-colors duration-200";
    const activeClasses = "bg-black text-white";
    const inactiveClasses = "text-gray-400 hover:text-white hover:bg-transparent";

    if (item === 'Thể loại' || item === 'Quốc gia') {
      return (
        <DropdownMenu key={item}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
              onClick={() => setActiveItem(item)}
            >
              {item} <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1A1A1A] text-white border-gray-700 max-h-64 overflow-y-auto">
            {renderDropdownItems(item)}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <button
        key={item}
        type="button"
        className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
        onClick={() => handleClickNavItem(item)}
      >
        {item}
      </button>
    );
  };

  return (
    <>
      <nav className="bg-[#0F0F0F] text-white flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center space-x-4 md:space-x-8">
          {/* Logo */}
          <Link href="/movies" className="flex items-center space-x-2 hover:opacity-80 transition">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.34292 21.7071C5.56187 22.4882 4.29521 22.4882 3.51416 21.7071C2.73311 20.9261 2.73311 19.6594 3.51416 18.8784L12.0001 10.3924L20.4859 18.8784C21.267 19.6594 21.267 20.9261 20.4859 21.7071C19.7049 22.4882 18.4382 22.4882 17.6572 21.7071L12.0001 16.05L6.34292 21.7071Z" fill="#E50914" />
              <path d="M3.51416 5.12164C4.29521 4.34059 5.56187 4.34059 6.34292 5.12164L12.0001 10.7788L17.6572 5.12164C18.4382 4.34059 19.7049 4.34059 20.4859 5.12164C21.267 5.90269 21.267 7.16935 20.4859 7.9504L12.0001 16.4363L3.51416 7.9504C2.73311 7.16935 2.73311 5.90269 3.51416 5.12164Z" fill="#E50914" />
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#E50914" />
            </svg>
            <span className="text-xl md:text-2xl font-bold">Movix</span>
          </Link>

          {/* Navigation Links  */}
          <div className="hidden md:flex items-center bg-[#1A1A1A] rounded-lg px-2 py-1">
            {navItems.map(item => renderNavItem(item))}
          </div>
        </div>

        {/* Right Section  */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative flex items-center" ref={searchContainerRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Tìm kiếm phim, diễn viên..."
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md pl-11 pr-9 h-10 w-72 text-sm font-normal text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none relative z-0"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Hiển thị Dropdown kết quả */}
            {isDropdownOpen && (searchText.length > 0) && (
              <SearchResultDropdown
                results={searchResults}
                isLoading={isSearchLoading}
                onClose={() => setIsDropdownOpen(false)}
                onMovieClick={handleMovieResultClick}
                onPersonClick={handlePersonResultClick}
              />
            )}
          </div>
          {/* === KẾT THÚC KHUNG TÌM KIẾM === */}


          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center cursor-pointer">
                <Avatar>
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1A1A1A] text-white border-gray-700">
              <DropdownMenuLabel> Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem><a href='/account/profile'>Hồ sơ</a></DropdownMenuItem>
              <DropdownMenuItem><a href='/account/favorites'>Yêu thích</a></DropdownMenuItem>
              <DropdownMenuItem><a href='/account/history'>Lịch sử</a></DropdownMenuItem>
              <DropdownMenuItem><a href='/account/playlist'>Danh sách</a></DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#1A1A1A] px-4 py-3 space-y-2 border-t border-gray-800">
          {navItems.map(item => (
            <div
              key={item}
              onClick={() => {
                setActiveItem(item);
                setIsMenuOpen(false);
              }}
              className={`block text-sm px-3 py-2 rounded-md ${activeItem === item
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-[#2A2A2A]'
                }`}
            >
              {item}
            </div>
          ))}

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Tìm kiếm phim..."
              className="bg-[#2A2A2A] border-none rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;