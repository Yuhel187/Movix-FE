'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from "next/link";
import { Search, Bell, ChevronDown, X, LayoutDashboard, Users, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotificationDropdown from '@/components/common/NotificationDropdown';
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
import { useAuth } from '@/contexts/AuthContext';

type Genre = { id: string; name: string };
type Country = { id: string; name: string | null };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  const { user, isLoggedIn, isLoading, logout } = useAuth();

  const [searchResults, setSearchResults] = useState<ApiSearchResult>({ movies: [], people: [] });
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = ['Phim hay', 'Thể loại', 'Phim lẻ', 'Phim bộ', 'Quốc gia', 'Diễn viên', 'Watching Party'];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleNavigate = (type: 'genre' | 'country' | 'q', value: string) => {
    router.push(`/filter?${type}=${encodeURIComponent(value)}`);
    setIsMenuOpen(false);
  };

  const handleClickNavItem = (item: string) => {
    if (item === 'Phim hay') {
      router.push('/movies');
    } else if (item === 'Phim lẻ') {
      router.push('/filter?type=phim-le');
    } else if (item === 'Phim bộ') {
      router.push('/filter?type=phim-bo');
    }
    else if (item === 'Diễn viên') {
      router.push('/peoples');
    }
    else if (item === 'Watching Party') {
      router.push('/watch-party');
    }
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchText.trim()) {
      handleNavigate('q', searchText.trim());
      setIsDropdownOpen(false);
    }
  };

  const handleMovieResultClick = (slug: string) => {
    router.push(`/movies/${slug}`);
    setIsDropdownOpen(false);
    setSearchText("");
  };

  const handlePersonResultClick = (personId: string | number) => {
    router.push(`/peoples/${personId}`);
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

  const getActiveItem = () => {
    const type = searchParams.get('type');
    const genre = searchParams.get('genre');
    const country = searchParams.get('country');

    if (pathname === '/movies' || pathname === '/') {
      return 'Phim hay';
    }
    if (pathname === '/filter') {
      if (type === 'phim-le') return 'Phim lẻ';
      if (type === 'phim-bo') return 'Phim bộ';
      if (genre) return 'Thể loại';
      if (country) return 'Quốc gia';
    }

    return '';
  };

  const activeItem = getActiveItem();

  const renderNavItem = (item: string) => {
    const isActive = (item === activeItem);

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
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 transition-all duration-300 ${
          isScrolled 
            ? "bg-[#0F0F0F] shadow-xl border-b border-zinc-800" 
            : "bg-black/40 backdrop-blur-md border-b border-white/5"
        }`}
      >
        <div className="flex items-center space-x-4 md:space-x-8">
          <Link href="/movies" className="flex items-center space-x-2 transition-transform hover:scale-105">
            <img src="/images/logo.png" alt="Movix Logo" className="w-12 h-12 object-contain rounded-full" />
            <span className="text-2xl md:text-3xl font-extrabold text-red-600 tracking-tight drop-shadow-lg">Movix</span>
          </Link>

          {/* Navigation Links  */}
          <div className="hidden md:flex items-center bg-[#1A1A1A] rounded-lg px-2 py-1">
            {navItems.map(item => renderNavItem(item))}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="relative flex items-center" ref={searchContainerRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleSearchSubmit}
              placeholder="Tìm kiếm phim, diễn viên..."
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md pl-11 pr-9 h-10 w-64 md:w-72 focus:w-80 md:focus:w-96 transition-all duration-300 text-sm font-normal text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none relative z-0"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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

          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
            </div>
          ) : isLoggedIn ? (
            <>
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center cursor-pointer">
                    <Avatar>
                      <AvatarImage src={user?.avatarUrl || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} alt={user?.username} />
                      <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1A1A1A] text-white border-gray-700">
                  <DropdownMenuLabel>{user?.display_name || user?.username || 'Tài khoản'}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  {user?.role === 'Admin' && (
                    <>
                      <DropdownMenuItem 
                        className="cursor-pointer text-yellow-500 focus:text-yellow-400 focus:bg-yellow-500/10"
                        onClick={() => router.push('/admin')}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Vào trang quản trị</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                    </>
                  )}
                  <DropdownMenuItem><a href='/account/profile'>Hồ sơ</a></DropdownMenuItem>
                  <DropdownMenuItem><a href='/account/favorites'>Yêu thích</a></DropdownMenuItem>
                  <DropdownMenuItem><a href='/account/history'>Lịch sử</a></DropdownMenuItem>
                  <DropdownMenuItem><a href='/account/playlist'>Danh sách</a></DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={logout}>Đăng xuất</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              onClick={() => router.push('/login')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Đăng nhập
            </Button>
          )}
        </div>

        {/* (Mobile Menu Button) */}
        <div className="md:hidden">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-6 w-6" />
            </Button>
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} alt={user?.username} />
                      <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1A1A1A] text-white border-gray-700">
                  <DropdownMenuLabel>{user?.display_name || user?.username || 'Tài khoản'}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem><a href='/account/profile'>Hồ sơ</a></DropdownMenuItem>
                  <DropdownMenuItem><a href='/account/favorites'>Yêu thích</a></DropdownMenuItem>
                  <DropdownMenuItem><a href='/account/history'>Lịch sử</a></DropdownMenuItem>
                  <DropdownMenuItem><a href='/account/playlist'>Danh sách</a></DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={logout}>Đăng xuất</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => router.push('/login')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium"
              >
                Đăng nhập
              </Button>
            )}
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
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#1A1A1A] px-4 py-3 space-y-2 border-t border-gray-800">
          {navItems.map(item => {
            const isActive = (item === activeItem);

            return (
              <div
                key={item}
                onClick={() => {
                  handleClickNavItem(item);
                  setIsMenuOpen(false);
                }}
                className={`block text-sm px-3 py-2 rounded-md ${isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-[#2A2A2A]'
                  }`}
              >
                {item}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Navbar;