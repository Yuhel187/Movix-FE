"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

interface AvatarUploadProps {
  currentAvatarUrl: string;
}

export function AvatarUpload({ currentAvatarUrl }: AvatarUploadProps) {
  return (
    <div className="flex flex-col items-center pt-8 space-y-4">
      <Avatar className="h-40 w-40 border-4 border-zinc-700">
        <AvatarImage src={currentAvatarUrl} alt="User Avatar" />
        <AvatarFallback className="text-6xl">HL</AvatarFallback>
      </Avatar>
      
      <Button 
        variant="outline" 
        className="bg-transparent border-zinc-700 hover:bg-zinc-800 hover:text-white"
      >
        <ImageIcon className="w-4 h-4 mr-2" />
        Ảnh có sẵn
      </Button>
    </div>
  );
}