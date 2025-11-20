/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Plus, 
    Calendar as CalendarIconLucide, 
    Trash2,
    Search,
    ImageIcon 
} from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from 'date-fns/locale';

import { ActorCard } from "@/components/movie/ActorCard";
import { AddActorDialog } from "@/components/movie/AddActorDialog";
import { MovieTypeSelect } from "@/components/movie/MovieTypeSelect";
import { GenreCombobox, Genre } from "@/components/movie/GenreCombobox";
import { CountrySelect } from "@/components/movie/CountrySelect";
import { SearchBar } from "@/components/common/search-bar"; 
import { ApiSearchResult, SearchResultDropdown } from "@/components/common/SearchResultDropdown"; 
import apiClient from "@/lib/apiClient"; 
import { toast } from "sonner"; 
import { useAuth } from "@/contexts/AuthContext"; 
import { Skeleton } from "@/components/ui/skeleton"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const MOCK_GENRES_DB: Genre[] = [
  { id: "g1", name: "Hành động" }, { id: "g2", name: "Phiêu lưu" }, { id: "g3", name: "Hoạt hình" },
  { id: "g4", name: "Hài kịch" }, { id: "g5", name: "Tội phạm" }, { id: "g6", name: "Tài liệu" },
  { id: "g7", name: "Kinh dị" }, { id: "g8", name: "Trinh thám" }, { id: "g9", name: "Tình cảm" },
];

interface MovieActor {
  id: string; name: string; avatar?: string; character: string; 
}

type Episode = {
  id: string | number; 
  title: string;
  duration: number | null;
  video_url: string | null; 
  episode_number: number;
};

type Season = {
  id: string; 
  name: string;
  season_number: number; 
  episodes: Episode[];
};

export default function MovieManagement() {
  const [movieToEdit, setMovieToEdit] = useState<any | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isLoadingMovie, setIsLoadingMovie] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<ApiSearchResult>({ movies: [], people: [] });
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [allGenres, setAllGenres] = useState<Genre[]>(MOCK_GENRES_DB);
  const [isAddActorOpen, setIsAddActorOpen] = useState(false);

  const [newSeasonName, setNewSeasonName] = useState("");
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (movieToEdit?.seasons?.length > 0) {
      setSelectedSeasonId(movieToEdit.seasons[0].id);
    } else {
      setSelectedSeasonId(null);
    }
  }, [movieToEdit]);

  useEffect(() => {
    const slugToEdit = searchParams.get('slug');
    if (slugToEdit) {
      handleSelectMovieToEdit(slugToEdit);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      setIsSearchLoading(true);
      setIsDropdownOpen(true);

      apiClient.get(`/movies/search?q=${debouncedSearch}`)
        .then(res => setSearchResults(res.data))
        .catch(err => {
          console.error("Lỗi tìm kiếm:", err);
          setSearchResults({ movies: [], people: [] });
        })
        .finally(() => setIsSearchLoading(false));
    } else {
      setIsDropdownOpen(false);
      setSearchResults({ movies: [], people: [] });
      setIsSearchLoading(false);
    }
  }, [debouncedSearch]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (movieToEdit?.seasons?.length > 0) {
      setSelectedSeasonId(movieToEdit.seasons[0].id);
    } else {
      setSelectedSeasonId(null);
    }
  }, [movieToEdit]);

  useEffect(() => {
    setBackdropError(false);
    setPosterError(false);
  }, [movieToEdit?.id]);
  
  const handleSelectMovieToEdit = async (slug: string) => {
    setIsDropdownOpen(false);
    setIsLoadingMovie(true);
    setSearchTerm(""); 
    try {
      const res = await apiClient.get(`/movies/${slug}`);
      setMovieToEdit(res.data);
      setIsFormDirty(false);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải thông tin chi tiết của phim.");
    } finally {
      setIsLoadingMovie(false);
    }
  };

  const updateMovieField = (field: string, value: any) => {
    setMovieToEdit((prev: any) => ({
      ...prev,
      [field]: value,
    }));
    setIsFormDirty(true);
  };

  const handleSave = async () => {
      if (!movieToEdit) return;
      setIsSaving(true);
      const toastId = toast.loading("Đang lưu thay đổi...");
      try {
        await apiClient.put(`/movies/${movieToEdit.id}`, movieToEdit); 
        toast.success("Lưu thay đổi thành công!", { id: toastId });
        setIsFormDirty(false);
    } catch (err) {
      console.error(err);
      toast.error("Lưu thất bại.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMovie = async () => {
    if (!movieToEdit) return;
    if (!confirm(`Bạn có chắc muốn xóa (soft delete) phim "${movieToEdit.title}"?`)) return;
    
    setIsDeleting(true);
    const toastId = toast.loading("Đang xóa phim...");
    try {
      await apiClient.delete(`/movies/${movieToEdit.id}`);
      toast.success("Xóa phim thành công.", { id: toastId });
      setMovieToEdit(null); 
    } catch (err) {
      console.error(err);
      toast.error("Xóa thất bại.", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCreateGenreAPI = (name: string) => {
    const newGenre: Genre = { id: `g${Date.now()}`, name: name };
    setAllGenres((currentDB) => [...currentDB, newGenre]);
    updateMovieField('movie_genres', [...(movieToEdit.movie_genres || []), { genre: newGenre }]);
  };
  const handleDeleteGenreAPI = (idToDelete: string) => {
    setAllGenres((currentDB) => currentDB.filter((g) => g.id !== idToDelete));
    updateMovieField('movie_genres', movieToEdit.movie_genres.filter((mg: any) => mg.genre.id !== idToDelete));
  };
  const handleAddActorToList = (data: { person: any; characterName: string }) => {
    if (movieToEdit.movie_people.some((mp: any) => mp.person.id === data.person.id)) {
      alert("Diễn viên này đã có trong danh sách."); return;
    }
    const newPersonLink = {
      person: { id: data.person.id, name: data.person.name, avatar_url: data.person.avatarUrl },
      character: data.characterName,
      credit_type: data.person.roles?.includes('Đạo diễn') ? 'crew' : 'cast',
      ordering: (movieToEdit.movie_people?.length || 0) + 1
    };
    updateMovieField('movie_people', [...movieToEdit.movie_people, newPersonLink]);
    setIsAddActorOpen(false);
  };
  const removeActor = (personId: string) => {
    updateMovieField('movie_people', movieToEdit.movie_people.filter((mp: any) => mp.person.id !== personId));
  };

  const handleSeasonSelect = (seasonId: string) => {
      setSelectedSeasonId(seasonId);
  };

  const handleAddNewSeason = () => {
      if (newSeasonName.trim() === "") return;
      if (!movieToEdit) return;

      const newSeasonNumber = (movieToEdit.seasons?.length || 0) + 1;
      
      const newSeason: Season = {
          id: `temp-${Date.now()}`, 
          name: newSeasonName,
          season_number: newSeasonNumber,
          episodes: [
              { id: `temp-ep-${Date.now()}`, title: "Tập 1", duration: 0, video_url: "", episode_number: 1 }
          ],
      };

      updateMovieField('seasons', [...(movieToEdit.seasons || []), newSeason]);
      setNewSeasonName("");
      setSelectedSeasonId(newSeason.id);
      toast.success(`Đã thêm ${newSeason.name}. Nhấn "Lưu thay đổi" để xác nhận.`);
  };

  const handleAddEpisode = () => {
      if (!selectedSeasonId || !movieToEdit) return;

      const currentSeason = movieToEdit.seasons.find((s: Season) => s.id === selectedSeasonId);
      if (!currentSeason) return;

      const newEpisodeNumber = (currentSeason.episodes.length || 0) + 1;
      const newEpisode: Episode = {
          id: `temp-ep-${Date.now()}`,
          title: `Tập ${newEpisodeNumber}`,
          duration: 0,
          video_url: "",
          episode_number: newEpisodeNumber
      };

      const newSeasons = movieToEdit.seasons.map((season: Season) => {
          if (season.id === selectedSeasonId) {
              return { ...season, episodes: [...season.episodes, newEpisode] };
          }
          return season;
      });
      updateMovieField('seasons', newSeasons);
      toast.success(`Đã thêm tập mới vào ${currentSeason.name}.`);
  };

  const handleRemoveEpisode = (episodeId: string | number) => {
      if (!selectedSeasonId || !movieToEdit) return;

      const newSeasons = movieToEdit.seasons.map((season: Season) => {
          if (season.id === selectedSeasonId) {
              if (season.episodes.length <= 1) {
                  toast.error("Một mùa phải có ít nhất 1 tập.");
                  return season;
              }
              return { ...season, episodes: season.episodes.filter((ep: Episode) => ep.id !== episodeId) };
          }
          return season;
      });
      updateMovieField('seasons', newSeasons);
  };
  const handleEpisodeChange = (episodeId: string | number, field: 'title' | 'duration' | 'video_url', value: string | number | null) => {
      if (!selectedSeasonId || !movieToEdit) return;
      
      const newSeasons = movieToEdit.seasons.map((season: Season) => {
          if (season.id === selectedSeasonId) {
              return {
                  ...season,
                  episodes: season.episodes.map((ep: Episode) => 
                      ep.id === episodeId ? { ...ep, [field]: value } : ep
                  )
              };
          }
          return season;
      });
      updateMovieField('seasons', newSeasons);
  };

  const currentSelectedSeason = movieToEdit?.seasons?.find((s: Season) => s.id === selectedSeasonId);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* === CỘT TRÁI  === */}
        <div className="lg:w-8/12 space-y-4 order-2 lg:order-1">
          <h1 className="text-white text-xl font-semibold px-1">
             {movieToEdit ? `Đang chỉnh sửa: ${movieToEdit.title}` : "Quản lý phim"}
          </h1>
          <Card className="bg-[#1F1F1F] border border-slate-800">
            <CardContent className="space-y-6 pt-6">
              {!movieToEdit && !isLoadingMovie && (
                <Card className="bg-[#1F1F1F] border-2 border-dashed border-slate-700 h-96">
                    <CardContent className="h-full flex flex-col items-center justify-center text-center p-6">
                        <Search className="w-16 h-16 text-slate-600 mb-4" /> 
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Bắt đầu chỉnh sửa
                        </h3>
                        <p className="text-slate-400 max-w-xs">
                            Sử dụng thanh tìm kiếm ở cột bên phải để tìm và tải thông tin một bộ phim vào form này.
                        </p>
                    </CardContent>
                </Card>
              )}
              {isLoadingMovie && (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full bg-slate-700" />
                  <Skeleton className="h-10 w-full bg-slate-700" />
                  <Skeleton className="h-24 w-full bg-slate-700" />
                </div>
              )}
              
              {/* === FORM (CHỈ HIỆN KHI CÓ PHIM) === */}
              {movieToEdit && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title" className="text-sm text-slate-300">Tên phim</Label>
                      <Input
                        id="title"
                        value={movieToEdit.title || ''}
                        onChange={(e) => updateMovieField('title', e.target.value)}
                        className="mt-2 w-full px-3 py-2 bg-[#262626] border-slate-700 rounded text-white focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="original_title" className="text-sm text-slate-300">Tiêu đề gốc</Label>
                      <Input
                        id="original_title"
                        value={movieToEdit.original_title || ''}
                        onChange={(e) => updateMovieField('original_title', e.target.value)}
                        className="mt-2 w-full px-3 py-2 bg-[#262626] border-slate-700 rounded text-white focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="releaseDate" className="text-sm text-slate-300">Ngày phát hành</Label>
                      <Popover>
                          <PopoverTrigger asChild>
                          <Button
                              variant={"outline"}
                              className={cn(
                              "mt-2 w-full justify-start text-left font-normal text-white bg-[#262626] border-slate-700 hover:bg-[#333] hover:text-white",
                              !movieToEdit.release_date && "text-muted-foreground"
                              )}
                          >
                              <CalendarIconLucide className="mr-2 h-4 w-4" />
                              {movieToEdit.release_date ? format(new Date(movieToEdit.release_date), "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                          </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#262626] border-slate-700 text-white" align="start">
                          <Calendar
                              mode="single"
                              selected={movieToEdit.release_date ? new Date(movieToEdit.release_date) : undefined}
                              onSelect={(date) => updateMovieField('release_date', date)}
                              initialFocus
                              locale={vi}
                          />
                          </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-sm text-slate-300">Quốc gia</Label>
                      <CountrySelect 
                          value={movieToEdit.country?.name?.toLowerCase()}
                          onValueChange={(val) => updateMovieField('country', { name: val })} 
                          className="mt-2 w-full bg-[#262626] border-slate-700 rounded text-white focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="poster_url" className="text-sm text-slate-300">Poster URL</Label>
                      <Input
                        id="poster_url"
                        value={movieToEdit.poster_url || ''}
                        onChange={(e) => updateMovieField('poster_url', e.target.value)}
                        className="mt-2 w-full px-3 py-2 bg-[#262626] border-slate-700 rounded text-white focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="backdrop_url" className="text-sm text-slate-300">Backdrop URL</Label>
                      <Input
                        id="backdrop_url"
                        value={movieToEdit.backdrop_url || ''}
                        onChange={(e) => updateMovieField('backdrop_url', e.target.value)}
                        className="mt-2 w-full px-3 py-2 bg-[#262626] border-slate-700 rounded text-white focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="trailer_url" className="text-sm text-slate-300">Trailer URL</Label>
                    <Input
                      id="trailer_url"
                      value={movieToEdit.trailer_url || ''}
                      onChange={(e) => updateMovieField('trailer_url', e.target.value)}
                      className="mt-2 w-full px-3 py-2 bg-[#262626] border-slate-700 rounded text-white focus:border-primary"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                      <Label htmlFor="overview" className="text-sm text-slate-300">Giới thiệu phim</Label>
                      <Textarea
                        id="overview"
                        value={movieToEdit.description || ''}
                        onChange={(e) => updateMovieField('description', e.target.value)}
                        className="mt-2 w-full px-3 py-3 bg-[#262626] border-slate-700 rounded text-white min-h-[120px] focus:border-primary"
                      />
                  </div>

                  <div>
                    <Label className="text-sm text-slate-300">Thể loại</Label>
                    <GenreCombobox
                      allGenres={allGenres} 
                      selectedGenres={movieToEdit.movie_genres?.map((mg: any) => mg.genre) || []} 
                      onChange={(newSelection) => updateMovieField('movie_genres', newSelection.map(g => ({ genre: g })))}
                      onCreate={handleCreateGenreAPI}
                      onDelete={handleDeleteGenreAPI}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-300">Đạo diễn - Diễn viên tham gia</label>
                    <div className="mt-4 flex items-center gap-5 overflow-x-auto py-1">
                      {movieToEdit.movie_people?.map((mp: any) => (
                        <ActorCard
                          key={mp.person.id}
                          name={mp.person.name}
                          imageUrl={mp.person.avatar_url || "/images/placeholder-avatar.png"}
                          character={mp.character} 
                          layout="vertical"
                          onRemove={() => removeActor(mp.person.id)}
                        />
                      ))}
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 border border-primary text-slate-300 bg-amber-500 hover:bg-amber-600 hover:text-slate-300"
                        onClick={() => setIsAddActorOpen(true)} 
                      >
                        <Plus className="h-4 w-4" />
                        Thêm
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm text-slate-300 mb-2">Loại phim</Label>
                      <MovieTypeSelect 
                        value={movieToEdit.media_type === 'TV' ? 'series' : 'single'} 
                        onChange={(val) => updateMovieField('media_type', val === 'series' ? 'TV' : 'MOVIE')} 
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-slate-300">Trạng thái phim</Label>
                      <div className="mt-2 flex items-center space-x-3 h-10 px-3 py-2 bg-[#262626] border border-slate-700 rounded-md">
                        <Switch
                            id="is_active"
                            checked={movieToEdit.is_active || false}
                            onCheckedChange={(val) => updateMovieField('is_active', val)}
                            className="data-[state=checked]:bg-green-600"
                        />
                        <Label htmlFor="is_active" className="text-white">
                            {movieToEdit.is_active ? "Đang hiển thị" : "Đang ẩn"}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Logic quản lý tập */}
                  {movieToEdit.media_type === 'TV' && (
                    <div className="space-y-6 pt-6 border-t border-slate-700">
                      
                      {/* KHỐI BỊ LẶP ĐÃ BỊ XÓA KHỎI ĐÂY 
                      */}

                      <h3 className="text-lg font-semibold text-white">QUẢN LÝ MÙA VÀ TẬP PHIM</h3>
                      
                      {/* 1. Thêm Mùa */}
                      <div>
                        {/* Thêm flex-col và sm:flex-row */}
                        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                          {/* Thêm w-full và sm:flex-1 */}
                          <div className="w-full sm:flex-1">
                            <Label htmlFor="seasonNameInput" className="block text-sm font-medium text-gray-300 mb-1">Tên mùa</Label>
                            <Input 
                              id="seasonNameInput"
                              className="bg-white/10 border-slate-700"
                              value={newSeasonName}
                              onChange={(e) => setNewSeasonName(e.target.value)}
                              placeholder="Vd: Mùa 2: Phần tiếp theo"
                            />
                          </div>
                          {/* Thêm w-full và sm:w-auto */}
                          <Button 
                            className="bg-[#E50914] hover:bg-[#b80710] flex-shrink-0 w-full sm:w-auto"
                            onClick={handleAddNewSeason}
                          >
                            Thêm mùa mới <Plus className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* 2. Chọn Mùa */}
                      {movieToEdit.seasons?.length > 0 && (
                        <>
                          <div>
                            <Label htmlFor="seasonSelect" className="block text-sm font-medium text-gray-300 mb-1">Chỉnh sửa mùa</Label>
                            <Select 
                                value={selectedSeasonId || ''} 
                                onValueChange={handleSeasonSelect}
                            >
                                <SelectTrigger id="seasonSelect" className="w-full bg-white/10 border-slate-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#262626] border-slate-700 text-white">
                                    {movieToEdit.seasons.map((season: Season) => (
                                        <SelectItem key={season.id} value={season.id}>
                                            {season.name || `Mùa ${season.season_number}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                          </div>
                          <hr className="border-slate-700" />
                          
                          {/* 3. Danh sách tập */}
                          <h4 className="text-md font-semibold text-white">Danh sách tập của: {currentSelectedSeason?.name || `Mùa ${currentSelectedSeason?.season_number}`}</h4>
                          <div className="space-y-4 ">
                              {currentSelectedSeason?.episodes.map((episode: Episode, index: number) => (
                                  <Card key={episode.id} className="p-4 bg-white/5 border-slate-700 relative">
                                      <div className="flex flex-col md:flex-row gap-4">
                                          <div className="flex-shrink-0">
                                              <Label className="block text-sm font-medium text-gray-300 mb-1">Tập</Label>
                                              <Input value={`Tập ${index + 1}`} readOnly className="bg-white/10 text-white border-slate-600 w-full md:w-24 text-center" />
                                          </div>
                                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                  <Label htmlFor={`ep_title_${episode.id}`} className="block text-sm font-medium text-gray-300 mb-1">Tiêu đề tập</Label>
                                                  <Input 
                                                      id={`ep_title_${episode.id}`} 
                                                      value={episode.title} 
                                                      onChange={(e) => handleEpisodeChange(episode.id, 'title', e.target.value)}
                                                      className="bg-white/10 border-slate-600 text-white" 
                                                  />
                                              </div>
                                              <div>
                                                  <Label htmlFor={`ep_duration_${episode.id}`} className="block text-sm font-medium text-gray-300 mb-1">Thời lượng (phút)</Label>
                                                  <Input 
                                                      id={`ep_duration_${episode.id}`} 
                                                      type="number" 
                                                      value={episode.duration || ''} 
                                                      onChange={(e) => handleEpisodeChange(episode.id, 'duration', e.target.valueAsNumber || 0)}
                                                      className="bg-white/10 border-slate-600 text-white" min="0" 
                                                  />
                                              </div>
                                              <div className="md:col-span-2">
                                                  <Label htmlFor={`ep_file_${episode.id}`} className="block text-sm font-medium text-gray-300 mb-1">File phim (Tên file/URL)</Label>
                                                  <Input 
                                                      id={`ep_file_${episode.id}`} 
                                                      className="bg-white/10 text-white border-slate-600" 
                                                      placeholder="video_e1.mp4 hoặc /uploads/video_e1.mp4"
                                                      value={episode.video_url || ''}
                                                      onChange={(e) => handleEpisodeChange(episode.id, 'video_url', e.target.value)} 
                                                  />
                                              </div>
                                          </div>
                                      </div>
                                      {currentSelectedSeason && currentSelectedSeason.episodes.length > 0 && (
                                          <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="text-gray-400 hover:text-red-500 hover:bg-slate-700 absolute top-2 right-2" 
                                              onClick={() => handleRemoveEpisode(episode.id)}
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </Button>
                                      )}
                                  </Card>
                              ))}
                          </div>

                          {/* 4. Nút Thêm tập */}
                          <div className="flex justify-center">
                              <Button 
                                  variant="outline" 
                                  className="w-12 h-12 rounded-full p-0 bg-white/10 border-slate-700 hover:bg-white/20 hover:text-white"
                                  onClick={handleAddEpisode}
                              >
                                  <Plus className="w-6 h-6" />
                              </Button>
                          </div>
                        </>
                      )}
                      
                    </div>
                  )}
                  {movieToEdit.media_type === 'MOVIE' && (
                    <div className="space-y-4 pt-6 border-t border-slate-700">
                        <h3 className="text-lg font-semibold text-white">QUẢN LÝ FILE PHIM LẺ</h3>
                        <div>
                            <Label htmlFor="single_file_url" className="block text-sm font-medium text-gray-300 mb-1">File phim (Tên file/URL)</Label>
                            <Input 
                              id="single_file_url" 
                              className="bg-white/10 text-white border-slate-600" 
                              placeholder="my_movie_file.mp4"
                              value={movieToEdit.seasons?.[0]?.episodes?.[0]?.video_url || ''}
                              onChange={(e) => {
                                const newSeasons = [...movieToEdit.seasons];
                                if (newSeasons[0]?.episodes[0]) {
                                  newSeasons[0].episodes[0].video_url = e.target.value;
                                  updateMovieField('seasons', newSeasons);
                                }
                              }}
                            />
                        </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>

            {movieToEdit && (
              <CardFooter className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-800">
                <Button
                  onClick={handleDeleteMovie}
                  variant="destructive"
                  /* Thêm w-full sm:w-auto */
                  className="bg-rose-600 text-white w-full sm:w-auto py-5 text-sm"
                  disabled={isDeleting || isSaving}
                >
                  {isDeleting ? "Đang xóa..." : "Xóa phim"}
                </Button>
                <Button
                  onClick={handleSave}
                  /* Thêm w-full sm:w-auto */
                  className="bg-blue-600 text-white w-full sm:w-auto hover:bg-blue-700 py-5 text-sm"
                  disabled={!isFormDirty || isSaving || isDeleting}
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
            </CardFooter>
            )}
        </Card>
        </div>
        
        {/* === CỘT PHẢI (TÌM KIẾM & PREVIEW) === */}
        <div className="lg:w-4/12 h-full order-1 lg:order-2">
          <div className="sticky top-10 space-y-4">
            
            {/* 1. Search Bar */}
            <div ref={searchContainerRef} className="relative">
              <SearchBar 
                placeholder="Tìm phim để chỉnh sửa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isDropdownOpen && (searchTerm.length > 0) && (
                <SearchResultDropdown
                  results={searchResults}
                  isLoading={isSearchLoading}
                  onClose={() => setIsDropdownOpen(false)}
                  onMovieClick={handleSelectMovieToEdit}
                  onPersonClick={() => {}} 
                />
              )}
            </div>

            {/* 2. Preview Card */}
            <Card className="bg-[#1F1F1F] border-none">
              <CardContent className="p-4 space-y-8">
                <div>
                  <Label className="text-xs uppercase text-slate-400">Backdrop Preview</Label>
                  <div className="mt-4 aspect-video w-full rounded-md bg-slate-800 overflow-hidden flex items-center justify-center">
                    {movieToEdit?.backdrop_url ? (
                          <Image 
                            key={movieToEdit.id} 
                            src={backdropError ? "/images/placeholder-backdrop.png" : movieToEdit.backdrop_url} 
                            alt="Backdrop" 
                            width={1920} height={1080} 
                            className="object-cover w-full h-full"
                            onError={() => setBackdropError(true)}
                          />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-slate-600" />
                        )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-slate-400">Poster Preview</Label>
                  <div className="mt-4 aspect-[2/3] w-64 mx-auto rounded-md bg-slate-800 overflow-hidden flex items-center justify-center">
                    {movieToEdit?.poster_url ? (
                          <Image 
                            key={`${movieToEdit.id}-poster`}
                            src={posterError ? "/images/placeholder-poster.png" : movieToEdit.poster_url} 
                            alt="Poster" 
                            width={500} height={750} 
                            className="object-cover w-full h-full"
                            onError={() => setPosterError(true)}
                          />
                        ) : (
                          <ImageIcon className="w-16 h-16 text-slate-600" />
                        )}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      <AddActorDialog 
        open={isAddActorOpen}
        onOpenChange={setIsAddActorOpen}
        onAddActor={handleAddActorToList}
      />
    </div>
  );
}