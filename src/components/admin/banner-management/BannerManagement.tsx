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
import {
    Plus, Trash, Save, X, AlertCircle, GripVertical, ChevronDown,
    Loader2
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

// --- Types ---
interface MovieInfo {
  id: string;
  title: string;
  genres: string[];
  posterUrl?: string;
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

// --- Component: Tiêu đề Section có thể sửa ---
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

// --- Component: Tìm kiếm phim để thêm vào Section ---
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const movies = res.data.movies.map((m: any) => ({
                        id: m.id,
                        title: m.title,
                        posterUrl: m.poster_url,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// --- Component: Dòng Phim trong bảng (Có thể kéo thả) ---
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

// --- Component: Bảng danh sách phim trong Section ---
const SectionMoviesTable = ({
    section,
    onRemoveMovie,
    selectedMovies,
    onSelectMovie,
    onSelectAllMovies,
    onBulkRemoveMovies,
    isAddingMovie,
    onToggleAddMovieSearch,
    onAddMovie // Thêm prop này để xử lý việc thêm phim
}: {
    section: HomepageSection;
    onRemoveMovie: (sectionId: string, linkId: string) => void;
    selectedMovies: Set<string>;
    onSelectMovie: (sectionId: string, linkId: string, checked: boolean) => void;
    onSelectAllMovies: (sectionId: string, checked: boolean) => void;
    onBulkRemoveMovies: (sectionId: string) => void;
    isAddingMovie: boolean;
    onToggleAddMovieSearch: (sectionId: string) => void;
    onAddMovie: (sectionId: string, movieId: string, movieInfo: MovieInfo) => void;
}) => {
    const movieLinkIds = useMemo(() => section.linkedMovies.map(link => link.id), [section.linkedMovies]);
    const isAllSelected = movieLinkIds.length > 0 && movieLinkIds.every(id => selectedMovies.has(id));
    const isIndeterminate = !isAllSelected && movieLinkIds.some(id => selectedMovies.has(id));

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
                                section.linkedMovies.map((link) => (
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
            
            {/* Fix: Search Bar chỉ nằm trong đây, không bị duplicate */}
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

// --- Component: Item Section có thể kéo thả ---
const SortableSectionItem = ({ section, isOpen, onToggleOpen, onToggleVisibility, onDeleteSection, onUpdateTitle, children }: {
    section: HomepageSection;
    isOpen: boolean;
    onToggleOpen: (id: string) => void;
    onToggleVisibility: (id: string, isVisible: boolean) => void;
    onDeleteSection: (id: string) => void;
    onUpdateTitle: (id: string, newTitle: string) => void;
    children: React.ReactNode;
}) => {
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
                    {/* Drag Handle */}
                    <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-slate-700 rounded text-gray-500 hover:text-white">
                        <GripVertical className="h-5 w-5" />
                    </div>
                    
                    {/* Title Editable */}
                    <EditableSectionTitle section={section} onSave={onUpdateTitle} />

                    {/* Actions Right */}
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
                        
                        {/* Trigger Expand/Collapse */}
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

// --- MAIN COMPONENT ---
export default function BannerManagementPage() {
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openSectionId, setOpenSectionId] = useState<string | null>(null);
    const [selectedMoviesInSection, setSelectedMoviesInSection] = useState<{ [sectionId: string]: Set<string> }>({});
    const [addingMovieToSectionId, setAddingMovieToSectionId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Load Data Real
    useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          try {
            const res = await apiClient.get('/homepage');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedData: HomepageSection[] = res.data.map((sec: any) => ({
                id: sec.id,
                title: sec.title,
                displayOrder: sec.display_order,
                isVisible: sec.is_visible,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                linkedMovies: sec.movie_links.map((link: any) => ({
                    id: link.id,
                    sectionId: sec.id,
                    movieId: link.movie.id,
                    displayOrder: link.display_order,
                    movie: {
                        id: link.movie.id,
                        title: link.movie.title,
                        posterUrl: link.movie.poster_url,
                        // Map genres để hiển thị
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        genres: link.movie.movie_genres?.map((mg: any) => mg.genre.name) || []
                    }
                }))
            }));

            setSections(mappedData);
            
            // Init selection sets (quan trọng để checkbox hoạt động)
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

    // --- Handlers ---

    const handleAddSection = async () => {
        const newTitle = `Chủ đề mới ${sections.length + 1}`;
        const newOrder = sections.length > 0 ? Math.max(...sections.map(s => s.displayOrder)) + 1 : 1;
        try {
            const res = await apiClient.post('/homepage', { title: newTitle, displayOrder: newOrder });
            const newSec = { ...res.data, linkedMovies: [] };
            setSections(prev => [...prev, newSec]);
            // Init state select cho section mới
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

    const handleDeleteSection = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa chủ đề này?")) return;
        const oldSections = [...sections];
        setSections(prev => prev.filter(s => s.id !== id));
        // Xóa state select của section bị xóa
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
                    // Fix hiển thị genre: dùng genre từ API search hoặc API response
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    genres: res.data.movie?.movie_genres?.map((mg: any) => mg.genre.name) || movieInfo.genres || []
                }
            };
            setSections(prev => prev.map(s => s.id === sectionId ? { ...s, linkedMovies: [...s.linkedMovies, newLink] } : s));
            toast.success("Đã thêm phim");
            // Không đóng search box để user có thể thêm tiếp
        } catch (err) {
            toast.error("Lỗi thêm phim");
        }
    };

    const handleRemoveMovie = async (sectionId: string, linkId: string) => {
        const oldSections = [...sections];
        setSections(prev => prev.map(s => s.id === sectionId ? { ...s, linkedMovies: s.linkedMovies.filter(l => l.id !== linkId) } : s));
        
        // Xóa khỏi selection nếu đang chọn
        setSelectedMoviesInSection(prev => {
            const newSet = new Set(prev[sectionId]);
            newSet.delete(linkId);
            return {...prev, [sectionId]: newSet};
        });

        try {
            await apiClient.delete(`/homepage/${sectionId}/movie/${linkId}`);
        } catch (err) { 
            setSections(oldSections); // Hoàn tác nếu lỗi
            toast.error("Lỗi xóa phim"); 
        }
    };
    
    // --- Logic Select Checkbox ---
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
        
        // Clear selection
        setSelectedMoviesInSection(prev => ({ ...prev, [sectionId]: new Set() }));

        try {
            await Promise.all(linkIdsToRemove.map(linkId => 
                apiClient.delete(`/homepage/${sectionId}/movie/${linkId}`)
            ));
            toast.success("Đã xóa các phim đã chọn");
        } catch (err) {
            setSections(oldSections); // Hoàn tác
            toast.error("Lỗi khi xóa nhiều phim");
        }
    };

    const handleToggleAddMovieSearch = (sectionId: string) => {
        setAddingMovieToSectionId(prev => (prev === sectionId ? null : sectionId));
    };

    // Drag & Drop Logic
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        // Sort Sections
        if (active.id.toString().startsWith('sec-') || sections.some(s => s.id === active.id)) {
            setSections((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                
                const updates = newItems.map((item, index) => ({ id: item.id, order: index + 1 }));
                apiClient.put('/homepage/reorder', { items: updates }).catch(() => toast.error("Lỗi lưu thứ tự"));

                return newItems;
            });
        } 
        // Sort Movies
        else {
            const activeSection = sections.find(s => s.linkedMovies.some(m => m.id === active.id));
            if (activeSection) {
                const oldIndex = activeSection.linkedMovies.findIndex(m => m.id === active.id);
                const newIndex = activeSection.linkedMovies.findIndex(m => m.id === over.id);
                
                if (oldIndex !== -1 && newIndex !== -1) {
                     const newMovies = arrayMove(activeSection.linkedMovies, oldIndex, newIndex);
                     setSections(prev => prev.map(s => s.id === activeSection.id ? { ...s, linkedMovies: newMovies } : s));
                     
                     const updates = newMovies.map((item, index) => ({ id: item.id, order: index + 1 }));
                     apiClient.put('/homepage/movies/reorder', { items: updates }).catch(() => toast.error("Lỗi lưu thứ tự phim"));
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
            <div className="w-full text-white pb-20">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Quản lý Trang chủ</h1>
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
                                onToggleOpen={(id) => setOpenSectionId(prev => prev === id ? null : id)}
                                onToggleVisibility={handleToggleVisibility}
                                onDeleteSection={handleDeleteSection}
                                onUpdateTitle={handleUpdateSectionTitle}
                            >
                                {/* Nội dung bên trong Section (List phim + Search) */}
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
                                        onAddMovie={handleAddMovie} // Đã thêm prop này
                                    />
                                </div>
                            </SortableSectionItem>
                        ))}
                    </div>
                </SortableContext>

                {sections.length === 0 && !loading && (
                    <div className="text-center text-gray-400 py-8 border border-dashed border-slate-700 rounded-lg">
                        Chưa có chủ đề nào. Nhấn &quot;Thêm Chủ đề&quot; để bắt đầu xây dựng trang chủ.
                    </div>
                )}
            </div>
        </DndContext>
    );
}