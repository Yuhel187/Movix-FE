"use client";

import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PlaylistItemCardProps {
  title: string;
  movieCount: number;
  isActive?: boolean;
  onClick?: () => void;
  onEditClick?: (e: React.MouseEvent) => void;
}

export function PlaylistItemCard({
  title,
  movieCount,
  isActive = false,
  onClick,
  onEditClick,
}: PlaylistItemCardProps) {
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (onEditClick) {
      onEditClick(e);
    } else {
      alert("Edit " + title); 
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex h-[72px] w-56 flex-shrink-0 cursor-pointer items-center justify-between rounded-lg border-2 bg-zinc-800/50 p-4 transition-all",
        isActive
          ? "border-red-600" 
          : "border-zinc-700 hover:border-zinc-600" 
      )}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-white" />
          <span className="font-semibold text-white line-clamp-1">{title}</span>
        </div>
        <span className="text-sm text-gray-400">{movieCount} phim</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white"
        onClick={handleEdit}
      >
        Sửa
      </Button>
    </div>
  );
}