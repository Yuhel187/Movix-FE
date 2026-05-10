'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from "next/link";
import { Search, ChevronDown, X, LayoutDashboard, Zap } from 'lucide-react';
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

  // Gọn còn 4 mục — "Phim" gom Phim hay/lẻ/bộ + Thể loại + Quốc gia
  const navItems = ['Phim hay', 'Phim lẻ & Bộ', 'Thể loại & Quốc gia', 'Blog', 'Watching Party', 'Nâng cấp'];

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
    } else if (item === 'Blog') {
      router.push('/blog');
    } else if (item === 'Watching Party') {
      router.push('/watch-party');
    } else if (item === 'Nâng cấp') {
      router.push('/pricing');
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
    setTimeout(() => {
      setIsDropdownOpen(false);
      setSearchText("");
    }, 300);
  };

  const handlePersonResultClick = (personId: string | number) => {
    router.push(`/peoples/${personId}`);
    setTimeout(() => {
      setIsDropdownOpen(false);
      setSearchText("");
    }, 300);
  };

  const getActiveItem = () => {
    const type = searchParams.get('type');
    const genre = searchParams.get('genre');
    const country = searchParams.get('country');

    if (pathname === '/movies' || pathname === '/') return 'Phim hay';
    if (pathname === '/filter') {
      if (type === 'phim-le' || type === 'phim-bo') return 'Phim lẻ & Bộ';
      if (genre) return 'Thể loại & Quốc gia';
      if (country) return 'Thể loại & Quốc gia';
    }
    if (pathname.startsWith('/blog')) return 'Blog';
    if (pathname.startsWith('/watch-party')) return 'Watching Party';
    if (pathname === '/pricing' || pathname === '/account/subscription') return 'Nâng cấp';

    return '';
  };

  const activeItem = getActiveItem();

  const renderNavItem = (item: string) => {
    const isActive = item === activeItem;
    const commonClasses = "px-4 py-2 text-sm rounded-md transition-colors duration-200";
    const activeClasses = "bg-black text-white";
    const inactiveClasses = "text-gray-400 hover:text-white hover:bg-transparent";

    // Dropdown: Phim lẻ & Bộ
    if (item === 'Phim lẻ & Bộ') {
      return (
        <DropdownMenu key={item}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
              Phim lẻ & Bộ <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1A1A1A] text-white border-gray-700">
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/filter?type=phim-le')}>Phim lẻ</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/filter?type=phim-bo')}>Phim bộ</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Dropdown: Thể loại & Quốc gia — mega menu
    if (item === 'Thể loại & Quốc gia') {
      return (
        <DropdownMenu key={item}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}>
              Thể loại & Quốc gia <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1A1A1A] text-white border-gray-700/60 w-[520px] p-3" sideOffset={4}>
            <div className="flex gap-3">
              {/* Thể loại — 2 mini cols */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1 border-b border-gray-700/60 pb-1.5">
                  Thể loại
                </p>
                <div className="grid grid-cols-2 gap-x-1 max-h-56 overflow-y-auto no-scrollbar">
                  {genres.length === 0
                    ? <span className="text-xs text-gray-500 px-1">Đang tải...</span>
                    : genres.map(g => (
                      <button
                        key={g.id}
                        onClick={() => handleNavigate('genre', g.name)}
                        className="text-left text-xs text-gray-300 hover:text-white hover:bg-white/5 px-2 py-1.5 rounded-md truncate transition-colors"
                      >
                        {g.name}
                      </button>
                    ))}
                </div>
              </div>

              {/* Divider */}
              <div className="w-px bg-gray-700/60 self-stretch" />

              {/* Quốc gia — 2 mini cols */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1 border-b border-gray-700/60 pb-1.5">
                  Quốc gia
                </p>
                <div className="grid grid-cols-2 gap-x-1 max-h-56 overflow-y-auto no-scrollbar">
                  {countries.length === 0
                    ? <span className="text-xs text-gray-500 px-1">Đang tải...</span>
                    : countries.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleNavigate('country', c.name || '')}
                        className="text-left text-xs text-gray-300 hover:text-white hover:bg-white/5 px-2 py-1.5 rounded-md truncate transition-colors"
                      >
                        {c.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Nút đặc biệt: Nâng cấp
    if (item === 'Nâng cấp') {
      return (
        <button
          key={item}
          type="button"
          onClick={() => handleClickNavItem(item)}
          className="relative ml-1 px-3 py-1.5 text-sm font-semibold rounded-md
            bg-gradient-to-r from-yellow-500 to-orange-500
            text-black hover:from-yellow-400 hover:to-orange-400
            transition-all duration-200 shadow-[0_0_12px_rgba(234,179,8,0.35)]
            hover:shadow-[0_0_18px_rgba(234,179,8,0.55)]
            flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 fill-black text-black" />
          Nâng cấp
        </button>
      );
    }

    // Plain button
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

          {/* Navigation Links */}
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
              <DropdownMenu modal={false}>
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

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-6 w-6" />
            </Button>
            {isLoggedIn ? (
              <DropdownMenu modal={false}>
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
                className={`block text-sm px-3 py-2 rounded-md cursor-pointer ${isActive
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