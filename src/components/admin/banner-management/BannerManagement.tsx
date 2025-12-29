/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table, TableHeader, TableHead, TableBody, TableRow, TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchBar } from "@/components/common/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Plus, Trash, Save, X, AlertCircle, GripVertical, ChevronDown,
    Loader2, Image as ImageIcon, Link as LinkIcon, LayoutTemplate, MonitorPlay, Film, Edit, MoreHorizontal, Search
} from "lucide-react";
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor,
    useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { SearchResultDropdown, ApiSearchResult } from "@/components/common/SearchResultDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Banner } from "@/types/banner";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

interface MovieInfo {
  id: string;
  title: string;
  genres: string[];
  posterUrl?: string;
  backdropUrl?: string; 
  poster_url?: string;
  backdrop_url?: string;
  slug?: string;       
}

interface SectionMovieLink {
  id: string;
  sectionId: string;
  movieId: string;
  displayOrder: number;
  movie?: MovieInfo;
}

interface HomepageSection {
  id: string;
  title: string;
  displayOrder: number;
  isVisible: boolean;
  linkedMovies: SectionMovieLink[];
}

// ... (Giữ nguyên các component phụ: EditableSectionTitle, AddMovieSearch, SortableMovieRow, SectionMoviesTable, SortableSectionItem)

const EditableSectionTitle = ({ section, onSave }: { section: HomepageSection, onSave: (id: string, newTitle: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(section.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        if (title.trim() && title !== section.title) {
            onSave(section.id, title.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSave();
        else if (e.key === 'Escape') {
            setTitle(section.title);
            setIsEditing(false);
        }
    };

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 flex-1 min-w-0 mr-2" onClick={(e) => e.stopPropagation()}>
                <Input
                    ref={inputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="h-8 text-base font-medium bg-slate-600 border-slate-500 text-white flex-1"
                />
                <Button size="icon-sm" variant="ghost" onClick={handleSave} className="text-green-400 hover:bg-slate-700">
                    <Save className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <span
            className="flex-1 text-base font-medium cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded truncate"
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            title="Click để sửa tên"
        >
            {section.title}
        </span>
    );
};

const AddMovieSearch = ({ sectionId, onMovieSelected, onCancel }: {
    sectionId: string;
    onMovieSelected: (sectionId: string, movieId: string, movieInfo: MovieInfo) => void;
    onCancel: () => void;
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<MovieInfo[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (searchTerm.trim().length > 1) {
                setIsSearching(true);
                try {
                    const res = await apiClient.get(`/movies/search?q=${encodeURIComponent(searchTerm)}`);
                    const movies = res.data.movies.map((m: any) => ({
                        id: m.id,
                        title: m.title,
                        posterUrl: m.poster_url,
                        genres: m.genres || [] 
                    }));
                    setSearchResults(movies);
                } catch (error) {
                    console.error("Search error", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    return (
        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-md space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
                 <SearchBar
                    placeholder="Nhập tên phim cần tìm (VD: Mai, Đào...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Button size="icon" variant="ghost" onClick={onCancel} className="text-red-400 hover:bg-slate-700">
                     <X className="w-5 h-5"/>
                 </Button>
            </div>
            {isSearching && <div className="text-sm text-gray-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Đang tìm kiếm...</div>}
            {!isSearching && searchTerm.length > 1 && searchResults.length === 0 && (
                <p className="text-sm text-gray-400">Không tìm thấy kết quả nào.</p>
            )}
            {searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {searchResults.map((movie) => (
                        <div
                            key={movie.id}
                            className="flex items-center gap-3 p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded cursor-pointer transition-colors"
                            onClick={() => onMovieSelected(sectionId, movie.id, movie)}
                        >
                            <img
                                src={movie.posterUrl || '/images/placeholder-poster.png'}
                                alt={movie.title}
                                className="w-8 h-12 object-cover rounded flex-shrink-0 bg-slate-800"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-white">{movie.title}</p>
                                {movie.genres && movie.genres.length > 0 && (
                                    <p className="text-xs text-gray-400 truncate">{movie.genres.join(", ")}</p>
                                )}
                            </div>
                            <Plus className="w-4 h-4 text-green-400 flex-shrink-0" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const SortableMovieRow = ({ link, sectionId, isSelected, onSelectMovie, onRemoveMovie }: {
    link: SectionMovieLink;
    sectionId: string;
    isSelected: boolean;
    onSelectMovie: (sectionId: string, linkId: string, checked: boolean) => void;
    onRemoveMovie: (sectionId: string, linkId: string) => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id }); 

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#2d2d2d' : undefined, 
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <TableRow ref={setNodeRef} style={style} className={`border-slate-800 hover:bg-slate-800/30 ${isDragging ? 'shadow-lg' : ''}`}>
            <TableCell className="cursor-grab text-center text-gray-500 w-[40px]" {...attributes} {...listeners}>
                <GripVertical className="h-4 w-4 mx-auto" />
            </TableCell>
            <TableCell className="w-[50px]">
                <Checkbox
                    className="border-white data-[state=checked]:bg-primary"
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelectMovie(sectionId, link.id, !!checked)}
                />
            </TableCell>
            <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                    <img src={link.movie?.posterUrl || '/images/placeholder-poster.png'} alt="" className="w-6 h-9 object-cover rounded bg-slate-700" />
                    <span className="truncate max-w-[200px] text-white">{link.movie?.title}</span>
                </div>
            </TableCell>
            <TableCell className="text-gray-300 text-xs hidden md:table-cell">
                {link.movie?.genres && link.movie.genres.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {link.movie.genres.map((g, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-slate-700 text-[10px] px-1.5 py-0">{g}</Badge>
                        ))}
                    </div>
                ) : (
                    <span className="text-gray-500">—</span>
                )}
            </TableCell>
            <TableCell className="text-right w-[80px]">
                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-900/30 w-8 h-8" onClick={() => onRemoveMovie(sectionId, link.id)}>
                    <Trash className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
};

const SectionMoviesTable = ({
    section,
    onRemoveMovie,
    selectedMovies,
    onSelectMovie,
    onSelectAllMovies,
    onBulkRemoveMovies,
    isAddingMovie,
    onToggleAddMovieSearch,
    onAddMovie
}: any) => {
    const movieLinkIds = useMemo(() => section.linkedMovies.map((link: any) => link.id), [section.linkedMovies]);
    const isAllSelected = movieLinkIds.length > 0 && movieLinkIds.every((id: string) => selectedMovies.has(id));
    const isIndeterminate = !isAllSelected && movieLinkIds.some((id: string) => selectedMovies.has(id));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-sm h-9">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">Tổng phim:</span>
                    <Badge variant="secondary" className="bg-gray-600 text-white hover:bg-gray-600">
                        {section.linkedMovies.length}
                    </Badge>
                </div>
                
                {selectedMovies.size > 0 && (
                     <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white h-8"
                        onClick={() => onBulkRemoveMovies(section.id)}
                     >
                         <Trash className="w-3 h-3 mr-1.5"/> Xóa {selectedMovies.size} phim đã chọn
                     </Button>
                 )}
            </div>
            
            <div className="rounded-md overflow-hidden border border-slate-700 bg-[#1F1F1F]">
                <Table>
                    <TableHeader className="bg-slate-800">
                        <TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="w-[40px] text-center"></TableHead>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    className="border-white data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary/50"
                                    checked={isAllSelected || isIndeterminate}
                                    onCheckedChange={(checked) => onSelectAllMovies(section.id, !!checked)}
                                />
                            </TableHead>
                            <TableHead className="text-white">Tên phim</TableHead>
                            <TableHead className="hidden md:table-cell text-white">Thể loại</TableHead>
                            <TableHead className="text-right text-white w-[80px]">Xóa</TableHead>
                        </TableRow>
                    </TableHeader>
                    <SortableContext items={movieLinkIds} strategy={verticalListSortingStrategy}>
                        <TableBody>
                            {section.linkedMovies.length > 0 ? (
                                section.linkedMovies.map((link: any) => (
                                    <SortableMovieRow
                                        key={link.id}
                                        link={link}
                                        sectionId={section.id}
                                        isSelected={selectedMovies.has(link.id)}
                                        onSelectMovie={onSelectMovie}
                                        onRemoveMovie={onRemoveMovie}
                                    />
                                ))
                            ) : (
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                        Chưa có phim nào trong chủ đề này.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </SortableContext>
                </Table>
            </div>

            <div className="flex justify-center mt-4">
                <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full border-red-600 text-white hover:text-white transition-all duration-300 ${isAddingMovie ? 'bg-red-800 hover:bg-red-900 rotate-45' : 'bg-red-600 hover:bg-red-700'}`}
                    onClick={() => onToggleAddMovieSearch(section.id)}
                    title={isAddingMovie ? "Đóng tìm kiếm" : "Thêm phim vào chủ đề"}
                >
                    <Plus className={`h-5 w-5 transition-transform duration-300 ${isAddingMovie ? 'rotate-0' : ''}`} />
                </Button>
            </div>
            
            {isAddingMovie && (
                <AddMovieSearch
                    sectionId={section.id}
                    onMovieSelected={onAddMovie} 
                    onCancel={() => onToggleAddMovieSearch(section.id)}
                />
            )}
        </div>
    );
};

const SortableSectionItem = ({ section, isOpen, onToggleOpen, onToggleVisibility, onDeleteSection, onUpdateTitle, children }: any) => {
     const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1, 
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className={`mb-3 border rounded-md bg-[#262626] transition-all duration-200 ${isOpen ? "border-[#E50914]" : "border-slate-700"}`}>
            <Collapsible open={isOpen} onOpenChange={() => onToggleOpen(section.id)}>
                <div className="flex items-center gap-3 px-4 py-3 text-white w-full bg-[#262626] rounded-t-md">
                    <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-slate-700 rounded text-gray-500 hover:text-white">
                        <GripVertical className="h-5 w-5" />
                    </div>
                    
                    <EditableSectionTitle section={section} onSave={onUpdateTitle} />

                    <div className="flex items-center gap-3 ml-auto flex-shrink-0">
                         <Switch
                            checked={section.isVisible}
                            onCheckedChange={(checked) => onToggleVisibility(section.id, checked)}
                            className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                            aria-label="Hiện/Ẩn chủ đề"
                         />
                         <Button
                            variant="ghost" size="icon"
                            className="text-red-500 hover:text-red-400 hover:bg-red-900/30 w-8 h-8"
                            onClick={(e) => { e.stopPropagation(); onDeleteSection(section.id); }}
                            title="Xóa chủ đề"
                         >
                            <Trash className="h-4 w-4" />
                        </Button>
                        
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-slate-700 text-gray-400">
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </div>

                <CollapsibleContent className="border-t border-slate-700">
                    {children}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};

const HeroBannerManager = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "", imageUrl: "", linkUrl: "", description: "", isActive: true, movieId: undefined as string | number | undefined
    });
    const [bannerType, setBannerType] = useState<"custom" | "movie">("custom");
    
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [searchResults, setSearchResults] = useState<ApiSearchResult>({ movies: [], people: [] });
    
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const fetchBanners = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/banners');
            const mappedBanners = res.data.map((b: any) => ({
                id: b.id,
                title: b.title,
                imageUrl: b.image_url,
                linkUrl: b.link_url,
                isActive: b.is_active,
                movieId: b.movie_id,
                description: "", 
                movie: b.movie
            }));
            setBanners(mappedBanners);
        } catch (e) { 
            console.error(e);
            toast.error("Không thể tải danh sách banner.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    useEffect(() => {
        const fetchSearch = async () => {
            if (debouncedSearch.trim().length > 1 && bannerType === 'movie') {
                setIsSearchLoading(true);
                setIsDropdownOpen(true);
                try {
                    const res = await apiClient.get(`/movies/search?q=${encodeURIComponent(debouncedSearch)}`);
                    
                    const movies = res.data.movies.map((m: any) => ({
                        ...m, 
                        id: m.id,
                        title: m.title || m.original_title || "Untitled",
                        poster_url: m.poster_url, 
                        posterUrl: m.poster_url,   
                        original_title: m.original_title,
                        slug: m.slug,
                        backdrop_url: m.backdrop_url, 
                        genres: m.genres || []
                    }));

                    setSearchResults({ movies: movies, people: [] });
                } catch (error) {
                    console.error("Search error", error);
                } finally {
                    setIsSearchLoading(false);
                }
            } else {
                setSearchResults({ movies: [], people: [] });
                setIsDropdownOpen(false);
            }
        };
        fetchSearch();
    }, [debouncedSearch, bannerType]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectMovie = (slugOrMovie: any) => {
        let movie: any = null;

        if (typeof slugOrMovie === 'string') {
            movie = searchResults.movies.find((m: any) => m.slug === slugOrMovie);
        } 
        else if (typeof slugOrMovie === 'object') {
            movie = slugOrMovie;
        }

        if (!movie) {
            toast.error("Không tìm thấy thông tin phim!");
            return;
        }

        const backdrop = movie.backdrop_url || movie.poster_url || "";
        const movieSlug = movie.slug || "";
        const movieTitle = movie.title || movie.original_title || "Phim chưa có tên";

        setFormData(prev => ({
            ...prev,
            title: movieTitle, 
            imageUrl: backdrop, 
            linkUrl: movieSlug ? `/movies/${movieSlug}` : "", 
            movieId: movie.id,
            description: movie.description || prev.description || ""
        }));
        
        setSearchTerm(""); 
        setIsDropdownOpen(false);
        toast.success(`Đã chọn phim: ${movieTitle}`);
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setBannerType("custom");
        setFormData({ title: "", imageUrl: "", linkUrl: "", description: "", isActive: true, movieId: undefined });
        setSearchTerm("");
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (banner: Banner) => {
        setEditingId(banner.id);
        const isMovieBanner = !!banner.movieId;
        setBannerType(isMovieBanner ? "movie" : "custom");
        setFormData({
            title: banner.title || "",
            imageUrl: banner.imageUrl || "",
            linkUrl: banner.linkUrl || "",
            description: banner.description || "",
            isActive: banner.isActive,
            movieId: banner.movieId ? String(banner.movieId) : undefined,
        });
        if (isMovieBanner && banner.movie) {
            setSearchTerm(banner.movie.title || "");
        } else {
            setSearchTerm("");
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.title || !formData.imageUrl) {
            return toast.error("Vui lòng nhập Tiêu đề và URL Ảnh nền.");
        }
        
        setIsSubmitting(true);
        const payload = {
            title: formData.title,
            image_url: formData.imageUrl,
            link_url: formData.linkUrl,
            is_active: formData.isActive,
            movie_id: bannerType === 'movie' ? formData.movieId : null
        };

        try {
            if (editingId) {
                await apiClient.put(`/banners/${editingId}`, payload); 
                toast.success("Cập nhật banner thành công!");
            } else {
                await apiClient.post('/banners', payload);
                toast.success("Đã thêm Banner mới!");
            }
            
            setIsDialogOpen(false);
            fetchBanners();
        } catch(e) { 
            console.error(e);
            toast.error("Lỗi khi lưu banner"); 
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await apiClient.delete(`/banners/${deleteId}`);
            setBanners(prev => prev.filter(b => b.id !== deleteId));
            toast.success("Đã xóa banner");
        } catch(e) { toast.error("Lỗi khi xóa banner"); }
        setDeleteId(null); 
    };

    const handleToggleActive = async (id: string) => {
        try {
            await apiClient.put(`/banners/${id}/active`);
            setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
            toast.success("Đã cập nhật trạng thái");
        } catch(e) { toast.error("Lỗi cập nhật"); }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white pl-1">Danh sách Banner đang hiển thị</h3>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm Banner
                </Button>
            </div>

            <div>
                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500"/></div>
                ) : banners.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 border border-dashed border-slate-700 rounded-lg">Chưa có banner nào.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {banners.map(banner => (
                            <div key={banner.id} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black shadow-lg transition-all hover:border-slate-600">
                                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity duration-300" />
                                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2">
                                            <Badge className={`${banner.isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"} cursor-pointer shadow-md`} onClick={() => handleToggleActive(banner.id)}>
                                                {banner.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                            {banner.movieId && (
                                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50 gap-1">
                                                    <Film className="w-3 h-3" /> Phim
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg bg-white text-black hover:bg-gray-200" onClick={() => handleOpenEdit(banner)}>
                                                <Edit className="w-4 h-4"/>
                                            </Button>
                                            <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => confirmDelete(banner.id)}>
                                                <Trash className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <h4 className="text-white font-bold text-lg drop-shadow-md line-clamp-1">{banner.title}</h4>
                                        <p className="text-xs text-gray-300 line-clamp-1">{banner.linkUrl || "Chưa có liên kết"}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-[#1F1F1F] border-slate-700 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Cập nhật Banner" : "Tạo Banner Mới"}</DialogTitle>
                        <DialogDescription>Chọn loại banner và điền thông tin hiển thị.</DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 py-2">
                        <div className="space-y-3">
                            <Label>Nguồn nội dung</Label>
                            <RadioGroup 
                                value={bannerType} 
                                onValueChange={(val: "custom" | "movie") => {
                                    setBannerType(val);
                                    if(val === 'custom') {
                                        setSearchTerm("");
                                        setFormData(prev => ({...prev, movieId: undefined}));
                                    }
                                }}
                                className="flex gap-4"
                            >
                                <div className={`flex items-center space-x-2 border p-3 rounded-md w-full cursor-pointer transition-colors ${bannerType === 'custom' ? 'border-primary bg-primary/10' : 'border-slate-700 hover:bg-white/5'}`}>
                                    <RadioGroupItem value="custom" id="type-custom" />
                                    <Label htmlFor="type-custom" className="cursor-pointer flex-1">Tự nhập (Quảng cáo/Tin tức)</Label>
                                </div>
                                <div className={`flex items-center space-x-2 border p-3 rounded-md w-full cursor-pointer transition-colors ${bannerType === 'movie' ? 'border-primary bg-primary/10' : 'border-slate-700 hover:bg-white/5'}`}>
                                    <RadioGroupItem value="movie" id="type-movie" />
                                    <Label htmlFor="type-movie" className="cursor-pointer flex-1">Chọn Phim (Liên kết)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {bannerType === 'movie' && (
                            <div className="space-y-2 relative animate-in fade-in zoom-in-95 duration-200" ref={searchContainerRef}>
                                <Label className="text-blue-400">Tìm kiếm phim</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Nhập tên phim để tự động điền..." 
                                        className="pl-9 bg-white/10 border-slate-600 focus:border-primary"
                                        value={searchTerm || ""} 
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7 text-gray-400 hover:text-white" onClick={() => { setSearchTerm(""); setFormData(prev => ({...prev, movieId: undefined})); }}>
                                            <X className="h-4 w-4"/>
                                        </Button>
                                    )}
                                </div>
                                {isDropdownOpen && searchTerm && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-1">
                                        <SearchResultDropdown 
                                            results={searchResults}
                                            isLoading={isSearchLoading}
                                            onClose={() => setIsDropdownOpen(false)}
                                            onMovieClick={handleSelectMovie}
                                            onPersonClick={() => {}} 
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-4 border-t border-slate-700 pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tiêu đề hiển thị <span className="text-red-500">*</span></Label>
                                    <Input 
                                        value={formData.title || ""} 
                                        onChange={e => setFormData({...formData, title: e.target.value})} 
                                        placeholder="Nhập tiêu đề..."
                                        className="bg-white/10 border-slate-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Link Đích (URL)</Label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"/>
                                        <Input 
                                            value={formData.linkUrl || ""} 
                                            onChange={e => setFormData({...formData, linkUrl: e.target.value})} 
                                            placeholder="/movies/slug-phim..."
                                            className="bg-white/10 border-slate-600 pl-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>URL Ảnh nền (Backdrop) <span className="text-red-500">*</span></Label>
                                <div className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <Input 
                                            value={formData.imageUrl || ""} 
                                            onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                                            placeholder="https://image.tmdb.org/t/p/original/..."
                                            className="bg-white/10 border-slate-600"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Nên dùng ảnh ngang chất lượng cao (1920x1080).</p>
                                    </div>
                                    {formData.imageUrl && (
                                        <div className="w-24 h-14 rounded overflow-hidden border border-slate-600 shrink-0 bg-black">
                                            <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Mô tả ngắn (Optional)</Label>
                                <Textarea 
                                    value={formData.description || ""} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    placeholder="Mô tả nội dung banner..."
                                    className="bg-white/10 border-slate-600"
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-md border border-slate-700">
                                <Switch 
                                    id="active-mode" 
                                    checked={formData.isActive} 
                                    onCheckedChange={v => setFormData({...formData, isActive: v})} 
                                    className="data-[state=checked]:bg-green-600"
                                />
                                <Label htmlFor="active-mode" className="cursor-pointer">Kích hoạt hiển thị ngay</Label>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Hủy bỏ</Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>} 
                                {editingId ? "Cập nhật" : "Lưu Banner"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="bg-[#1F1F1F] border-slate-700 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Hành động này không thể hoàn tác. Banner này sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white">Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Xóa ngay</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

const HomepageSectionManager = () => {
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openSectionId, setOpenSectionId] = useState<string | null>(null);
    const [selectedMoviesInSection, setSelectedMoviesInSection] = useState<{ [sectionId: string]: Set<string> }>({});
    const [addingMovieToSectionId, setAddingMovieToSectionId] = useState<string | null>(null);
    const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          try {
            const res = await apiClient.get('/homepage');
            const mappedData: HomepageSection[] = res.data.map((sec: any) => ({
                id: sec.id,
                title: sec.title,
                displayOrder: sec.display_order,
                isVisible: sec.is_visible,
                linkedMovies: sec.movie_links.map((link: any) => ({
                    id: link.id,
                    sectionId: sec.id,
                    movieId: link.movie.id,
                    displayOrder: link.display_order,
                    movie: {
                        id: link.movie.id,
                        title: link.movie.title,
                        posterUrl: link.movie.poster_url,
                        genres: link.movie.movie_genres?.map((mg: any) => mg.genre.name) || []
                    }
                }))
            }));

            setSections(mappedData);
            
            const initialSelected: { [sectionId: string]: Set<string> } = {};
            mappedData.forEach(sec => initialSelected[sec.id] = new Set<string>());
            setSelectedMoviesInSection(initialSelected);

          } catch (err) {
            setError("Không thể tải cấu hình homepage.");
            console.error(err);
          } finally {
            setLoading(false);
          }
        };
        fetchData();
    }, []);

    const handleAddSection = async () => {
        const newTitle = `Chủ đề mới ${sections.length + 1}`;
        const newOrder = sections.length > 0 ? Math.max(...sections.map(s => s.displayOrder)) + 1 : 1;
        try {
            const res = await apiClient.post('/homepage', { title: newTitle, displayOrder: newOrder });
            const newSec = { ...res.data, linkedMovies: [] };
            setSections(prev => [...prev, newSec]);
            setSelectedMoviesInSection(prev => ({...prev, [newSec.id]: new Set<string>()}));
            setOpenSectionId(newSec.id);
            toast.success("Đã thêm chủ đề mới");
        } catch (err) {
            toast.error("Lỗi khi thêm chủ đề");
        }
    };

    const handleUpdateSectionTitle = async (id: string, newTitle: string) => {
        const oldSections = [...sections];
        setSections(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
        try {
            await apiClient.put(`/homepage/${id}`, { title: newTitle });
        } catch (err) {
            setSections(oldSections);
            toast.error("Lỗi cập nhật tên");
        }
    };

    const handleDeleteSection = (id: string) => {
        setDeleteSectionId(id);
    };

    const confirmDeleteSection = async () => {
        if (!deleteSectionId) return;
        const id = deleteSectionId;
        const oldSections = [...sections];
        setSections(prev => prev.filter(s => s.id !== id));
        setSelectedMoviesInSection(prev => {
            const newState = {...prev};
            delete newState[id];
            return newState;
        });

        try {
            await apiClient.delete(`/homepage/${id}`);
            toast.success("Đã xóa chủ đề");
        } catch (err) {
            setSections(oldSections);
            toast.error("Lỗi xóa chủ đề");
        } finally {
            setDeleteSectionId(null);
        }
    };

    const handleToggleVisibility = async (id: string, isVisible: boolean) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, isVisible } : s));
        try {
            await apiClient.put(`/homepage/${id}`, { is_visible: isVisible });
        } catch (err) { toast.error("Lỗi cập nhật trạng thái"); }
    };

    const handleAddMovie = async (sectionId: string, movieId: string, movieInfo: MovieInfo) => {
        const section = sections.find(s => s.id === sectionId);
        if (!section) return;
        if (section.linkedMovies.some(m => m.movieId === movieId)) {
            toast.warning("Phim đã có trong chủ đề này");
            return;
        }

        const newOrder = section.linkedMovies.length + 1;
        try {
            const res = await apiClient.post('/homepage/movie', { sectionId, movieId, displayOrder: newOrder });
            
            const newLink: SectionMovieLink = {
                id: res.data.id, 
                sectionId,
                movieId,
                displayOrder: newOrder,
                movie: {
                    ...movieInfo,
                    genres: res.data.movie?.movie_genres?.map((mg: any) => mg.genre.name) || movieInfo.genres || []
                }
            };
            setSections(prev => prev.map(s => s.id === sectionId ? { ...s, linkedMovies: [...s.linkedMovies, newLink] } : s));
            toast.success("Đã thêm phim");
        } catch (err) {
            toast.error("Lỗi thêm phim");
        }
    };

    const handleRemoveMovie = async (sectionId: string, linkId: string) => {
        const oldSections = [...sections];
        setSections(prev => prev.map(s => s.id === sectionId ? { ...s, linkedMovies: s.linkedMovies.filter(l => l.id !== linkId) } : s));
        
        setSelectedMoviesInSection(prev => {
            const newSet = new Set(prev[sectionId]);
            newSet.delete(linkId);
            return {...prev, [sectionId]: newSet};
        });

        try {
            await apiClient.delete(`/homepage/${sectionId}/movie/${linkId}`);
        } catch (err) { 
            setSections(oldSections);
            toast.error("Lỗi xóa phim"); 
        }
    };
    
    const handleSelectMovie = (sectionId: string, linkId: string, checked: boolean) => {
        setSelectedMoviesInSection(prev => {
            const currentSet = prev[sectionId] || new Set();
            const newSet = new Set(currentSet);
            if (checked) newSet.add(linkId);
            else newSet.delete(linkId);
            return { ...prev, [sectionId]: newSet };
        });
    };

    const handleSelectAllMovies = (sectionId: string, checked: boolean) => {
        const section = sections.find(s => s.id === sectionId);
        if (!section) return;
        
        setSelectedMoviesInSection(prev => {
            const newSet = new Set<string>();
            if (checked) {
                section.linkedMovies.forEach(m => newSet.add(m.id));
            }
            return { ...prev, [sectionId]: newSet };
        });
    };

    const handleBulkRemoveMovies = async (sectionId: string) => {
        const selectedIds = selectedMoviesInSection[sectionId];
        if (!selectedIds || selectedIds.size === 0) return;

        if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.size} phim đã chọn khỏi chủ đề này?`)) return;

        const oldSections = [...sections];
        const linkIdsToRemove = Array.from(selectedIds);

        setSections(prev => prev.map(s => s.id === sectionId 
            ? { ...s, linkedMovies: s.linkedMovies.filter(l => !selectedIds.has(l.id)) } 
            : s
        ));
        
        setSelectedMoviesInSection(prev => ({ ...prev, [sectionId]: new Set() }));

        try {
            await Promise.all(linkIdsToRemove.map(linkId => 
                apiClient.delete(`/homepage/${sectionId}/movie/${linkId}`)
            ));
            toast.success("Đã xóa các phim đã chọn");
        } catch (err) {
            setSections(oldSections);
            toast.error("Lỗi khi xóa nhiều phim");
        }
    };

    const handleToggleAddMovieSearch = (sectionId: string) => {
        setAddingMovieToSectionId(prev => (prev === sectionId ? null : sectionId));
    };

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        // Check if dragging a Section
        if (active.id.toString().startsWith('sec-') || sections.some(s => s.id === active.id)) {
            const oldIndex = sections.findIndex((i) => i.id === active.id);
            const newIndex = sections.findIndex((i) => i.id === over.id);
            
            if (oldIndex !== -1 && newIndex !== -1) {
                const newItems = arrayMove(sections, oldIndex, newIndex);
                
                // Optimistic update
                setSections(newItems);

                const updates = newItems.map((item, index) => ({ id: item.id, order: index + 1 }));
                
                apiClient.put('/homepage/reorder', { items: updates })
                    .catch((err) => {
                        console.error("Reorder error:", err);
                        toast.error(err.response?.data?.message || "Lỗi lưu thứ tự");
                        setSections(sections); // Revert if failed
                    });
            }
        } 
        else {
            // Dragging a Movie within a Section
            const activeSection = sections.find(s => s.linkedMovies.some(m => m.id === active.id));
            if (activeSection) {
                const oldIndex = activeSection.linkedMovies.findIndex(m => m.id === active.id);
                const newIndex = activeSection.linkedMovies.findIndex(m => m.id === over.id);
                
                if (oldIndex !== -1 && newIndex !== -1) {
                     const newMovies = arrayMove(activeSection.linkedMovies, oldIndex, newIndex);
                     
                     // Optimistic update
                     setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, linkedMovies: newMovies } : s));
                     
                     const updates = newMovies.map((item, index) => ({ id: item.id, order: index + 1 }));
                     
                     apiClient.put('/homepage/movies/reorder', { items: updates })
                        .catch((err) => {
                            console.error("Movie reorder error:", err);
                            toast.error(err.response?.data?.message || "Lỗi lưu thứ tự phim");
                            // Revert logic could be added here, but it's a bit more complex for nested items
                            // For now, we just show the error. To revert, we'd need to reset 'sections' to 'sections' (from closure)
                            setSections(sections);
                        });
                }
            }
        }
    }, [sections]);

    if (loading) {
        return <div className="p-8 text-white flex justify-center"><Loader2 className="animate-spin w-8 h-8"/></div>;
    }
    if (error) {
        return <div className="p-8 text-red-500 flex flex-col items-center"><AlertCircle className="w-8 h-8 mb-2"/>{error}</div>;
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Sắp xếp và quản lý các mục hiển thị trên trang chủ.</div>
                    <Button onClick={handleAddSection} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" /> Thêm Chủ đề
                    </Button>
                </div>

                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {sections.map((section) => (
                            <SortableSectionItem
                                key={section.id}
                                section={section}
                                isOpen={openSectionId === section.id}
                                onToggleOpen={(id: string) => setOpenSectionId(prev => prev === id ? null : id)}
                                onToggleVisibility={handleToggleVisibility}
                                onDeleteSection={handleDeleteSection}
                                onUpdateTitle={handleUpdateSectionTitle}
                            >
                                <div className="bg-[#1F1F1F] px-4 pb-4 pt-2">
                                    <SectionMoviesTable
                                        section={section}
                                        selectedMovies={selectedMoviesInSection[section.id] || new Set()}
                                        onRemoveMovie={handleRemoveMovie}
                                        onSelectMovie={handleSelectMovie}
                                        onSelectAllMovies={handleSelectAllMovies}
                                        onBulkRemoveMovies={handleBulkRemoveMovies}
                                        isAddingMovie={addingMovieToSectionId === section.id}
                                        onToggleAddMovieSearch={handleToggleAddMovieSearch}
                                        onAddMovie={handleAddMovie}
                                    />
                                </div>
                            </SortableSectionItem>
                        ))}
                    </div>
                </SortableContext>

                {sections.length === 0 && !loading && (
                    <div className="text-center text-gray-400 py-8 border border-dashed border-slate-700 rounded-lg">
                        Chưa có chủ đề nào.
                    </div>
                )}
            </div>
            
            <AlertDialog open={!!deleteSectionId} onOpenChange={() => setDeleteSectionId(null)}>
                <AlertDialogContent className="bg-[#1F1F1F] border-slate-700 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa chủ đề?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Bạn có chắc chắn muốn xóa chủ đề này? Các phim trong chủ đề sẽ không bị xóa khỏi hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-slate-600 text-white hover:bg-slate-700 hover:text-white">Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteSection} className="bg-red-600 hover:bg-red-700 text-white">Xóa ngay</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DndContext>
    );
};

export default function BannerManagementPage() {
    const [activeTab, setActiveTab] = useState<"homepage" | "hero">("homepage");

    return (
        <div className="w-full text-white pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý Giao diện</h1>
                    <p className="text-gray-400 text-sm mt-1">Tùy chỉnh banner và các mục hiển thị trên trang chủ.</p>
                </div>
                
                <div className="flex bg-[#1F1F1F] p-1 rounded-lg border border-slate-800">
                    <Button 
                        variant="ghost" 
                        className={`gap-2 ${activeTab === "homepage" ? "bg-slate-700 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-slate-800"}`}
                        onClick={() => setActiveTab("homepage")}
                    >
                        <LayoutTemplate className="w-4 h-4" />
                        Trang chủ (Sections)
                    </Button>
                    <Button 
                        variant="ghost" 
                        className={`gap-2 ${activeTab === "hero" ? "bg-slate-700 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-slate-800"}`}
                        onClick={() => setActiveTab("hero")}
                    >
                        <MonitorPlay className="w-4 h-4" />
                        Hero Banner (Slider)
                    </Button>
                </div>
            </div>

            {activeTab === "homepage" ? (
                <HomepageSectionManager /> 
            ) : (
                <HeroBannerManager />
            )}
        </div>
    );
}