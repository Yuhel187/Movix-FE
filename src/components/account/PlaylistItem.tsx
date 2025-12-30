"use client";

import { Play, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PlaylistItemCardProps {
  title: string;
  movieCount: number;
  isActive?: boolean;
  onClick?: () => void;
  onEditClick?: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
}

export function PlaylistItemCard({
  title,
  movieCount,
  isActive = false,
  onClick,
  onEditClick,
  onDeleteClick,
}: PlaylistItemCardProps) {
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (onEditClick) onEditClick(e);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteClick) onDeleteClick(e);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex h-[72px] w-56 flex-shrink-0 cursor-pointer items-center justify-between rounded-lg border-2 bg-zinc-800/50 p-4 transition-all",
        isActive
          ? "border-red-600" 
          : "border-zinc-700 hover:border-zinc-600" 
      )}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-white" />
          <span className="font-semibold text-white line-clamp-1 max-w-[100px]">{title}</span>
        </div>
        <span className="text-sm text-gray-400">{movieCount} phim</span>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-zinc-700"
          onClick={handleEdit}
          title="Đổi tên"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-zinc-700"
          onClick={handleDelete}
          title="Xóa playlist"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}