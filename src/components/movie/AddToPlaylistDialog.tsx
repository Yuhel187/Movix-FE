'use client';

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    createPlaylist,
    getPlaylists,
    addMovieToPlaylist,
    Playlist,
} from '../../services/interaction.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ListPlus, Plus, Loader2 } from 'lucide-react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    movieId: string;
}

export const AddToPlaylistDialog = ({ open, onOpenChange, movieId }: Props) => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [newListName, setNewListName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchPlaylists = async () => {
                setIsLoading(true);
                try {
                    const data = await getPlaylists();
                    setPlaylists(data);
                } catch (error) {
                    toast.error('Không thể tải danh sách playlist.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPlaylists();
        }
    }, [open]);

    const handleCreatePlaylist = async () => {
        if (!newListName.trim()) {
            toast.error('Tên playlist không được để trống.');
            return;
        }
        setIsCreating(true);
        try {
            const newPlaylist = await createPlaylist(newListName);
            setPlaylists([newPlaylist, ...playlists]); 
            setNewListName('');
            toast.success(`Đã tạo playlist "${newPlaylist.name}"`);
        } catch (error) {
            toast.error('Tạo playlist thất bại.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleAddMovie = async (playlistId: string, playlistName: string) => {
        const toastId = toast.loading(`Đang thêm vào playlist "${playlistName}"...`);
        try {
            await addMovieToPlaylist(playlistId, movieId);
            toast.success(`Đã thêm vào playlist "${playlistName}".`, { id: toastId });
            onOpenChange(false);
        } catch (error: any) {
            if (error.response?.status === 409) {
                toast.info('Phim đã có trong playlist này.', { id: toastId });
            } else {
                toast.error('Thêm phim thất bại.', { id: toastId });
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Thêm vào Playlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Tạo mới */}
                    <div className="flex gap-2">
                        <Input
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="Tên playlist mới..."
                            className="bg-zinc-800 border-zinc-700"
                        />
                        <Button
                            size="icon"
                            onClick={handleCreatePlaylist}
                            disabled={isCreating}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black flex-shrink-0"
                        >
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </div>

                    {/* Danh sách hiện có */}
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {isLoading ? (
                            <p className="text-gray-400">Đang tải playlist...</p>
                        ) : playlists.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">
                                Bạn chưa có playlist nào.
                            </p>
                        ) : (
                            playlists.map((pl) => (
                                <Button
                                    key={pl.id}
                                    variant="ghost"
                                    onClick={() => handleAddMovie(pl.id, pl.name)}
                                    className="w-full justify-start gap-2 hover:bg-zinc-800"
                                >
                                    <ListPlus className="w-4 h-4 text-gray-400" />
                                    {pl.name}
                                </Button>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};