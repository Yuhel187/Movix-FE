// src/components/movie/comments/CommentForm.tsx
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";

const currentUser = {
  name: "Huy Lê",
  avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d", 
};

interface CommentFormProps {
  onSubmit: (text: string, isSpoiler: boolean) => void;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [text, setText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const maxChars = 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text, isSpoiler);
      setText("");
      setIsSpoiler(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <Avatar className="h-10 w-10">
        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-3">
        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Viết bình luận..."
            className="bg-zinc-800 border-zinc-700 text-white min-h-[100px] pr-20"
            maxLength={maxChars}
          />
          <span className="absolute bottom-3 right-4 text-xs text-gray-400">
            {text.length} / {maxChars}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="spoiler-toggle"
              checked={isSpoiler}
              onCheckedChange={setIsSpoiler}
              className="data-[state=checked]:bg-red-600"
            />
            <Label htmlFor="spoiler-toggle" className="text-gray-400 font-normal">
              Có tiết lộ nội dung?
            </Label>
          </div>
          <Button
            type="submit"
            disabled={!text.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Gửi <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}