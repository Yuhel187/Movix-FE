"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchBar } from "@/components/common/search-bar";
import {
    Plus,
    Trash,
    Save,
    X,
    AlertCircle,
    GripVertical,
    Search as SearchIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DndContext,
    closestCenter, 
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    UniqueIdentifier 
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy,
    useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

// --- Mock Data ---
const allMockMovies: MovieInfo[] = [
    { id: "m1", title: "Phim dui dẻ 1", genres: ["Hài hước", "Hành động"], posterUrl: "https://image.tmdb.org/t/p/w92/6JjfSchsU6daXk2AKX8EEBjO3Fm.jpg" },
    { id: "m2", title: "Phim dui dẻ 2", genres: ["Hài hước", "Hành động"], posterUrl: "https://image.tmdb.org/t/p/w92/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg" },
    { id: "m3", title: "Phim dui dẻ 3", genres: ["Hài hước", "Hành động"], posterUrl: "https://image.tmdb.org/t/p/w92/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg" },
    { id: "m4", title: "Morbius", genres: ["Hành động", "Phiêu lưu"], posterUrl: "https://image.tmdb.org/t/p/w92/6JjfSchsU6daXk2AKX8EEBjO3Fm.jpg" },
    { id: "m5", title: "John Wick 4", genres: ["Hành động", "Tội phạm"], posterUrl: "https://image.tmdb.org/t/p/w92/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg" },
    { id: "m6", title: "Anime Movie Đặc Sắc", genres: ["Anime", "Hành động"], posterUrl: "https://image.tmdb.org/t/p/w92/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg" },
    { id: "m7", title: "Interstellar", genres: ["Sci-Fi", "Phiêu lưu"], posterUrl: "https://image.tmdb.org/t/p/w92/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
];

const initialSections: HomepageSection[] = [
  { id: "sec-1", title: "Hoạt hình cho bé", displayOrder: 1, isVisible: true, linkedMovies: [] },
  { id: "sec-2", title: "Anime", displayOrder: 2, isVisible: true, linkedMovies: [] },
  { id: "sec-3", title: "Chỉ có trên Movix", displayOrder: 3, isVisible: true, linkedMovies: [] },
  { id: "sec-4", title: "Hành động & Giật gân", displayOrder: 4, isVisible: true, linkedMovies: [] },
  {
    id: "sec-5", title: "Phim Việt Nam thịnh hành", displayOrder: 5, isVisible: true,
    linkedMovies: [
      { id: "link-1", sectionId: "sec-5", movieId: "m1", displayOrder: 1, movie: allMockMovies.find(m => m.id === 'm1') },
      { id: "link-2", sectionId: "sec-5", movieId: "m2", displayOrder: 2, movie: allMockMovies.find(m => m.id === 'm2') },
      { id: "link-3", sectionId: "sec-5", movieId: "m3", displayOrder: 3, movie: allMockMovies.find(m => m.id === 'm3') },
    ]
  },
];

async function searchMovies(term: string): Promise<MovieInfo[]> { 
    console.log(`Searching for: ${term}`);
    if (!term.trim()) {
        return [];
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowerCaseTerm = term.toLowerCase();
    return allMockMovies.filter(movie =>
        movie.title.toLowerCase().includes(lowerCaseTerm)
    );
}
const EditableSectionTitle = ({ section, onSave }: { section: HomepageSection, onSave: (id: string, newTitle: string) => void }) => { /* ... Giữ nguyên ... */
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(section.title);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleSave = () => {
        if (title.trim() && title !== section.title) {
            onSave(section.id, title.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
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
                <Button size="icon-sm" variant="ghost" onClick={() => { setTitle(section.title); setIsEditing(false); }} className="text-red-400 hover:bg-slate-700">
                    <X className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <span
            className="flex-1 text-base font-medium cursor-pointer hover:bg-slate-700/50 px-2 py-1 rounded"
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
                const results = await searchMovies(searchTerm);
                setSearchResults(results);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    return (
        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-md space-y-3">
            <div className="flex items-center gap-2">
                 <SearchBar
                    placeholder="Nhập tên phim cần tìm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <Button size="icon" variant="ghost" onClick={onCancel} className="text-red-400 hover:bg-slate-700">
                     <X className="w-5 h-5"/>
                 </Button>
            </div>
            {isSearching && <p className="text-sm text-gray-400">Đang tìm kiếm...</p>}
            {!isSearching && searchTerm && searchResults.length === 0 && (
                <p className="text-sm text-gray-400">Không tìm thấy kết quả nào.</p>
            )}
            {searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {searchResults.map((movie) => (
                        <div
                            key={movie.id}
                            className="flex items-center gap-3 p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded cursor-pointer"
                            onClick={() => onMovieSelected(sectionId, movie.id, movie)}
                        >
                            <img
                                src={movie.posterUrl || '/poster-placeholder.jpg'}
                                alt={movie.title}
                                className="w-8 h-12 object-cover rounded flex-shrink-0 bg-slate-800"
                                width={32}
                                height={48}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{movie.title}</p>
                                <p className="text-xs text-gray-400 truncate">{movie.genres.join(', ')}</p>
                            </div>
                            <Plus className="w-4 h-4 text-green-400 flex-shrink-0" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
const SortableMovieRow = ({ link, sectionId, selectedMovies, onSelectMovie, onRemoveMovie }: {
    link: SectionMovieLink;
    sectionId: string;
    selectedMovies: Set<string>;
    onSelectMovie: (sectionId: string, linkId: string, checked: boolean) => void;
    onRemoveMovie: (sectionId: string, linkId: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: link.id }); 

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isDragging ? '#2d2d2d' : undefined, 
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={`border-slate-800 hover:bg-slate-800/30 ${isDragging ? 'shadow-lg' : ''}`}
        >
            <TableCell
                className="cursor-grab text-center text-gray-500 w-[40px]"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-4 w-4 mx-auto" />
            </TableCell>
            <TableCell className="w-[50px]">
                <Checkbox
                    className="border-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    checked={selectedMovies.has(link.id)}
                    onCheckedChange={(checked) => onSelectMovie(sectionId, link.id, !!checked)}
                />
            </TableCell>
            <TableCell className="font-medium">{link.movie?.title ?? `Movie ID: ${link.movieId}`}</TableCell>
            <TableCell className="text-gray-300 text-xs">
                {link.movie?.genres?.join(", ") ?? "N/A"}
            </TableCell>
            <TableCell className="text-right w-[80px]">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-400 hover:bg-red-900/30 w-8 h-8"
                    onClick={() => onRemoveMovie(sectionId, link.id)}
                    title="Xóa phim khỏi chủ đề"
                >
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
    onToggleAddMovieSearch
}: {
    section: HomepageSection;
    onRemoveMovie: (sectionId: string, linkId: string) => void;
    selectedMovies: Set<string>;
    onSelectMovie: (sectionId: string, linkId: string, checked: boolean) => void;
    onSelectAllMovies: (sectionId: string, checked: boolean) => void;
    onBulkRemoveMovies: (sectionId: string) => void;
    isAddingMovie: boolean;
    onToggleAddMovieSearch: (sectionId: string) => void;
}) => {
    const movieLinkIds = useMemo(() => section.linkedMovies.map(link => link.id), [section.linkedMovies]);
    const isAllSelected = movieLinkIds.length > 0 && movieLinkIds.every(id => selectedMovies.has(id));
    const isIndeterminate = !isAllSelected && movieLinkIds.some(id => selectedMovies.has(id));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                    <span>Tổng phim:</span>
                    <Badge variant="secondary" className="bg-gray-600 text-white">
                        {section.linkedMovies.length}
                    </Badge>
                </div>
                {selectedMovies.size > 0 && (
                     <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onBulkRemoveMovies(section.id)}
                     >
                         <Trash className="w-3 h-3 mr-1.5"/> Xóa {selectedMovies.size} mục đã chọn
                     </Button>
                 )}
            </div>
            <div className="rounded-md overflow-hidden border border-slate-700">
                <Table>
                    <TableHeader className="bg-slate-700/50">
                        <TableRow className="border-slate-700 hover:bg-transparent">
                            <TableHead className="w-[40px] text-white"></TableHead> {/* Drag Handle */}
                            <TableHead className="w-[50px] text-white">
                                <Checkbox
                                    className="border-white data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=indeterminate]:bg-primary/50"
                                    checked={isAllSelected || isIndeterminate}
                                    onCheckedChange={(checked) => onSelectAllMovies(section.id, !!checked)}
                                    aria-label="Chọn tất cả"
                                    data-state={isIndeterminate ? 'indeterminate' : (isAllSelected ? 'checked' : 'unchecked')}
                                />
                            </TableHead>
                            <TableHead className="text-white">Tên phim</TableHead>
                            <TableHead className="text-white">Thể loại</TableHead>
                            <TableHead className="text-white text-right w-[80px]">Xóa</TableHead>
                        </TableRow>
                    </TableHeader>
                    <SortableContext items={movieLinkIds} strategy={verticalListSortingStrategy}>
                        <TableBody>
                            {section.linkedMovies.length > 0 ? (
                                section.linkedMovies
                                    .map((link) => (
                                        <SortableMovieRow
                                            key={link.id}
                                            link={link}
                                            sectionId={section.id}
                                            selectedMovies={selectedMovies}
                                            onSelectMovie={onSelectMovie}
                                            onRemoveMovie={onRemoveMovie}
                                        />
                                    ))
                            ) : (
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableCell colSpan={5} className="text-center text-gray-400 py-4">
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
        </div>
    );
};

const SortableSectionItem = ({ section, openSectionId, onToggleVisibility, onDeleteSection, onUpdateTitle, children }: {
    section: HomepageSection;
    openSectionId: string | undefined;
    onToggleVisibility: (id: string, isVisible: boolean) => void;
    onDeleteSection: (id: string) => void;
    onUpdateTitle: (id: string, newTitle: string) => void;
    children: React.ReactNode;
}) => {
     const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1, 
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <AccordionItem
                value={section.id}
                className={`border rounded-md overflow-hidden bg-[#262626] transition-colors duration-200 ${
                    openSectionId === section.id ? "border-[#E50914]" : "border-slate-700"
                } ${isDragging ? 'shadow-2xl' : ''}`}
            >
                <AccordionTrigger
                    className="flex items-center gap-3 px-4 py-3 hover:no-underline text-white w-full text-left data-[state=open]:bg-[#E50914]/10 data-[state=closed]:hover:bg-slate-700/50"
                >
                    <span title="Kéo để sắp xếp" {...listeners}>
                        <GripVertical className="h-5 w-5 text-gray-500 cursor-grab flex-shrink-0" />
                    </span>
                    <EditableSectionTitle section={section} onSave={onUpdateTitle} />
                    <div className="flex items-center gap-3 ml-auto flex-shrink-0" onClick={e => e.stopPropagation()}>
                         <Switch
                            checked={section.isVisible}
                            onCheckedChange={(checked) => onToggleVisibility(section.id, checked)}
                            className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-600"
                            aria-label="Hiện/Ẩn chủ đề"
                         />
                         <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-400 hover:bg-red-900/30 w-8 h-8"
                            onClick={(e) => { e.stopPropagation(); onDeleteSection(section.id); }}
                            title="Xóa chủ đề"
                         >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                </AccordionTrigger>
                {children}
            </AccordionItem>
        </div>
    );
};
export default function ConfigPage() {
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openSectionId, setOpenSectionId] = useState<string | undefined>(undefined);
    const [selectedMoviesInSection, setSelectedMoviesInSection] = useState<{ [sectionId: string]: Set<string> }>({});
    const [addingMovieToSectionId, setAddingMovieToSectionId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          setError(null);
          try {
            console.log("Fetching homepage sections...");
            await new Promise(resolve => setTimeout(resolve, 500));
            const fetchedData = initialSections;

            const sortedData = fetchedData.sort((a, b) => a.displayOrder - b.displayOrder);
            setSections(sortedData);

            const initialSelected: { [sectionId: string]: Set<string> } = {};
            sortedData.forEach(sec => {
                initialSelected[sec.id] = new Set<string>();
            });
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
        const optimisticSection: HomepageSection = {
            id: `temp-${Date.now()}`,
            title: newTitle,
            displayOrder: newOrder,
            isVisible: true,
            linkedMovies: [],
        };
        setSections(prev => [...prev, optimisticSection].sort((a, b) => a.displayOrder - b.displayOrder));
        setSelectedMoviesInSection(prev => ({...prev, [optimisticSection.id]: new Set<string>()}));

        try {
            console.log("Adding section:", { title: newTitle, displayOrder: newOrder, isVisible: true });
            await new Promise(resolve => setTimeout(resolve, 300));
            const createdSection = { ...optimisticSection, id: `sec-${Date.now()}` };

            setSections(prev => prev.map(s => s.id === optimisticSection.id ? createdSection : s)
                                     .sort((a, b) => a.displayOrder - b.displayOrder));
            setSelectedMoviesInSection(prev => {
                const updated = {...prev};
                updated[createdSection.id] = updated[optimisticSection.id];
                delete updated[optimisticSection.id];
                return updated;
            });
            setOpenSectionId(createdSection.id);
        } catch (err) {
            setError("Lỗi khi thêm chủ đề.");
            console.error(err);
            setSections(prev => prev.filter(s => s.id !== optimisticSection.id));
             setSelectedMoviesInSection(prev => {
                const updated = {...prev};
                delete updated[optimisticSection.id];
                return updated;
            });
        }
    };
    const handleUpdateSectionTitle = async (id: string, newTitle: string) => {
        const originalSections = [...sections];
        const sectionIndex = sections.findIndex(s => s.id === id);
        if (sectionIndex === -1 || sections[sectionIndex].title === newTitle) return;

        setSections(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));

        try {
            console.log(`Updating section ${id} title to:`, newTitle);
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
            setError("Lỗi khi cập nhật tên chủ đề.");
            console.error(err);
            setSections(originalSections);
        }
    };
    const handleToggleVisibility = async (id: string, isVisible: boolean) => { 
         const originalSections = [...sections];
         const sectionIndex = sections.findIndex(s => s.id === id);
         if (sectionIndex === -1) return;

         setSections(prev => prev.map(s => s.id === id ? { ...s, isVisible } : s));

        try {
            console.log(`Updating section ${id} visibility to:`, isVisible);
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
            setError("Lỗi khi cập nhật trạng thái hiển thị.");
            console.error(err);
            setSections(originalSections);
        }
     };
    const handleDeleteSection = async (id: string) => { 
        if (!confirm(`Bạn có chắc muốn xóa chủ đề "${sections.find(s=>s.id === id)?.title}" không?`)) return;

        const originalSections = [...sections];
        setSections(prev => prev.filter(s => s.id !== id));
        setSelectedMoviesInSection(prev => {
            const updated = {...prev};
            delete updated[id];
            return updated;
        });

        try {
            console.log(`Deleting section ${id}`);
            await new Promise(resolve => setTimeout(resolve, 300));
            if(openSectionId === id) setOpenSectionId(undefined);
        } catch (err) {
            setError("Lỗi khi xóa chủ đề.");
            console.error(err);
            setSections(originalSections);
        }
     };
    const handleAddMovie = async (sectionId: string, movieId: string, movieInfo: MovieInfo) => {
         const sectionIndex = sections.findIndex(s => s.id === sectionId);
        if(sectionIndex === -1) return;

        if (sections[sectionIndex].linkedMovies.some(link => link.movieId === movieId)) {
            alert(`Phim "${movieInfo.title}" đã có trong chủ đề này.`);
            return;
        }

        const newOrder = sections[sectionIndex].linkedMovies.length > 0 ? Math.max(...sections[sectionIndex].linkedMovies.map(m => m.displayOrder)) + 1 : 1;
        const optimisticLink: SectionMovieLink = {
            id: `temp-link-${Date.now()}`,
            sectionId: sectionId,
            movieId: movieId,
            displayOrder: newOrder,
            movie: movieInfo
        };

        console.log(`Adding movie ${movieId} to section ${sectionId}`);
        setSections(prev => prev.map(s =>
            s.id === sectionId ? { ...s, linkedMovies: [...s.linkedMovies, optimisticLink]/*.sort((a,b) => a.displayOrder - b.displayOrder)*/ } : s 
        ));
        setAddingMovieToSectionId(null);

        try {
             await new Promise(resolve => setTimeout(resolve, 200));
             const createdLink = {...optimisticLink, id: `link-${Date.now()}`};
            setSections(prev => prev.map(s => s.id === sectionId ? { ...s, linkedMovies: s.linkedMovies.map(l => l.id === optimisticLink.id ? createdLink : l ) } : s));
        } catch (err) {
             setError(`Lỗi khi thêm phim "${movieInfo.title}" vào chủ đề.`);
             console.error(err);
             setSections(prev => prev.map(s =>
                s.id === sectionId ? { ...s, linkedMovies: s.linkedMovies.filter(l => l.id !== optimisticLink.id) } : s
             ));
        }
     };
    const handleRemoveMovie = async (sectionId: string, linkId: string) => {
         const originalSections = [...sections];
        const sectionIndex = sections.findIndex(s => s.id === sectionId);
        if (sectionIndex === -1) return;

        setSections(prev => prev.map(s =>
            s.id === sectionId ? { ...s, linkedMovies: s.linkedMovies.filter(l => l.id !== linkId) } : s
        ));
        setSelectedMoviesInSection(prev => {
            const updatedSectionSelection = new Set(prev[sectionId]);
            updatedSectionSelection.delete(linkId);
            return { ...prev, [sectionId]: updatedSectionSelection };
        });

        try {
            console.log(`Removing movie link ${linkId} from section ${sectionId}`);
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
            setError("Lỗi khi xóa phim khỏi chủ đề.");
            console.error(err);
            setSections(originalSections);
        }
     };
    const handleSelectMovie = (sectionId: string, linkId: string, checked: boolean) => {
         setSelectedMoviesInSection(prev => {
            const updatedSectionSelection = new Set(prev[sectionId]);
            if (checked) {
                updatedSectionSelection.add(linkId);
            } else {
                updatedSectionSelection.delete(linkId);
            }
            return { ...prev, [sectionId]: updatedSectionSelection };
        });
     };
    const handleSelectAllMovies = (sectionId: string, checked: boolean) => { 
         const section = sections.find(s => s.id === sectionId);
        if (!section) return;

        setSelectedMoviesInSection(prev => {
            const updatedSectionSelection = new Set<string>();
            if (checked) {
                section.linkedMovies.forEach(link => updatedSectionSelection.add(link.id));
            }
            return { ...prev, [sectionId]: updatedSectionSelection };
        });
     };
    const handleBulkRemoveMovies = async (sectionId: string) => { 
        const selectedIds = selectedMoviesInSection[sectionId];
        if (!selectedIds || selectedIds.size === 0) return;

        if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.size} phim đã chọn khỏi chủ đề này?`)) return;

        const originalSections = [...sections];
        const linkIdsToRemove = Array.from(selectedIds);

        setSections(prev => prev.map(s =>
            s.id === sectionId ? { ...s, linkedMovies: s.linkedMovies.filter(l => !selectedIds.has(l.id)) } : s
        ));
        setSelectedMoviesInSection(prev => ({ ...prev, [sectionId]: new Set<string>() }));

        try {
            console.log(`Bulk removing movie links ${linkIdsToRemove.join(', ')} from section ${sectionId}`);
             await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
            setError("Lỗi khi xóa hàng loạt phim khỏi chủ đề.");
            console.error(err);
            setSections(originalSections);
        }
    };
    const handleToggleAddMovieSearch = (sectionId: string) => {
        setAddingMovieToSectionId(prev => (prev === sectionId ? null : sectionId));
    };

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        // Bỏ qua nếu không kéo vào vùng hợp lệ
        if (!over || active.id === over.id) {
            return;
        }

        setSections((currentSections) => {
            const activeId = active.id as string;
            const overId = over.id as string;

            if (activeId.startsWith('sec-') && overId.startsWith('sec-')) {
                const oldIndex = currentSections.findIndex((s) => s.id === activeId);
                const newIndex = currentSections.findIndex((s) => s.id === overId);

                if (oldIndex === -1 || newIndex === -1) return currentSections; 

                const reordered = arrayMove(currentSections, oldIndex, newIndex);

                const updatedSections = reordered.map((section, index) => ({
                    ...section,
                    displayOrder: index + 1,
                }));
                console.log("New section order (FE state):", updatedSections.map(s => ({ id: s.id, order: s.displayOrder })));
                // --- BACKEND CALL ---
                // api.updateSectionOrder(updatedSections.map(s => ({ id: s.id, order: s.displayOrder })));
                return updatedSections;
            }

            if (activeId.startsWith('link-') && overId.startsWith('link-')) {
                 const sectionIndex = currentSections.findIndex(s => s.linkedMovies.some(l => l.id === activeId));
                 if (sectionIndex === -1) return currentSections;

                 const section = currentSections[sectionIndex];
                 const oldMovieIndex = section.linkedMovies.findIndex(l => l.id === activeId);
                 const newMovieIndex = section.linkedMovies.findIndex(l => l.id === overId);

                 if (oldMovieIndex === -1 || newMovieIndex === -1) return currentSections;

                 const reorderedMovies = arrayMove(section.linkedMovies, oldMovieIndex, newMovieIndex);

                 const updatedLinkedMovies = reorderedMovies.map((link, index) => ({
                     ...link,
                     displayOrder: index + 1,
                 }));
                 const updatedSection = { ...section, linkedMovies: updatedLinkedMovies };

                 console.log(`New movie order for section ${section.id} (FE state):`, updatedLinkedMovies.map(m => ({ id: m.id, order: m.displayOrder })));
                 // --- BACKEND CALL ---
                 // api.updateMovieOrderInSection(section.id, updatedLinkedMovies.map(m => ({ id: m.id, order: m.displayOrder })));

                 // Trả về mảng sections mới với section đã được cập nhật
                 const newSections = [...currentSections];
                 newSections[sectionIndex] = updatedSection;
                 return newSections;
            }

            return currentSections; 
        });
    }, [sections]); 

    if (loading) { 
        return (
            <div className="w-full text-white p-6 space-y-4">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-8 w-64 bg-slate-700" />
                    <Skeleton className="h-10 w-32 bg-slate-700" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-slate-700 rounded-md" />
                ))}
            </div>
        );
     }
    if (error) {
       return (
          <div className="flex flex-col items-center justify-center h-64 text-red-500 bg-[#262626] border border-red-800 rounded-md p-6">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>{error}</p>
          </div>
        );
     }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="w-full text-white">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Quản lý Homepage / Banner</h1>
                    <Button onClick={handleAddSection} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm Section
                    </Button>
                </div>

                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="w-full space-y-2">
                        <Accordion
                            type="single"
                            collapsible
                            value={openSectionId}
                            onValueChange={(value) => {
                                setOpenSectionId(value || undefined);
                                if (value !== addingMovieToSectionId) {
                                    setAddingMovieToSectionId(null);
                                }
                            }}
                        >
                            {sections.map((section) => (
                                <SortableSectionItem
                                    key={section.id}
                                    section={section}
                                    openSectionId={openSectionId}
                                    onToggleVisibility={handleToggleVisibility}
                                    onDeleteSection={handleDeleteSection}
                                    onUpdateTitle={handleUpdateSectionTitle}
                                >
                                    <AccordionContent className="bg-[#1F1F1F] px-4 pt-4 pb-4 border-t border-slate-700">
                                        <SectionMoviesTable
                                            section={section}
                                            onRemoveMovie={handleRemoveMovie}
                                            selectedMovies={selectedMoviesInSection[section.id] || new Set()}
                                            onSelectMovie={handleSelectMovie}
                                            onSelectAllMovies={handleSelectAllMovies}
                                            onBulkRemoveMovies={handleBulkRemoveMovies}
                                            isAddingMovie={addingMovieToSectionId === section.id}
                                            onToggleAddMovieSearch={handleToggleAddMovieSearch}
                                        />
                                        {addingMovieToSectionId === section.id && (
                                            <AddMovieSearch
                                                sectionId={section.id}
                                                onMovieSelected={handleAddMovie}
                                                onCancel={() => setAddingMovieToSectionId(null)}
                                            />
                                        )}
                                    </AccordionContent>
                                </SortableSectionItem>
                            ))}
                        </Accordion>
                    </div>
                </SortableContext>

                {sections.length === 0 && !loading && (
                    <div className="text-center text-gray-400 py-8">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Chưa có chủ đề nào. Nhấn "Thêm Section" để bắt đầu.
                    </div>
                )}
            </div>
        </DndContext>
    );
}