"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'; // <-- Đã thêm CardHeader/Footer/Content
import { GenreSelect } from '@/components/movie/GenreSelect';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { format } from "date-fns";
import { vi } from 'date-fns/locale';
import { 
    Calendar as CalendarIconLucide, 
    ArrowLeft, 
    Image as ImageIcon, 
    Film, 
    Tv, 
    ChevronRight,
    ChevronLeft, 
    Plus,
    Trash2,
    Upload,
    FileUp,
    Info, 
    Pencil, 
    Check, 
    ChevronsUpDown, 
    X,
    FileVideo,
} from 'lucide-react';

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

import { 
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import { cn } from "@/lib/utils";
import { AddActorDialog } from '@/components/movie/AddActorDialog';

const steps = [
    { id: 1, title: 'Thông tin phim' },
    { id: 2, title: 'Tải phim lên' },
    { id: 3, title: 'Đạo diễn & Diễn viên tham gia' },
];

interface AddMovieFormProps {
    onClose: () => void;
}

// --- Type cho Episode (Step 2) ---
type Episode = {
    id: number; 
    title: string;
    duration: number;
    file: File | null;
    fileName: string;
};

// --- Type cho Season (Step 2) ---
type Season = {
    id: string; 
    name: string;
    episodes: Episode[];
    nextEpisodeId: number;
};

// --- (MỚI) Type cho Person (Step 3) ---
type Person = {
    id: string;
    name: string;
    character: string;
    avatarUrl: string | null;
    role: 'actor' | 'director';
};

// --- (MỚI) Mock Data cho Step 3 ---
const mockPeople: Person[] = [
    { 
        id: 'person-1', 
        name: 'Jane Cooper', 
        character: 'Jane Cooper', 
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        role: 'actor'
    },
    { 
        id: 'person-2', 
        name: 'John Doe', 
        character: 'Đạo diễn',
        avatarUrl: null,
        role: 'director'
    },
    { 
        id: 'person-3', 
        name: 'Jane Cooper',
        character: 'Một nhân vật khác', 
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        role: 'actor'
    },
];

const allPeopleSearchList: {
    id: string;
    name: string;
    roles?: string;
    avatarUrl?: string | null;
}[] = [...mockPeople];

// ------------------------------

export default function AddMovieForm({ onClose }: AddMovieFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    
    // --- State Step 1 ---
    const [movieTitle, setMovieTitle] = useState("Dr. Stone");
    const [releaseDate, setReleaseDate] = useState<Date | undefined>();
    const [overview, setOverview] = useState("");
    const [selectedMovieType, setSelectedMovieType] = useState<'single' | 'series'>('series');
    const posterInputRef = useRef<HTMLInputElement>(null);
    const backdropInputRef = useRef<HTMLInputElement>(null);
    const [posterPreview, setPosterPreview] = useState<string | null>("https://image.tmdb.org/t/p/w500/6JjfSchsU6daXk2AKX8EEBjO3Fm.jpg");
    const [backdropPreview, setBackdropPreview] = useState<string | null>(null);

    // --- State Step 2 ---
    const [singleMovieFile, setSingleMovieFile] = useState<File | null>(null);
    const singleFileRef = useRef<HTMLInputElement>(null);
    const [seasons, setSeasons] = useState<Season[]>([
        { 
            id: 'client-id-1', 
            name: 'Mùa 1: Pickle ball', 
            episodes: [
                { id: 1, title: "Tập 1: Khởi đầu mới", duration: 24, file: null, fileName: 'video_e1.mp4' },
                { id: 2, title: "Tập 2: Thử thách", duration: 23, file: null, fileName: 'video_e2.mp4' }
            ],
            nextEpisodeId: 3 
        },
        { 
            id: 'client-id-2', 
            name: 'Mùa 2: The Final Arc', 
            episodes: [
                { id: 1, title: "Tập 1: Trở lại", duration: 25, file: null, fileName: 'ss2_e1.mp4' },
            ],
            nextEpisodeId: 2
        }
    ]);
    const [newSeasonName, setNewSeasonName] = useState("");
    const [selectedSeasonId, setSelectedSeasonId] = useState('client-id-1');
    const episodeFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // --- (MỚI) State Step 3 ---
    const [people, setPeople] = useState<Person[]>(mockPeople);
    const [isAddPersonOpen, setAddPersonOpen] = useState(false);
    
    // --- Hàm Step 1 ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'backdrop') => {
        // ... (code giữ nguyên)
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'poster') {
                    setPosterPreview(reader.result as string);
                } else {
                    setBackdropPreview(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Hàm điều hướng ---
    const handleNextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        } else {
            console.log("Submit form");
            // ... (logic submit)
        }
    };
    
    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // --- Hàm Step 2 ---
    const handleSingleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSingleMovieFile(file);
            console.log("Đã chọn file phim lẻ:", file.name);
        }
    };

    const handleAddNewSeason = () => {
        // ... (code giữ nguyên)
        if (newSeasonName.trim() === "") return;
        const newSeasonId = `client-id-${Date.now()}`;
        const newSeason: Season = {
            id: newSeasonId, name: newSeasonName,
            episodes: [{ id: 1, title: '', duration: 0, file: null, fileName: '' }],
            nextEpisodeId: 2
        };
        setSeasons([...seasons, newSeason]);
        setNewSeasonName("");
        setSelectedSeasonId(newSeasonId);
    };

    const handleSeasonSelect = (seasonId: string) => {
        // ... (code giữ nguyên)
        setSelectedSeasonId(seasonId);
    };

    const handleAddEpisode = () => {
        // ... (code giữ nguyên)
        setSeasons(prevSeasons => 
            prevSeasons.map(season => {
                if (season.id === selectedSeasonId) {
                    const newEpisode: Episode = {
                        id: season.nextEpisodeId, title: '', duration: 0, file: null, fileName: ''
                    };
                    return {
                        ...season,
                        episodes: [...season.episodes, newEpisode],
                        nextEpisodeId: season.nextEpisodeId + 1
                    };
                }
                return season;
            })
        );
    };

    const handleRemoveEpisode = (episodeId: number) => {
        // ... (code giữ nguyên)
        setSeasons(prevSeasons =>
            prevSeasons.map(season => {
                if (season.id === selectedSeasonId) {
                    if (season.episodes.length > 1) {
                        return { ...season, episodes: season.episodes.filter(ep => ep.id !== episodeId) };
                    }
                }
                return season;
            })
        );
    };

    const handleEpisodeChange = (episodeId: number, field: 'title' | 'duration', value: string | number) => {
        // ... (code giữ nguyên)
        setSeasons(prevSeasons =>
            prevSeasons.map(season => {
                if (season.id === selectedSeasonId) {
                    return {
                        ...season,
                        episodes: season.episodes.map(ep => 
                            ep.id === episodeId ? { ...ep, [field]: value } : ep
                        )
                    };
                }
                return season;
            })
        );
    };

    const handleEpisodeFileChange = (episodeId: number, event: React.ChangeEvent<HTMLInputElement>) => {
        // ... (code giữ nguyên)
        const file = event.target.files?.[0];
        if (file) {
            setSeasons(prevSeasons =>
                prevSeasons.map(season => {
                    if (season.id === selectedSeasonId) {
                        return {
                            ...season,
                            episodes: season.episodes.map(ep => 
                                ep.id === episodeId ? { ...ep, file: file, fileName: file.name } : ep
                            )
                        };
                    }
                    return season;
                })
            );
        }
    };

    // BƯỚC 3: Hàm callback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAddPersonSubmit = (data: { person: any; characterName: string }) => {
        console.log("Đã nhận từ dialog:", data);

        if (people.some(p => p.id === data.person.id)) {
            alert("Diễn viên này đã có trong danh sách.");
            return;
        }

        // Tạo object Person mới
        const newPerson: Person = {
            id: data.person.id,
            name: data.person.name,
            character: data.characterName || 'Chưa rõ', 
            avatarUrl: data.person.avatarUrl || null,
            role: data.person.roles?.includes('Đạo diễn') ? 'director' : 'actor',
        };

        setPeople(prev => [newPerson, ...prev]);
        
        setAddPersonOpen(false);
    };

    const handleEditPerson = (id: string) => {
        console.log("Sửa thành viên:", id);
    };

    const handleRemovePerson = (id: string) => {
        setPeople(prev => prev.filter(p => p.id !== id));
    };
    
    const currentSelectedSeason = seasons.find(s => s.id === selectedSeasonId);

    return (
        <div className="flex flex-col md:flex-row w-full gap-6 text-white min-h-[calc(100vh-theme(space.16)-theme(space.12))]">

            {/* --- Sidebar Steps --- (Giữ nguyên) */}
            <div className="w-full md:w-60 flex-shrink-0 bg-[#262626] p-4 md:p-6 rounded-lg border border-slate-800 flex flex-col">
                <Button variant="ghost" size="sm" onClick={onClose} className="self-start px-2 mb-6 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Thêm phim mới
                </Button>
                <nav>
                    <ul>
                        {steps.map((step) => (
                            <li key={step.id} className="mb-4">
                                <button
                                    className={`flex items-center w-full text-left px-3 py-2 rounded-md transition-colors ${
                                        currentStep === step.id
                                            ? 'bg-[#E50914] text-white font-semibold'
                                            : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'
                                    }`}
                                    onClick={() => {
                                        if (step.id < currentStep) {
                                            setCurrentStep(step.id)
                                        }
                                    }}
                                >
                                    <span className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 text-xs font-bold border flex-shrink-0 ${
                                        currentStep === step.id
                                            ? 'bg-white text-[#E50914] border-white'
                                            : (step.id < currentStep ? 'bg-green-600 border-green-500 text-white' : 'border-gray-500 text-gray-400')
                                    }`}>
                                        {step.id}
                                    </span>
                                    {step.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* --- Main Content Form --- */}
            <div className="flex-1 bg-[#1F1F1F] p-6 rounded-lg border border-slate-800 overflow-y-auto">
                
                {/* --- Step 1 Content --- (Giữ nguyên) */}
                {currentStep === 1 && (
                    <div className="space-y-6"> 
                        {/* ... (Backdrop) ... */}
                        <div className="relative w-full">
                            <div
                                className="relative w-full h-64 rounded-md overflow-hidden bg-slate-800/50 border border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-primary group"
                                onClick={() => backdropInputRef.current?.click()}
                            >
                                {backdropPreview ? (
                                    <img src={backdropPreview} alt="Backdrop preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity" />
                                ) : (
                                    <div className="text-center text-gray-400 group-hover:text-primary transition-colors z-0">
                                        <ImageIcon className="w-10 h-10 mx-auto mb-1" />
                                        <p className="text-sm font-semibold">Nhấn để chọn Backdrop</p>
                                    </div>
                                )}
                                <input
                                    ref={backdropInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, 'backdrop')}
                                />
                            </div>
                            <div className="flex flex-col md:flex-row gap-8 -mt-[120px] relative z-10 px-6 md:px-12">
                                {/* ... (Poster) ... */}
                                <div className="w-full md:w-auto max-w-[240px] flex-shrink-0 space-y-2 mx-auto md:mx-0 md:ml-8 lg:ml-12">
                                    <div
                                        className="aspect-[2/3] relative w-full rounded-md overflow-hidden bg-slate-700 border-4 border-[#1F1F1F] shadow-lg cursor-pointer group hover:border-primary" 
                                        onClick={() => posterInputRef.current?.click()}
                                    >
                                        {posterPreview ? (
                                            <img src={posterPreview} alt="Poster preview" className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-primary">
                                                <ImageIcon className="w-10 h-10 mb-1" />
                                                <span className="text-xs">Chọn Poster</span>
                                            </div>
                                        )}
                                        <input
                                            ref={posterInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e, 'poster')}
                                        />
                                    </div>
                                    <p
                                        className="text-xs text-gray-400 underline cursor-pointer hover:text-primary text-center"
                                        onClick={() => posterInputRef.current?.click()}
                                    >
                                        Nhấn để chọn poster
                                    </p>
                                </div>
                                {/* ... (Movie Title, Release Date) ... */}
                                <div className="flex-1 space-y-6 pt-20 md:pt-28 lg:pt-32">
                                    <div>
                                        <label htmlFor="movieTitle" className="block text-sm font-medium text-gray-300 mb-1">Tên phim</label>
                                        <Input
                                            id="movieTitle"
                                            value={movieTitle}
                                            onChange={(e) => setMovieTitle(e.target.value)}
                                            className="bg-[#262626] border-slate-700 focus:border-primary focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-300 mb-1">Ngày phát hành</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                "w-full justify-start text-left font-normal bg-[#262626] border-slate-700 hover:bg-[#333] hover:text-white",
                                                !releaseDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIconLucide className="mr-2 h-4 w-4" />
                                                {releaseDate ? format(releaseDate, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
                                            </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#262626] border-slate-700 text-white" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={releaseDate}
                                                onSelect={setReleaseDate}
                                                initialFocus
                                                locale={vi}
                                            />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ... (Overview, Genre, Movie Type) ... */}
                        <div className="space-y-6 px-6 md:px-12"> 
                            <div>
                                <label htmlFor="overview" className="block text-sm font-medium text-gray-300 mb-2">Tổng quan</label>
                                <Textarea
                                    id="overview"
                                    value={overview}
                                    onChange={(e) => setOverview(e.target.value)}
                                    className="bg-[#262626] border-slate-700 focus:border-primary focus:ring-primary min-h-[100px]"
                                    maxLength={1000}
                                />
                                <p className="text-xs text-gray-500 text-right mt-1">{overview.length}/1000 từ</p>
                            </div>

                            <GenreSelect />

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Loại phim</label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                       <Card
                                        className={`flex-1 p-4 cursor-pointer transition-all border ${
                                            selectedMovieType === 'single'
                                                ? 'bg-[#E50914]/20 border-[#E50914]'
                                                : 'bg-[#262626] border-slate-700 hover:border-slate-500'
                                        }`}
                                        onClick={() => setSelectedMovieType('single')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Film className={`w-6 h-6 ${selectedMovieType === 'single' ? 'text-[#E50914]' : 'text-gray-400'}`} />
                                            <div>
                                                <h3 className="font-semibold text-white">Phim lẻ</h3>
                                                <p className="text-xs text-gray-400">Phim chỉ có một tập.</p>
                                            </div>
                                        </div>
                                    </Card>
                                       <Card
                                        className={`flex-1 p-4 cursor-pointer transition-all border ${
                                            selectedMovieType === 'series'
                                                ? 'bg-[#E50914]/20 border-[#E50914]'
                                                : 'bg-[#262626] border-slate-700 hover:border-slate-500'
                                        }`}
                                        onClick={() => setSelectedMovieType('series')}
                                    >
                                           <div className="flex items-center gap-3">
                                            <Tv className={`w-6 h-6 ${selectedMovieType === 'series' ? 'text-[#E50914]' : 'text-gray-400'}`} />
                                            <div>
                                                <h3 className="font-semibold text-white">Phim bộ</h3>
                                                <p className="text-xs text-gray-400">Loạt phim dài tập.</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Step 2 Content --- (Giữ nguyên) */}
                {currentStep === 2 && (
                    <>
                        {/* --- PHIM LẺ --- */}
                        {selectedMovieType === 'single' && (
                            <div className="flex flex-col items-center justify-center h-full space-y-8 p-4 md:p-8">
                                
                                <h2 className="text-3xl font-semibold text-white">THÊM PHIM LẺ MỚI</h2>

                                <FileVideo className="w-40 h-40 text-slate-700" />
                                
                                <div className="w-full max-w-lg mx-auto space-y-2">
                                    <label 
                                        htmlFor="single-movie-upload" 
                                        className="text-sm font-medium text-gray-300"
                                    >
                                        File phim
                                    </label>

                                    <div 
                                        className="w-full h-14 px-4 bg-white/10 border border-slate-700 rounded-lg flex justify-between items-center cursor-pointer hover:border-slate-500 transition-colors"
                                        onClick={() => singleFileRef.current?.click()}
                                    >
                                        <span className={cn(
                                            "font-medium truncate pr-2",
                                            singleMovieFile ? "text-white" : "text-gray-400"
                                        )}>
                                            {singleMovieFile ? singleMovieFile.name : "Nhấn để chọn file (video.mp4, .mkv...)"}
                                        </span>
                                        <FileUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    </div>

                                    <input
                                        id="single-movie-upload"
                                        ref={singleFileRef}
                                        type="file"
                                        accept="video/*" // Chỉ chấp nhận video
                                        className="hidden"
                                        onChange={handleSingleFileChange}
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* --- PHIM BỘ --- */}
                        {selectedMovieType === 'series' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-white">QUẢN LÝ MÙA VÀ TẬP PHIM</h2>
                                {/* Quản lý mùa */}
                                <div>
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1">
                                            <label htmlFor="seasonNameInput" className="block text-sm font-medium text-gray-300 mb-1">Tên mùa</label>
                                            <Input 
                                                id="seasonNameInput"
                                                className="bg-white/10 border-slate-700"
                                                value={newSeasonName}
                                                onChange={(e) => setNewSeasonName(e.target.value)}
                                            />
                                        </div>
                                        <Button 
                                            className="bg-[#E50914] hover:bg-[#b80710] flex-shrink-0"
                                            onClick={handleAddNewSeason}
                                        >
                                            Thêm mùa mới <Plus className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Để trống nếu phim chỉ có một mùa.</p>
                                </div>
                                
                                {seasons.length > 0 && (
                                    <>
                                        {/* Dropdown chọn mùa */}
                                        <div>
                                            <label htmlFor="seasonSelect" className="block text-sm font-medium text-gray-300 mb-1">Chỉnh sửa mùa</label>
                                            <Select
                                                value={selectedSeasonId || ''}
                                                onValueChange={handleSeasonSelect}
                                            >
                                                <SelectTrigger id="seasonSelect" className="w-full bg-white/10 border-slate-700">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#262626] border-slate-700 text-white">
                                                    {seasons.map(season => (
                                                        <SelectItem key={season.id} value={season.id}>
                                                            {season.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <hr className="border-slate-700" />

                                        {/* Danh sách tập phim */}
                                        <h3 className="text-lg font-semibold text-white">Danh sách tập</h3>
                                        <div className="space-y-4">
                                            {currentSelectedSeason?.episodes.map((episode, index) => (
                                                <Card key={episode.id} className="p-4 bg-white/5 border-slate-700 relative">
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        {/* Số tập */}
                                                        <div className="flex-shrink-0">
                                                            <label className="block text-sm font-medium text-gray-300 mb-1">Tập</label>
                                                            <Input 
                                                                value={`Tập ${index + 1}`}
                                                                readOnly 
                                                                className="bg-white/10 border-slate-600 w-full md:w-24 text-center" 
                                                            />
                                                        </div>
                                                        
                                                        {/* Thông tin tập */}
                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label htmlFor={`ep_title_${episode.id}`} className="block text-sm font-medium text-gray-300 mb-1">Tiêu đề tập</label>
                                                                <Input 
                                                                    id={`ep_title_${episode.id}`}
                                                                    value={episode.title}
                                                                    onChange={(e) => handleEpisodeChange(episode.id, 'title', e.target.value)}
                                                                    className="bg-white/10 border-slate-600"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label htmlFor={`ep_duration_${episode.id}`} className="block text-sm font-medium text-gray-300 mb-1">Thời lượng</label>
                                                                <Input 
                                                                    id={`ep_duration_${episode.id}`}
                                                                    type="number"
                                                                    value={episode.duration}
                                                                    onChange={(e) => handleEpisodeChange(episode.id, 'duration', e.target.valueAsNumber || 0)}
                                                                    className="bg-white/10 border-slate-600"
                                                                    min="0"
                                                                />
                                                                <p className="text-xs text-gray-500 mt-1">Tính bằng phút.</p>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label htmlFor={`ep_file_${episode.id}`} className="block text-sm font-medium text-gray-300 mb-1">File phim</label>
                                                                <div className="flex">
                                                                    <Input 
                                                                        id={`ep_file_${episode.id}`}
                                                                        value={episode.fileName || "Chưa chọn file"} 
                                                                        readOnly 
                                                                        className="bg-white/10 border-slate-600 rounded-r-none focus-visible:ring-offset-0 focus-visible:ring-0" 
                                                                        onClick={() => episodeFileRefs.current[`s${selectedSeasonId}-e${episode.id}`]?.click()}
                                                                    />
                                                                    <Button 
                                                                        variant="outline" 
                                                                        className="bg-white/20 border-slate-600 border-l-0 rounded-l-none hover:bg-white/30 px-3"
                                                                        onClick={() => episodeFileRefs.current[`s${selectedSeasonId}-e${episode.id}`]?.click()}
                                                                    >
                                                                        <Upload className="w-4 h-4" />
                                                                    </Button>
                                                                    <input 
                                                                        type="file" 
                                                                        ref={(el) => { episodeFileRefs.current[`s${selectedSeasonId}-e${episode.id}`] = el; }}
                                                                        className="hidden" 
                                                                        onChange={(e) => handleEpisodeFileChange(episode.id, e)}
                                                                        accept="video/*"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Nút Xóa tập */}
                                                    {currentSelectedSeason && currentSelectedSeason.episodes.length > 1 && (
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

                                        {/* Nút Thêm tập */}
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
                        
                        {selectedMovieType === null && (
                            <div className="text-center text-gray-400">
                                {/* ... (Fallback) ... */}
                            </div>
                        )}
                    </>
                )}
                
                {/* --- Step 3 Content --- */}
                {currentStep === 3 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-white">THÊM ĐẠO DIỄN & DIỄN VIÊN</h2>
                    
                    <Card className="bg-[#262626] border-slate-700 text-white">
                    <CardHeader>
                        <div className="flex justify-between items-center gap-4">
                        
                        {/* 1. Nút Thêm & Info */}
                        <div className="flex items-center gap-2">
                            <Button 
                            className="bg-[#E50914] hover:bg-[#b80710]"
                            onClick={() => setAddPersonOpen(true)}
                            >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm thành viên
                            </Button>
                        </div>
                        
                        {/* 2. Sắp xếp (Giữ nguyên) */}
                        <div className="w-45">
                            <Select defaultValue="az">
                            <SelectTrigger id="sort" className="w-full bg-white/10 border-slate-600">
                                <SelectValue placeholder="Sắp xếp theo" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#262626] border-slate-700 text-white">
                                <SelectItem value="az">Sắp xếp theo: A-Z</SelectItem>
                                <SelectItem value="za">Sắp xếp theo: Z-A</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent>
                        <div className="space-y-4">
                        {/* 3. Tiêu đề Bảng (Giữ nguyên) */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-slate-700 font-semibold text-gray-400 text-sm">
                            <div className="col-span-5">Tên</div>
                            <div className="col-span-4">Nhân vật</div>
                            <div className="col-span-3 text-right">Thao tác</div>
                        </div>

                        {/* 4. Danh sách thành viên (Giữ nguyên) */}
                        <div className="space-y-3">
                            {people.map((person) => (
                            <div 
                                key={person.id} 
                                className="grid grid-cols-12 gap-4 items-center px-4 py-2 rounded-md hover:bg-white/5"
                            >
                                {/* Tên */}
                                <div className="col-span-5 flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-slate-600">
                                    <AvatarImage src={person.avatarUrl || ''} alt={person.name} />
                                    <AvatarFallback className="bg-slate-700 text-xs">
                                    {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{person.name}</span>
                                </div>
                                
                                {/* Nhân vật */}
                                <div className="col-span-4 text-gray-300">
                                {person.character}
                                </div>

                                {/* Thao tác */}
                                <div className="col-span-3 flex justify-end items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/40 hover:text-blue-300"
                                    onClick={() => handleEditPerson(person.id)}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/40 hover:text-red-300"
                                    onClick={() => handleRemovePerson(person.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end pt-4">
                        {/* 5. Phân trang (Pagination) (Giữ nguyên) */}
                        <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="bg-white/10 border-slate-700 hover:bg-white/20">
                            <ChevronLeft className="w-4 h-4" /> 
                        </Button>
                        <span className="text-sm text-gray-400">Trang 1/1</span>
                        <Button variant="outline" size="icon" className="bg-white/10 border-slate-700 hover:bg-white/20">
                            <ChevronRight className="w-4 h-4" /> 
                        </Button>
                        </div>
                    </CardFooter>
                    </Card>
                    <AddActorDialog 
                    open={isAddPersonOpen}
                    onOpenChange={setAddPersonOpen}
                    onAddActor={handleAddPersonSubmit} 
                    />
                </div>
                )}
                {/* ----------------------------------- */}

                {/* --- Nút điều hướng --- */}
                <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between items-center">
                    <Button 
                        onClick={handlePrevStep} 
                        variant="outline" 
                        className="bg-gray-600 hover:bg-gray-500 border-slate-700"
                        style={{ visibility: currentStep > 1 ? 'visible' : 'hidden' }}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    
                    <Button 
                        onClick={handleNextStep} 
                        className="bg-[#E50914] hover:bg-[#b80710]"
                        disabled={currentStep === 1 && selectedMovieType === null}
                    >
                        {currentStep === steps.length ? 'Đăng phim' : 'Tiếp tục'}
                        
                        {currentStep < steps.length && (
                            <ChevronRight className="w-4 h-4 ml-2" />
                        )}
                    </Button>
                </div>

            </div>
        </div>
    );
}