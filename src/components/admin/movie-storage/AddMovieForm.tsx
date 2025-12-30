/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getPersonAvatarUrl } from "@/lib/tmdb";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIconLucide,
  ArrowLeft,
  Image as ImageIcon,
  Film,
  Tv,
  ChevronRight,
  ChevronLeft,
  Plus,
  Bot,
  Sparkles,
  Loader2,
  Trash2,
  Info,
  Pencil,
  Download,
  FileVideo,
} from "lucide-react";

import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { CountrySelect } from "@/components/movie/CountrySelect";
import { GenreCombobox, Genre } from "@/components/movie/GenreCombobox";

import { cn } from "@/lib/utils";
import { AddActorDialog } from "@/components/movie/AddActorDialog";
import { EditPersonDialog } from "@/components/movie/EditPersonDialog";

const countryIsoMap: { [key: string]: string } = {
  US: "mỹ",
  KR: "hàn quốc",
  JP: "nhật bản",
  GB: "anh",
  CN: "trung quốc",
  FR: "pháp",
  TH: "thái lan",
  DE: "đức",
  AU: "úc",
  CA: "canada",
  HK: "hồng kông",
  TW: "đài loan",
  VN: "việt nam",
};

const countryMap: { [key: string]: string } = {
  "United States of America": "mỹ",
  "South Korea": "hàn quốc",
  Japan: "nhật bản",
  "United Kingdom": "anh",
  China: "trung quốc",
  France: "pháp",
  Thailand: "thái lan",
  Germany: "đức",
  Australia: "úc",
  Canada: "canada",
  "Hong Kong": "hồng kông",
  Taiwan: "đài loan",
  Vietnam: "việt nam",
};

const steps = [
  { id: 1, title: "Thông tin phim" },
  { id: 2, title: "Tải phim lên" },
  { id: 3, title: "Đạo diễn & Diễn viên tham gia" },
];

interface AddMovieFormProps {
  onClose: () => void;
}

// --- Type cho Episode (Step 2) ---
type Episode = {
  id: number;
  title: string;
  duration: number;
  fileName: string;
  video_image_url?: string;
};

// --- Type cho Season (Step 2) ---
type Season = {
  id: string;
  name: string;
  episodes: Episode[];
  nextEpisodeId: number;
};

// --- Type cho Person (Step 3) ---
type Person = {
  id: string | number;
  name: string;
  character?: string;
  avatarUrl?: string | null;
  role?: string;
  biography?: string | null;
  birthday?: string | null;
  gender?: number | null;
};

export default function AddMovieForm({ onClose }: AddMovieFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const [tmdbId, setTmdbId] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [movieTitle, setMovieTitle] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
  const [releaseDate, setReleaseDate] = useState<Date | undefined>();
  const [overview, setOverview] = useState("");
  const [selectedMovieType, setSelectedMovieType] = useState<
    "single" | "series" | null
  >(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const backdropInputRef = useRef<HTMLInputElement>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [isTmdbDataLoaded, setIsTmdbDataLoaded] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [voteAverage, setVoteAverage] = useState<number>(0);
  const [aiQuery, setAiQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);

  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isEditPersonOpen, setIsEditPersonOpen] = useState(false);

  const handleAskAiForTmdb = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const prompt = `
                Tôi là Admin. Hãy tìm chính xác TMDB ID của phim: "${aiQuery}". 
                Yêu cầu trả lời DUY NHẤT một chuỗi JSON hợp lệ với định dạng: 
                { "id": "12345", "type": "movie" } nếu là phim lẻ, hoặc { "id": "67890", "type": "tv" } nếu là phim bộ/TV Series.
                Nếu không tìm thấy, trả về { "id": null, "type": null }. 
                Không thêm bất kỳ lời giải thích hay markdown (backticks) nào khác.
            `;

      const res = await apiClient.post("/ai/chat", {
        message: prompt,
        mode: "raw",
      });

      let reply = res.data.reply;
      reply = reply
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        const data = JSON.parse(reply);

        if (data.id) {
          setTmdbId(data.id.toString());

          if (
            data.type &&
            (data.type.toLowerCase() === "tv" ||
              data.type.toLowerCase() === "series")
          ) {
            setSelectedMovieType("series");
            toast.success(
              `AI: Tìm thấy Phim bộ (ID: ${data.id}). Đã tự động chọn loại Phim bộ.`
            );
          } else {
            setSelectedMovieType("single");
            toast.success(
              `AI: Tìm thấy Phim lẻ (ID: ${data.id}). Đã tự động chọn loại Phim lẻ.`
            );
          }

          setIsAiPopoverOpen(false);
        } else {
          toast.error("AI không tìm thấy phim này trên TMDB.");
        }
      } catch (parseError) {
        console.error("Lỗi parse JSON từ AI:", reply);
        toast.error(
          "AI trả về định dạng không đúng. Vui lòng thử lại cụ thể hơn."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối với dịch vụ AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleEditPersonClick = (id: string | number) => {
    const p = people.find((item) => item.id === id);
    if (p) {
      setEditingPerson(p);
      setIsEditPersonOpen(true);
    }
  };

  const handleSaveEditedPerson = (updated: Person) => {
    setPeople((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    toast.success("Đã cập nhật thông tin.");
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await apiClient.get("/movies/genres");
        if (Array.isArray(res.data)) {
          setAllGenres(res.data);
        }
      } catch (error) {
        console.error("Lỗi tải thể loại:", error);
      }
    };
    fetchGenres();
  }, []);

  const [singleMovieFile, setSingleMovieFile] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [selectedSeasonId, setSelectedSeasonId] = useState("");

  const [people, setPeople] = useState<Person[]>([]);
  const [isAddPersonOpen, setAddPersonOpen] = useState(false);

  const resetFetchedData = () => {
    setMovieTitle("");
    setOriginalTitle("");
    setSelectedCountry(undefined);
    setReleaseDate(undefined);
    setOverview("");
    setPosterPreview(null);
    setBackdropPreview(null);
    setSelectedGenres([]);
    setTrailerUrl("");
    setVoteAverage(0);
    setDuration(0);
    setPeople([]);
    setIsTmdbDataLoaded(false);
  };

  const handleFetchTmdbData = async () => {
    if (!tmdbId) {
      toast.error("Vui lòng nhập TMDB ID");
      return;
    }

    if (!selectedMovieType) {
      toast.error("Vui lòng chọn 'Phim lẻ' hoặc 'Phim bộ' trước khi fetch.");
      return;
    }

    setIsFetching(true);
    try {
      let res;
      if (selectedMovieType === "single") {
        res = await apiClient.get(`/movies/tmdb/details/${tmdbId}`);
      } else {
        res = await apiClient.get(`/movies/tmdb/tv/${tmdbId}`);
      }
      const data = res.data;

      setMovieTitle(data.title);
      setVoteAverage(data.vote_average || 0);
      setDuration(data.runtime || 0);
      setOriginalTitle(data.original_title);
      setOverview(data.overview);
      if (data.release_date) {
        setReleaseDate(new Date(data.release_date));
      }
      setPosterPreview(data.poster_url);
      setBackdropPreview(data.backdrop_url); 
      if (data.production_country) {
        const mappedIso = countryIsoMap[data.production_country];
        const mappedName = countryMap[data.production_country];
        if (mappedIso) {
          setSelectedCountry(mappedIso);
        } else if (mappedName) {
          setSelectedCountry(mappedName);
        } else {
          console.warn(
            `Không có mapping cho quốc gia: ${data.production_country}`
          );
          setSelectedCountry(undefined);
        }
      }
      const genresFromTmdb = data.genres.map(
        (g: { id: number; name: string }) => ({
          id: g.name,
          name: g.name,
        })
      );

      setTrailerUrl(data.trailer_url || "");
      setAllGenres((prevDB) => {
        const newGenres = [...prevDB];
        genresFromTmdb.forEach((tmdbGenre: Genre) => {
          if (!prevDB.some((dbGenre) => dbGenre.name === tmdbGenre.name)) {
            newGenres.push({ id: tmdbGenre.name, name: tmdbGenre.name });
          }
        });
        return newGenres;
      });
      setSelectedGenres(genresFromTmdb);

      const castFromTmdb = data.cast.map((person: any) => ({
        id: person.id.toString(),
        name: person.name,
        character: person.character,
        avatarUrl: getPersonAvatarUrl(person.profile_path),
        role: "actor",
        biography: person.biography,
        birthday: person.birthday,
        gender: person.gender,
      }));
      const directorFromTmdb = data.director
        ? [
            {
              id: data.director.id.toString(),
              name: data.director.name,
              character: "Đạo diễn",
              avatarUrl: getPersonAvatarUrl(data.director.profile_path),
              role: "director",
              biography: data.director.biography,
              birthday: data.director.birthday,
              gender: data.director.gender,
            },
          ]
        : [];
      setPeople([...directorFromTmdb, ...castFromTmdb]);

      if (data.seasons && Array.isArray(data.seasons)) {
        const mappedSeasons: Season[] = data.seasons.map((s: any) => ({
          id: s.id?.toString() || `season-${s.season_number}-${Date.now()}`,
          name: s.name || `Mùa ${s.season_number}`,
          nextEpisodeId: (s.episodes?.length || 0) + 1,
          episodes:
            s.episodes?.map((e: any) => ({
              id: e.id || Math.random(),
              title: e.name || e.title || `Tập ${e.episode_number}`,
              duration: e.runtime || 0,
              fileName: "",
              video_image_url: e.still_path
                ? `https://image.tmdb.org/t/p/w500${e.still_path}`
                : e.video_image_url || "",
            })) || [],
        }));

        if (mappedSeasons.length > 0) {
          setSeasons(mappedSeasons);
          if (mappedSeasons[0]) setSelectedSeasonId(mappedSeasons[0].id);
        }
      }

      toast.success(`Đã tải dữ liệu cho phim: ${data.title}`);
      setIsTmdbDataLoaded(true);
      console.log(data);
    } catch (err: any) {
      console.error("Lỗi fetch TMDB:", err);
      setIsTmdbDataLoaded(false);
      
      if (err.response && err.response.status === 404) {
        if (selectedMovieType === "single") {
          toast.error(
            "Không tìm thấy Phim Lẻ (Movie) với ID này. Bạn có chắc đây là ID phim lẻ?"
          );
        } else {
          toast.error(
            "Không tìm thấy Phim Bộ (TV Show) với ID này. Bạn có chắc đây là ID phim bộ?"
          );
        }
      } else {
        toast.error("Không tìm thấy phim hoặc ID không hợp lệ. Vui lòng kiểm tra lại.");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleCreateGenreAPI = (name: string) => {
    const newGenre: Genre = { id: name, name: name };
    setAllGenres((currentDB) => [...currentDB, newGenre]);
    setSelectedGenres((currentSelected) => [...currentSelected, newGenre]);
  };
  const handleDeleteGenreAPI = (idToDelete: string) => {
    setAllGenres((currentDB) => currentDB.filter((g) => g.id !== idToDelete));
    setSelectedGenres((currentSelected) =>
      currentSelected.filter((g) => g.id !== idToDelete)
    );
  };

  const handleFormSubmit = async () => {
    const singleMovieUrl =
      selectedMovieType === "single" && singleMovieFile
        ? singleMovieFile
        : null;

    const seasonsWithFileNames = seasons.map((s) => ({
      name: s.name,
      episodes: s.episodes.map((e) => ({
        title: e.title,
        duration: e.duration,
        fileName: e.fileName,
        video_image_url: e.video_image_url,
        videoImageUrl: e.video_image_url, 
        still_path: e.video_image_url, 
      })),
    }));

    const formData = {
      tmdb_id: tmdbId,
      movieTitle,
      originalTitle,
      releaseDate,
      overview,
      posterUrl: posterPreview,
      backdropUrl: backdropPreview,
      selectedCountry,
      selectedGenres,
      selectedMovieType,
      trailerUrl: trailerUrl,
      singleMovieFile: singleMovieUrl
        ? { fileName: singleMovieUrl, duration: duration }
        : null,
      seasons: seasonsWithFileNames,
      people,
      vote_average: voteAverage,
    };

    try {
      setIsFetching(true);
      const res = await apiClient.post("/movies", formData);

      // Gửi thông báo push cho toàn bộ user
      try {
        const createdMovie = res.data?.data || res.data;
        const movieSlug = createdMovie?.slug;

        await apiClient.post("/notifications/send", {
          targetType: "all_users",
          title: "Phim mới cập bến! 🎬",
          message: `Phim "${movieTitle}" đã có mặt trên Movix. Xem ngay!`,
          url: movieSlug ? `/movies/${movieSlug}` : "/movies",
        });
      } catch (notiError) {
        console.error("Lỗi gửi thông báo:", notiError);
      }

      toast.success("Tạo phim mới thành công!");
      onClose();
    } catch (err: any) {
      console.error("Lỗi khi tạo phim:", err);
      if (err.response) {
        if (err.response.status === 409) {
          toast.error(err.response.data.message || "Phim này đã tồn tại trong hệ thống.");
        } else if (err.response.status === 400) {
          toast.error(err.response.data.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường thông tin.");
        } else if (err.response.data && err.response.data.message) {
          toast.error(err.response.data.message);
        } else {
          toast.error(`Lỗi ${err.response.status}: Không thể tạo phim.`);
        }
      } else {
        toast.error("Đã xảy ra lỗi kết nối hoặc lỗi không xác định.");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFormSubmit();
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "poster" | "backdrop"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "poster") {
          setPosterPreview(reader.result as string);
        } else {
          setBackdropPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddNewSeason = () => {
    if (newSeasonName.trim() === "") return;
    const newSeasonId = `client-id-${Date.now()}`;
    const newSeason: Season = {
      id: newSeasonId,
      name: newSeasonName,
      episodes: [{ id: 1, title: "", duration: 0, fileName: "" }],
      nextEpisodeId: 2,
    };
    setSeasons([...seasons, newSeason]);
    setNewSeasonName("");
    setSelectedSeasonId(newSeasonId);
  };

  const handleSeasonSelect = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
  };

  const handleAddEpisode = () => {
    setSeasons((prevSeasons) =>
      prevSeasons.map((season) => {
        if (season.id === selectedSeasonId) {
          const newEpisode: Episode = {
            id: season.nextEpisodeId,
            title: "",
            duration: 0,
            fileName: "",
          };
          return {
            ...season,
            episodes: [...season.episodes, newEpisode],
            nextEpisodeId: season.nextEpisodeId + 1,
          };
        }
        return season;
      })
    );
  };

  const handleRemoveEpisode = (episodeId: number) => {
    setSeasons((prevSeasons) =>
      prevSeasons.map((season) => {
        if (season.id === selectedSeasonId) {
          if (season.episodes.length > 1) {
            return {
              ...season,
              episodes: season.episodes.filter((ep) => ep.id !== episodeId),
            };
          }
        }
        return season;
      })
    );
  };

  const handleEpisodeChange = (
    episodeId: number,
    field: "title" | "duration" | "fileName" | "video_image_url",
    value: string | number
  ) => {
    setSeasons((prevSeasons) =>
      prevSeasons.map((season) => {
        if (season.id === selectedSeasonId) {
          return {
            ...season,
            episodes: season.episodes.map((ep) =>
              ep.id === episodeId ? { ...ep, [field]: value } : ep
            ),
          };
        }
        return season;
      })
    );
  };

  const handleAddPersonSubmit = (data: {
    person: any;
    characterName: string;
  }) => {
    console.log("Đã nhận từ dialog:", data);

    if (people.some((p) => p.id === data.person.id)) {
      alert("Diễn viên này đã có trong danh sách.");
      return;
    }
    const newPerson: Person = {
      id: data.person.id,
      name: data.person.name,
      character: data.characterName || "Chưa rõ",
      avatarUrl: data.person.avatarUrl || null,
      role: data.person.roles?.includes("Đạo diễn") ? "director" : "actor",
      biography: data.person.biography || null,
      birthday: data.person.birthday || null,
      gender: data.person.gender || 0,
    };

    setPeople((prev) => [newPerson, ...prev]);

    setAddPersonOpen(false);
  };

  const handleRemovePerson = (id: string | number) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const currentSelectedSeason = seasons.find((s) => s.id === selectedSeasonId);
  const isDisabled = isTmdbDataLoaded;
  return (
    <div className="flex flex-col md:flex-row w-full gap-6 text-white min-h-[calc(100vh-theme(space.16)-theme(space.12))]">
      {/* --- Sidebar Steps --- */}
      <div className="w-full md:w-60 flex-shrink-0 bg-[#262626] p-4 md:p-6 rounded-lg border border-slate-800 flex flex-col">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="self-start px-2 mb-6 text-gray-400 hover:text-white"
        >
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
                      ? "bg-[#E50914] text-white font-semibold"
                      : "text-gray-400 hover:bg-slate-700/50 hover:text-white"
                  }`}
                  onClick={() => {
                    if (step.id < currentStep) {
                      setCurrentStep(step.id);
                    }
                  }}
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full mr-3 text-xs font-bold border flex-shrink-0 ${
                      currentStep === step.id
                        ? "bg-white text-[#E50914] border-white"
                        : step.id < currentStep
                        ? "bg-green-600 border-green-500 text-white"
                        : "border-gray-500 text-gray-400"
                    }`}
                  >
                    {step.id}
                  </span>
                  {step.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex-1 bg-[#1F1F1F] p-6 rounded-lg border border-slate-800 overflow-y-auto">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="relative w-full">
              <div
                className="relative w-full h-96 rounded-md overflow-hidden bg-slate-800/50 border border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-primary group"
                onClick={() => backdropInputRef.current?.click()}
              >
                {backdropPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={backdropPreview}
                    alt="Backdrop preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
                  />
                ) : (
                  <div className="text-center text-gray-400 group-hover:text-primary transition-colors z-0">
                    <ImageIcon className="w-10 h-10 mx-auto mb-1" />
                    <p className="text-sm font-semibold">
                      Nhấn để chọn Backdrop
                    </p>
                  </div>
                )}
                <input
                  ref={backdropInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "backdrop")}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-8 -mt-[120px] relative z-10 px-6 md:px-12">
                <div className="w-full md:w-[300px] flex-shrink-0 space-y-2 mx-auto md:mx-0 md:ml-4 lg:ml-8">
                  <div
                    className="aspect-[2/3] relative w-full rounded-md overflow-hidden bg-slate-700 border-4 border-[#1F1F1F] shadow-lg cursor-pointer group hover:border-primary"
                    onClick={() => posterInputRef.current?.click()}
                  >
                    {posterPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={posterPreview}
                        alt="Poster preview"
                        className="object-cover w-full h-full"
                      />
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
                      onChange={(e) => handleFileChange(e, "poster")}
                    />
                  </div>
                  <p
                    className="text-xs text-gray-400 underline cursor-pointer hover:text-primary text-center"
                    onClick={() => posterInputRef.current?.click()}
                  >
                    Nhấn để chọn poster
                  </p>
                </div>
                <div className="flex-1 space-y-6 pt-20 md:pt-28 lg:pt-32">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Loại phim
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Card
                        className={`flex-1 p-4 cursor-pointer transition-all border ${
                          selectedMovieType === "single"
                            ? "bg-[#E50914]/20 border-[#E50914]"
                            : "bg-[#262626] border-slate-700 hover:border-slate-500"
                        }`}
                        onClick={() => {
                          if (selectedMovieType !== "single") {
                            setSelectedMovieType("single");
                            resetFetchedData();
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Film
                            className={`w-6 h-6 ${
                              selectedMovieType === "single"
                                ? "text-[#E50914]"
                                : "text-gray-400"
                            }`}
                          />
                          <div>
                            <h3 className="font-semibold text-white">
                              Phim lẻ
                            </h3>
                            <p className="text-xs text-gray-400">
                              Phim chỉ có một tập.
                            </p>
                          </div>
                        </div>
                      </Card>
                      <Card
                        className={`flex-1 p-4 cursor-pointer transition-all border ${
                          selectedMovieType === "series"
                            ? "bg-[#E50914]/20 border-[#E50914]"
                            : "bg-[#262626] border-slate-700 hover:border-slate-500"
                        }`}
                        onClick={() => {
                          if (selectedMovieType !== "series") {
                            setSelectedMovieType("series");
                            resetFetchedData();
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Tv
                            className={`w-6 h-6 ${
                              selectedMovieType === "series"
                                ? "text-[#E50914]"
                                : "text-gray-400"
                            }`}
                          />
                          <div>
                            <h3 className="font-semibold text-white">
                              Phim bộ
                            </h3>
                            <p className="text-xs text-gray-400">
                              Loạt phim dài tập.
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Tải dữ liệu từ TMDB (Movie)
                    </label>
                    <div className="flex gap-2">
                      <InputGroup className="flex-1">
                        <InputGroupInput
                          placeholder="Nhập TMDB Movie ID (ví dụ: 603)"
                          className="h-full rounded-l-md bg-[#262626] border-none"
                          value={tmdbId}
                          onChange={(e) => setTmdbId(e.target.value)}
                        />
                        <InputGroupButton
                          className="bg-blue-600 hover:bg-blue-700 text-white h-full rounded-md"
                          onClick={handleFetchTmdbData}
                          disabled={isFetching}
                        >
                          {isFetching ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </InputGroupButton>
                      </InputGroup>

                      <Popover
                        open={isAiPopoverOpen}
                        onOpenChange={setIsAiPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="bg-[#262626] border-slate-700 hover:border-purple-500 text-purple-400"
                            title="Hỏi AI tìm ID"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Hỏi AI
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-80 bg-[#1F1F1F] border-slate-700 text-white p-4"
                          side="right"
                          align="start"
                        >
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-purple-400">
                              <Bot className="w-4 h-4" /> Trợ lý tìm mã phim
                            </h4>
                            <p className="text-xs text-gray-400">
                              Nhập tên phim, AI sẽ tìm ID giúp bạn.
                            </p>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Ví dụ: Đào, Phở và Piano"
                                className="h-9 text-sm bg-black/20 border-slate-600"
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleAskAiForTmdb()
                                }
                              />
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={handleAskAiForTmdb}
                                disabled={isAiLoading}
                              >
                                {isAiLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Tìm"
                                )}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="movieTitle"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Tên phim
                    </label>
                    <Input
                      id="movieTitle"
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      className="bg-[#262626] border-slate-700 focus:border-primary "
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="posterUrlInput"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Poster URL
                      </label>
                      <Input
                        id="posterUrlInput"
                        placeholder="https://image.tmdb.org/..."
                        value={posterPreview || ""}
                        onChange={(e) => setPosterPreview(e.target.value)}
                        className="bg-[#262626] border-slate-700 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="backdropUrlInput"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Backdrop URL
                      </label>
                      <Input
                        id="backdropUrlInput"
                        placeholder="https://image.tmdb.org/..."
                        value={backdropPreview || ""}
                        onChange={(e) => setBackdropPreview(e.target.value)}
                        className="bg-[#262626] border-slate-700 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 px-6 md:px-12">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Quốc gia
                </label>
                <CountrySelect
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                />
              </div>
              <div>
                <label
                  htmlFor="releaseDate"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Ngày phát hành
                </label>
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
                      {releaseDate ? (
                        format(releaseDate, "PPP", { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-[#262626] border-slate-700 text-white"
                    align="start"
                  >
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
              <div>
                <label className="text-sm text-slate-300">Thể loại</label>
                <GenreCombobox
                  allGenres={allGenres}
                  selectedGenres={selectedGenres}
                  onChange={(newSelection) => setSelectedGenres(newSelection)}
                  onCreate={handleCreateGenreAPI}
                  onDelete={handleDeleteGenreAPI}
                  className="mt-2"
                />
              </div>

              <div>
                <label
                  htmlFor="trailerUrlInput"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Trailer URL
                </label>
                <Input
                  id="trailerUrlInput"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={trailerUrl || ""}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                  className="bg-[#262626] border-slate-700 focus:border-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="overview"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Tổng quan
                </label>
                <Textarea
                  id="overview"
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="bg-[#262626] border-slate-700 focus:border-primary focus:ring-primary min-h-[100px]"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 text-right mt-1">
                  {overview.length}/1000 từ
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <>
            {selectedMovieType === null && (
              <div className="flex flex-col items-center justify-center h-full space-y-4 p-8 text-center text-gray-400">
                <Info className="w-16 h-16 text-slate-700" />
                <h2 className="text-2xl font-semibold text-white">
                  Chưa chọn loại phim
                </h2>
                <p>
                  Vui lòng quay lại Bước 1 và chọn &quot;Phim lẻ&quot; hoặc
                  &quot;Phim bộ&quot; để tiếp tục.
                </p>
              </div>
            )}
            {/* --- PHIM LẺ --- */}
            {selectedMovieType === "single" && (
              <div className="flex flex-col items-center justify-center h-full space-y-8 p-4 md:p-8">
                <h2 className="text-3xl font-semibold text-white">
                  THÊM PHIM LẺ MỚI
                </h2>

                <FileVideo className="w-40 h-40 text-slate-700" />

                <div className="w-full max-w-lg mx-auto space-y-2">
                  <Input
                    id="single-movie-upload"
                    className="bg-white/10 text-white border-slate-700 h-14 px-4"
                    placeholder="https://.../video.m3u8 hoặc video.mp4"
                    value={singleMovieFile}
                    onChange={(e) => setSingleMovieFile(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="duration"
                      className="text-sm font-medium text-gray-300 whitespace-nowrap"
                    >
                      Thời lượng (phút):
                    </label>
                    <Input
                      id="duration"
                      type="number"
                      className="bg-white/10 text-white border-slate-700"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMovieType === "series" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white">
                  QUẢN LÝ MÙA VÀ TẬP PHIM
                </h2>
                <div>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label
                        htmlFor="seasonNameInput"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Tên mùa
                      </label>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Để trống nếu phim chỉ có một mùa.
                  </p>
                </div>

                {seasons.length > 0 && (
                  <>
                    <div>
                      <label
                        htmlFor="seasonSelect"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Chỉnh sửa mùa
                      </label>
                      <Select
                        value={selectedSeasonId || ""}
                        onValueChange={handleSeasonSelect}
                      >
                        <SelectTrigger
                          id="seasonSelect"
                          className="w-full bg-white/10 border-slate-700"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#262626] border-slate-700 text-white">
                          {seasons.map((season) => (
                            <SelectItem key={season.id} value={season.id}>
                              {season.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <hr className="border-slate-700" />

                    <h3 className="text-lg font-semibold text-white">
                      Danh sách tập
                    </h3>
                    <div className="space-y-4 ">
                      {currentSelectedSeason?.episodes.map((episode, index) => (
                        <Card
                          key={episode.id}
                          className="p-4 bg-white/5 border-slate-700 relative"
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-shrink-0">
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Tập
                              </label>
                              <Input
                                value={`Tập ${index + 1}`}
                                readOnly
                                className="bg-white/10 text-white border-slate-600 w-full md:w-24 text-center"
                              />
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label
                                  htmlFor={`ep_title_${episode.id}`}
                                  className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                  Tiêu đề tập
                                </label>
                                <Input
                                  id={`ep_title_${episode.id}`}
                                  value={episode.title}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      episode.id,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  className="bg-white/10 border-slate-600 text-white"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor={`ep_duration_${episode.id}`}
                                  className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                  Thời lượng
                                </label>
                                <Input
                                  id={`ep_duration_${episode.id}`}
                                  type="number"
                                  value={episode.duration}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      episode.id,
                                      "duration",
                                      e.target.valueAsNumber || 0
                                    )
                                  }
                                  className="bg-white/10 border-slate-600 text-white"
                                  min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Tính bằng phút.
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                <label
                                  htmlFor={`ep_file_${episode.id}`}
                                  className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                  Video URL (hoặc tên file)
                                </label>
                                <Input
                                  id={`ep_file_${episode.id}`}
                                  className="bg-white/10 text-white border-slate-600"
                                  placeholder="https://.../video.m3u8 hoặc /uploads/video.mp4"
                                  value={episode.fileName || ""}
                                  onChange={(e) =>
                                    handleEpisodeChange(
                                      episode.id,
                                      "fileName",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label
                                  htmlFor={`ep_image_${episode.id}`}
                                  className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                  Ảnh Poster Tập (URL)
                                </label>
                                <div className="flex gap-4">
                                  <div className="flex-1">
                                    <Input
                                      id={`ep_image_${episode.id}`}
                                      className="bg-white/10 text-white border-slate-600"
                                      placeholder="https://.../image.jpg"
                                      value={episode.video_image_url || ""}
                                      onChange={(e) =>
                                        handleEpisodeChange(
                                          episode.id,
                                          "video_image_url",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  {episode.video_image_url && (
                                    <div className="w-24 h-14 bg-slate-800 rounded overflow-hidden border border-slate-600 flex-shrink-0">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={episode.video_image_url}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {currentSelectedSeason &&
                            currentSelectedSeason.episodes.length > 1 && (
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
              </div>
            )}
          </>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">
              THÊM ĐẠO DIỄN & DIỄN VIÊN
            </h2>

            <Card className="bg-[#262626] border-slate-700 text-white">
              <CardHeader>
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      className="bg-[#E50914] hover:bg-[#b80710]"
                      onClick={() => setAddPersonOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm thành viên
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-slate-700 font-semibold text-gray-400 text-sm">
                    <div className="col-span-5">Tên</div>
                    <div className="col-span-4">Nhân vật</div>
                    <div className="col-span-3 text-right">Thao tác</div>
                  </div>

                  <div className="space-y-3">
                    {people.map((person, index) => (
                      <div
                        key={`${person.id}-${index}`}
                        className="grid grid-cols-12 gap-4 items-center px-4 py-2 rounded-md hover:bg-white/5"
                      >
                        <div className="col-span-5 flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-600">
                            <AvatarImage
                              src={person.avatarUrl || ""}
                              alt={person.name}
                            />
                            <AvatarFallback className="bg-slate-700 text-xs">
                              {person.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{person.name}</span>
                        </div>

                        <div className="col-span-4 text-gray-300">
                          {person.character}
                        </div>

                        <div className="col-span-3 flex justify-end items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/40 hover:text-blue-300"
                            onClick={() => handleEditPersonClick(person.id)}
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/10 border-slate-700 hover:bg-white/20"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-400">Trang 1/1</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/10 border-slate-700 hover:bg-white/20"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
            <EditPersonDialog
              open={isEditPersonOpen}
              onOpenChange={setIsEditPersonOpen}
              person={editingPerson}
              onSave={handleSaveEditedPerson}
            />
            <AddActorDialog
              open={isAddPersonOpen}
              onOpenChange={setAddPersonOpen}
              onAddActor={handleAddPersonSubmit}
            />
          </div>
        )}
        <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between items-center">
          <Button
            onClick={handlePrevStep}
            variant="outline"
            className="bg-gray-600 hover:bg-gray-500 border-slate-700"
            style={{ visibility: currentStep > 1 ? "visible" : "hidden" }}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <Button
            onClick={handleNextStep}
            className="bg-[#E50914] hover:bg-[#b80710]"
            disabled={
              isFetching || (currentStep === 1 && selectedMovieType === null)
            }
          >
            {currentStep === steps.length ? "Đăng phim" : "Tiếp tục"}

            {currentStep < steps.length && (
              <ChevronRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}