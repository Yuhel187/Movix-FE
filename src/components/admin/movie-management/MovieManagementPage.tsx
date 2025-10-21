"use client";

import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trash, Plus, Image as ImageIcon, Edit } from "lucide-react";
import { SearchBar } from "@/components/common/search-bar";
import { GenreSelect } from "@/components/movie/GenreSelect"
import { ActorCard } from "@/components/movie/ActorCard";
import { Label } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { MovieTypeSelect } from "@/components/movie/MovieTypeSelect";

export default function MovieManagement() {
  const [title, setTitle] = useState("Dr. Stone");
  const [year, setYear] = useState("1999");
  const [country, setCountry] = useState("Nhật Bản");
  const [tags, setTags] = useState<string[]>(["Kinh dị", "Trinh thám", "Tình cảm"]);
  const [newTag, setNewTag] = useState("");
  const [movieType, setMovieType] = useState("single")
  
  const [actors, setActors] = useState<
    { id: string; name: string; avatar?: string }[]
  >([
    { id: "a1", name: "Henry Johnson", avatar: "/images/testavt.webp" },
    { id: "a2", name: "Henry Johnson", avatar: "/images/testavt.webp" },
    { id: "a3", name: "Henry Johnson", avatar: "/images/testavt.webp" },
  ]);
  const [newActorName, setNewActorName] = useState("");
  const [episodes, setEpisodes] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState<"hidden" | "published">("hidden");
  // Poster / frame
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(
    "/poster-placeholder.jpg"
  );
  const handleEditEpisodes = () => {
    alert("Mở giao diện chỉnh sửa tập phim...")
  }

  // Helpers
  function addTag() {
    const t = newTag.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((s) => [...s, t]);
    setNewTag("");
  }
  function removeTag(idx: number) {
    setTags((s) => s.filter((_, i) => i !== idx));
  }

  function addActor() {
    const n = newActorName.trim();
    if (!n) return;
    setActors((s) => [
      ...s,
      { id: `a${Date.now()}`, name: n, avatar: "/avatar.jpg" },
    ]);
    setNewActorName("");
  }
  function removeActor(id: string) {
    setActors((s) => s.filter((a) => a.id !== id));
  }

  function addEpisode() {
    const id = `ep${Date.now()}`;
    setEpisodes((s) => [...s, { id, name: `Tập ${s.length + 1}` }]);
  }
  function removeEpisode() {
    setEpisodes((s) => s.slice(0, -1));
  }

  function onPickPoster(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPosterUrl(url);
  }

  function handleSave() {
    alert("Lưu (demo). Implement API call ở đây.");
  }

  function handleDeleteMovie() {
    if (!confirm("Bạn có chắc muốn xóa phim này?")) return;
    alert("Xóa (demo). Implement delete API.");
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-6 ml-15">
        {/* MAIN FORM (center) */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="bg-[#0f0f10] border border-primary">
            <div className="flex justify-between items-center">
                <CardHeader>
                    <CardTitle className="text-white text-lg w-100">Quản lý phim</CardTitle>
                </CardHeader>
                
            </div>
            

            <CardContent>
              {/* Form row: title / year / country */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-300">Tên phim</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full px-3 py-2 bg-[#0b0b0b] border border-primary rounded text-white"
                    placeholder="Tên phim"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Năm sản xuất</label>
                  <input
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="mt-2 w-full px-3 py-2 bg-[#0b0b0b] border border-primary rounded text-white"
                    placeholder="1999"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Quốc gia</label>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-2 w-full px-3 py-2 bg-[#0b0b0b] border border-primary rounded text-white"
                    placeholder="Quốc gia"
                  />
                </div>
              </div>

              {/* Tags */}
              <GenreSelect />

              {/* Actors row */}
              <div className="mt-6">
                <label className="text-sm text-slate-300">Đạo diễn - Diễn viên tham gia</label>
                <div className="mt-4 flex items-center gap-5 overflow-x-auto py-1">
                    {actors.map((actor) => (
                        <ActorCard
                        key={actor.id}
                        name={actor.name}
                        imageUrl={actor.avatar || "/avatar.jpg"}
                        layout="vertical"
                        onRemove={() => removeActor(actor.id)}
                        />
                    ))}
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 border border-primary text-slate-300 bg-amber-500 hover:bg-amber-600 hover:text-slate-300"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm diễn viên
                    </Button>
                    </div>

              </div>

              {/* Episodes */}
              <div className="mt-6">
                <label className="text-sm text-slate-300">Loại phim</label>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <MovieTypeSelect value={movieType} onChange={setMovieType}/>
                    {/* Nếu là phim bộ → hiện nút chỉnh sửa tập */}
                    {movieType === "series" && (
                    <Button
                        onClick={handleEditEpisodes}
                        className="bg-amber-500 text-white hover:bg-amber-600 ml-2"
                    >
                        <Edit className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">Chỉnh sửa tập phim</span>
                    </Button>
                    )}
                </div>
                </div>

              {/* Status and description */}
              <div className="mt-6 gap-4 items-start">
                <div>
                  <label className="text-sm text-slate-300">Trạng thái phim</label>
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => setStatus("hidden")}
                      className={`px-3 py-2 rounded ${status === "hidden" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300"}`}
                    >
                      Ẩn phim
                    </button>
                    <button
                      onClick={() => setStatus("published")}
                      className={`px-3 py-2 rounded ${status === "published" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300"}`}
                    >
                      Hiển thị
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-sm text-slate-300">Giới thiệu phim</label>
                  <textarea
                    className="mt-2 w-full px-3 py-3 bg-[#0b0b0b] border border-primary rounded text-white min-h-[120px]"
                    placeholder="Giới thiệu phim..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* RIGHT PANEL (Frame) */}
        <div className="col-span-12 lg:col-span-4 h-full flex-1">
        <div className="sticky top-0 space-y-4 ">
            <SearchBar />
            <Card className="bg-[#0f0f10] border-none h-full flex flex-col">
                <CardContent className="flex flex-col h-full p-5 justify-between">
                    
                    {/* Poster Preview */}
                    <div className="w-full">
                    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border-none bg-black">
                        {posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={posterUrl}
                            alt="poster"
                            className="w-full h-full object-cover"
                        />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-10 h-10" />
                        </div>
                        )}
                    </div>
                    {/* Meta Info */}
                    <div className="flex justify-center mt-2 text-xl text-white">
                        Doraemon
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 gap-3 text-slate-400 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-800 px-2 py-1 rounded">1h 30min</div>
                        <div className="">·</div>
                        <div className="bg-slate-800 px-2 py-1 rounded">2K</div>
                    </div>
                    <div className="text-right">Rating: 7.8</div>
                    </div>

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={onPickPoster}
                        className="hidden"
                    />

                    <div className="flex gap-3 mt-3">
                        <Button
                        onClick={() => fileRef.current?.click()}
                        className="bg-blue-600 text-white flex-1"
                        >
                        <ImageIcon className="w-4 h-4" />
                        <span className="ml-2">Chọn Avatar</span>
                        </Button>

                        <Button
                        onClick={() => fileRef.current?.click()}
                        className="bg-slate-700 text-white flex-1"
                        >
                        <span>Chọn Banner</span>
                        </Button>
                    </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col gap-3">
                    <Button
                        onClick={handleSave}
                        className="bg-blue-600 text-white w-full py-5 text-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Lưu thay đổi
                    </Button>

                    <Button
                        onClick={handleDeleteMovie}
                        className="bg-rose-600 text-white w-full py-5 text-sm"
                    >
                        <Trash className="w-4 h-4 mr-2" />
                        Xóa phim
                    </Button>
                    </div> 
                </CardContent>
            </Card>
        </div>
        </div>
      </div>
    </div>
  );
}
