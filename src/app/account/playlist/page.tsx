'use client';
import { useState, useEffect } from "react";
import { MovieCard } from "@/components/movie/MovieCard";
import { PlaylistItemCard } from "@/components/account/PlaylistItem";
import type { Movie } from "@/types/movie";
import { Button } from "@/components/ui/button";
import { ArrowRight, List, Trash2 } from "lucide-react";
import {
  getPlaylists,
  getPlaylistDetail,
  removeMovieFromPlaylist,
  updatePlaylist,
  deletePlaylist,
  Playlist,
  PlaylistMovieResponse
} from "@/services/interaction.service";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// Hàm helper để xử lý dữ liệu thiếu từ API
const getYear = (dateString?: string) => dateString ? new Date(dateString).getFullYear() : 0;

export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentMovies, setCurrentMovies] = useState<Movie[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<string | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);

  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [newName, setNewName] = useState("");

  // 1. Fetch danh sách Playlist
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setIsLoadingList(true);
        const data = await getPlaylists();
        setPlaylists(data);
        if (data.length > 0) setActivePlaylistId(data[0].id);
      } catch (err) {
        console.error("Lỗi tải playlist:", err);
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchPlaylists();
  }, []);

  // 2. Fetch chi tiết phim trong Playlist
  useEffect(() => {
    if (!activePlaylistId) return;

    const fetchDetail = async () => {
      try {
        setIsLoadingDetail(true);
        const data = await getPlaylistDetail(activePlaylistId);
        const mappedMovies: Movie[] = data.movies.map((m: PlaylistMovieResponse) => {
          const normalizedTitle = m.title || m.original_title || "Chưa cập nhật";
          const normalizedOriginal = m.original_title && m.original_title !== m.title
            ? m.original_title
            : "";

          return {
            id: m.id,
            slug: m.slug || "",
            title: normalizedTitle,
            subTitle: normalizedOriginal,
            description: m.overview || "",
            posterUrl: m.poster_url,
            backdropUrl: m.backdrop_url,
            trailerUrl: null,
            videoUrl: null,
            releaseYear: m.release_date ? new Date(m.release_date).getFullYear() : undefined,
            type: (m.media_type || "MOVIE").toUpperCase() === "TV" ? "TV" : "MOVIE",
            tags: [],
            rating: m.vote_average || 0,
            duration: undefined,
            views: 0,
          };
        });

        setCurrentMovies(mappedMovies);
      } catch (err) {
        toast.error("Không thể tải nội dung playlist");
        setCurrentMovies([]);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [activePlaylistId]);

  const handleUpdatePlaylist = async () => {
    if (!editingPlaylist || !newName.trim()) return;
    try {
      const updated = await updatePlaylist(editingPlaylist.id, newName);
      setPlaylists((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, name: updated.name } : p))
      );
      toast.success("Đã cập nhật tên playlist");
      setEditingPlaylist(null);
    } catch (error) {
      toast.error("Cập nhật thất bại");
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlistToDelete) return;
    try {
      await deletePlaylist(playlistToDelete);
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistToDelete));
      
      // If deleted active playlist, switch to another one or null
      if (activePlaylistId === playlistToDelete) {
        const remaining = playlists.filter(p => p.id !== playlistToDelete);
        setActivePlaylistId(remaining.length > 0 ? remaining[0].id : null);
      }
      
      toast.success("Đã xóa playlist");
    } catch (error) {
      toast.error("Xóa playlist thất bại");
    } finally {
      setPlaylistToDelete(null);
    }
  };

  const handleRemoveMovie = async () => {
    if (!activePlaylistId || !movieToDelete) return;
    try {
      await removeMovieFromPlaylist(activePlaylistId, movieToDelete);
      setCurrentMovies((prev) => prev.filter(m => m.id !== movieToDelete));
      setPlaylists(prev => prev.map(p =>
        p.id === activePlaylistId
          ? { ...p, _count: { playlist_movies: Math.max(0, (p._count?.playlist_movies || 1) - 1) } }
          : p
      ));

      toast.success("Đã xóa phim khỏi playlist");
    } catch (error) {
      toast.error("Xóa phim thất bại");
    } finally {
      setMovieToDelete(null);
    }
  };

  const LoadingSkeleton = () => (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[72px] w-56 rounded-lg flex-shrink-0 bg-zinc-800" />)}
    </div>
  );

  const MoviesSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-xl bg-zinc-800" />
          <Skeleton className="h-4 w-3/4 bg-zinc-800" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl space-y-8 pb-10">
      <h1 className="text-3xl font-bold text-white">Danh sách phát</h1>

      {isLoadingList ? (
        <LoadingSkeleton />
      ) : playlists.length === 0 ? (
        <div className="text-center text-gray-400 py-10 border border-dashed border-zinc-800 rounded-lg">
          <List className="w-12 h-12 mx-auto opacity-50 mb-2" />
          <p>Chưa có playlist nào</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {playlists.map((playlist) => (
              <PlaylistItemCard
                key={playlist.id}
                title={playlist.name}
                movieCount={playlist._count?.playlist_movies || 0}
                isActive={playlist.id === activePlaylistId}
                onClick={() => setActivePlaylistId(playlist.id)}
                onEditClick={() => {
                  setEditingPlaylist(playlist);
                  setNewName(playlist.name);
                }}
                onDeleteClick={() => setPlaylistToDelete(playlist.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialog xác nhận xóa Playlist */}
      <AlertDialog open={!!playlistToDelete} onOpenChange={(open) => !open && setPlaylistToDelete(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Playlist?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Hành động này không thể hoàn tác. Toàn bộ phim trong playlist sẽ bị xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlaylist} className="bg-red-600 hover:bg-red-700 text-white border-none">
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editingPlaylist} onOpenChange={(open) => !open && setEditingPlaylist(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Đổi tên Playlist</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Nhập tên mới cho playlist của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Tên playlist..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingPlaylist(null)}
              className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white"
            >
              Hủy
            </Button>
            <Button onClick={handleUpdatePlaylist} className="bg-red-600 hover:bg-red-700 text-white">
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-[300px]">
        {isLoadingDetail ? (
          <MoviesSkeleton />
        ) : currentMovies.length === 0 && activePlaylistId ? (
          <div className="text-center py-20 text-zinc-500">
            <p>Playlist này trống.</p>
          </div>
        ) : (
          <div className="dark grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {currentMovies.map((movie) => (
              <div
                key={movie.id}
                className="playlist-card relative group w-full"
              >
                <MovieCard
                  movie={movie}
                  disablePreview={true}
                />

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMovieToDelete(movie.id);
                  }}
                  className="absolute top-2.5 right-2.5 z-20 p-2 bg-black/60 hover:bg-red-600 rounded-full text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm"
                  title="Xóa khỏi playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Dialog xác nhận xóa */}
      <AlertDialog open={!!movieToDelete} onOpenChange={(open) => !open && setMovieToDelete(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phim này?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Phim sẽ bị xóa khỏi playlist hiện tại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-white">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMovie} className="bg-red-600 hover:bg-red-700 text-white border-none">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}