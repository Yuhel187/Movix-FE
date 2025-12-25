"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SpoilerWarningProps {
  children: React.ReactNode;
}

export function SpoilerWarning({ children }: SpoilerWarningProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (isRevealed) {
    return <div className="text-gray-300 whitespace-pre-line break-words">{children}</div>;
  }

  return (
    <div className="flex items-center gap-4 rounded-lg bg-zinc-800/50 p-4">
      <span className="text-sm text-yellow-400">
        Bình luận này có tiết lộ nội dung.
      </span>
      <Button
        variant="outline"
        size="sm"
        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
        onClick={() => setIsRevealed(true)}
      >
        Hiển thị
      </Button>
    </div>
  );
}