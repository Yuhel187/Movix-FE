"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Loader2, CalendarClock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { subscriptionService } from "@/services/subscription.service";
import { SubscriptionPlan } from "@/types/subscription";

export function CreatePartyDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(""); 

  const [movieQuery, setMovieQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  
  const [seasons, setSeasons] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>("");

  const [userPlan, setUserPlan] = useState<SubscriptionPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  useEffect(() => {
    if (open) {
        setLoadingPlan(true);
        subscriptionService.getUserSubscription().then((sub) => {
            if (sub && sub.status === "ACTIVE" && sub.plan) {
                setUserPlan(sub.plan);
            } else {
                setUserPlan(null);
            }
        }).catch((err) => {
            console.error("Failed to load plan", err);
            setUserPlan(null);
        }).finally(() => {
            setLoadingPlan(false);
        });
    }
  }, [open]);

  const getDefaultScheduledTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0); 
    return tomorrow.toISOString().slice(0, 16);
  };

  const handleToggleSchedule = (checked: boolean) => {
      setIsScheduled(checked);
      if (checked && !scheduledTime) {
          setScheduledTime(getDefaultScheduledTime());
      }
  };

  useEffect(() => {
      const timer = setTimeout(async () => {
          if (movieQuery.trim() && !selectedMovie) {
              try {
                  const res = await apiClient.get(`/movies/search?q=${movieQuery}`);
                  setSearchResults(res.data.movies || []);
              } catch (e) { console.error(e); }
          } else {
              setSearchResults([]);
          }
      }, 500);
      return () => clearTimeout(timer);
  }, [movieQuery, selectedMovie]);

  const handleSelectMovie = async (movie: any) => {
      setSelectedMovie(movie);
      setMovieQuery(movie.title);
      setSearchResults([]);
      setSeasons([]);
      setEpisodes([]);
      setSelectedSeasonId("");
      setSelectedEpisodeId("");

      if (movie.media_type === 'TV') {
          try {
             const res = await apiClient.get(`/movies/${movie.slug}`);
             if (res.data.seasons) setSeasons(res.data.seasons);
          } catch (e) { toast.error("Lỗi tải tập phim"); }
      }
  };

  const handleSelectSeason = (seasonId: string) => {
      setSelectedSeasonId(seasonId);
      const season = seasons.find(s => s.id === seasonId);
      setEpisodes(season?.episodes || []);
      setSelectedEpisodeId("");
  };

  const handleCreate = async () => {
    if (!userPlan?.can_create_watch_party) return toast.error("Gói cước hiện tại không hỗ trợ tạo phòng xem chung.");
    if (!title) return toast.error("Vui lòng nhập tên phòng");
    if (!selectedMovie) return toast.error("Vui lòng chọn phim");
    if (selectedMovie.media_type === 'TV' && !selectedEpisodeId) return toast.error("Vui lòng chọn tập phim");

    if (isScheduled) {
        // Kiểm tra rỗng
        if (!scheduledTime) {
            return toast.error("Vui lòng chọn đầy đủ ngày và giờ công chiếu");
        }
        
        const selectedDate = new Date(scheduledTime);
        const now = new Date();

        if (selectedDate.getTime() < now.getTime() + 5 * 60 * 1000) {
            return toast.error("Thời gian công chiếu phải lớn hơn hiện tại ít nhất 5 phút");
        }
    }

    setLoading(true);
    try {
      const payload = {
          title,
          movieId: selectedMovie.id,
          episodeId: selectedMovie.media_type === 'TV' ? selectedEpisodeId : undefined,
          isPrivate,
          scheduledAt: isScheduled ? new Date(scheduledTime).toISOString() : null
      };

      const res = await apiClient.post('/watch-party', payload);
      
      toast.success(isScheduled ? "Đã lên lịch thành công!" : "Tạo phòng thành công!");
      setOpen(false);

      setTitle("");
      setSelectedMovie(null);
      setMovieQuery("");
      setScheduledTime("");
      setIsScheduled(false);
      
      if (!isScheduled) {
          router.push(`/watch-party/${res.data.id}`);
      } else {
          window.location.reload();
      }
    } catch (error: any) {
        const msg = error.response?.data?.message || "Lỗi khi tạo phòng";
        toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-900/20">
          <Users className="w-4 h-4" /> Tạo phòng mới
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-[#1F1F1F] border-slate-800 text-white sm:max-w-[500px] overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            🍿 Tạo phòng xem chung
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!userPlan ? (
             <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>
          ) : !userPlan.can_create_watch_party ? (
             <div className="flex flex-col items-center justify-center p-6 text-center gap-4 border border-slate-700 bg-slate-800/30 rounded-lg">
                 <h3 className="font-bold text-lg text-white">Gói cước không hỗ trợ</h3>
                 <p className="text-sm text-slate-400">Bạn cần nâng cấp gói để sử dụng tính năng tạo phòng xem chung.</p>
                 <Button onClick={() => router.push('/pricing')} className="bg-red-600 hover:bg-red-700 text-white font-bold">Nâng cấp ngay</Button>
             </div>
          ) : (
          <>
          <div className="space-y-2">
            <div className="flex justify-between">
                <Label>Tên phòng</Label>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold">Tối đa: {userPlan.max_watch_party_participants} người</span>
            </div>
            <Input 
              placeholder="Vd: Cày phim cuối tuần..." 
              className="bg-black/20 border-slate-700 focus-visible:ring-red-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2 relative z-50"> 
            <Label>Chọn phim</Label>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                    placeholder="Tìm kiếm phim..." 
                    className="pl-9 bg-black/20 border-slate-700 focus-visible:ring-red-500"
                    value={movieQuery}
                    onChange={(e) => {
                        setMovieQuery(e.target.value);
                        if(selectedMovie) setSelectedMovie(null); 
                    }}
                />
            </div>
            
            {searchResults.length > 0 && !selectedMovie && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#252525] border border-slate-700 rounded-md shadow-2xl z-[9999] max-h-60 overflow-y-auto">
                    {searchResults.map((m: any) => (
                        <div 
                            key={m.id} 
                            className="flex items-center gap-3 p-2 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                            onClick={() => handleSelectMovie(m)}
                        >
                            {m.poster_url ? (
                                <img src={m.poster_url} alt="" className="w-8 h-12 object-cover rounded" />
                            ) : (
                                <div className="w-8 h-12 bg-slate-700 rounded flex-shrink-0" />
                            )}
                            <div>
                                <div className="text-sm font-medium text-white line-clamp-1">{m.title}</div>
                                <div className="text-xs text-slate-400">
                                    {m.media_type === 'TV' ? 'Phim bộ' : 'Phim lẻ'} • {new Date(m.release_date || Date.now()).getFullYear()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {selectedMovie && selectedMovie.media_type === 'TV' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 relative z-10">
                  <div className="space-y-2">
                      <Label>Mùa (Season)</Label>
                      <Select onValueChange={handleSelectSeason} value={selectedSeasonId}>
                          <SelectTrigger className="bg-black/20 border-slate-700"><SelectValue placeholder="Chọn mùa" /></SelectTrigger>
                          <SelectContent className="bg-[#252525] border-slate-700 text-white z-[100]">
                              {seasons.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.title || `Mùa ${s.season_number}`}</SelectItem>))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label>Tập (Episode)</Label>
                      <Select onValueChange={setSelectedEpisodeId} value={selectedEpisodeId} disabled={!selectedSeasonId}>
                          <SelectTrigger className="bg-black/20 border-slate-700"><SelectValue placeholder="Chọn tập" /></SelectTrigger>
                          <SelectContent className="bg-[#252525] border-slate-700 text-white z-[100]">
                              {episodes.map((e: any) => (<SelectItem key={e.id} value={e.id}>{`Tập ${e.episode_number}: ${e.title || ''}`}</SelectItem>))}
                          </SelectContent>
                      </Select>
                  </div>
              </div>
          )}

          <div className="bg-black/20 p-3 rounded-lg border border-slate-800 space-y-3 mt-4">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                <Label htmlFor="schedule-switch" className="text-base cursor-pointer flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-yellow-500" /> Lên lịch công chiếu
                </Label>
                <p className="text-xs text-slate-400">Tự động phát khi đến giờ</p>
                </div>
                <Switch 
                    id="schedule-switch"
                    checked={isScheduled} 
                    onCheckedChange={handleToggleSchedule} 
                    className="data-[state=checked]:bg-yellow-600" 
                />
            </div>
            
            {isScheduled && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <Input 
                        type="datetime-local" 
                        className="bg-black/40 border-slate-700 text-white block w-full" 
                        value={scheduledTime} 
                        onChange={(e) => setScheduledTime(e.target.value)} 
                    />
                    <p className="text-[10px] text-slate-500 mt-1">* Vui lòng chọn cả giờ và phút</p>
                </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-slate-800 relative z-0">
            <div className="space-y-0.5">
              <Label className="text-base cursor-pointer">Phòng riêng tư</Label>
              <p className="text-xs text-slate-400">Cần mã vé để tham gia</p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} className="data-[state=checked]:bg-red-600" />
          </div>

          <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-11 font-bold mt-2" onClick={handleCreate} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : (isScheduled ? "Lên lịch công chiếu" : "Tạo phòng ngay")}
          </Button>
          </>)}
        </div>
      </DialogContent>
    </Dialog>
  );
}
