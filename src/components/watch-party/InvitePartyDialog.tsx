"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Share2, Lock, Globe } from "lucide-react";
import { toast } from "sonner";

interface InvitePartyDialogProps {
  joinCode: string | null;
  isPrivate: boolean;
  roomId: string;
}

export function InvitePartyDialog({ joinCode, isPrivate, roomId }: InvitePartyDialogProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteLink = `${origin}/watch-party/${roomId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    toast.success("Đã sao chép liên kết!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (joinCode) {
        navigator.clipboard.writeText(joinCode);
        setCopiedCode(true);
        toast.success("Đã sao chép mã phòng!");
        setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="bg-white/10 backdrop-blur-md border-white/10 text-white hover:bg-white/20 shadow-sm">
            <Share2 className="w-4 h-4 mr-2" /> Mời
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1F1F1F] border-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            Mời bạn bè tham gia
            {isPrivate ? <Lock className="w-4 h-4 text-red-500" /> : <Globe className="w-4 h-4 text-green-500" />}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-2">
            <p className="text-sm text-slate-400">
                {isPrivate 
                    ? "Đây là phòng riêng tư. Bạn bè cần Liên kết và Mã tham gia để vào phòng." 
                    : "Đây là phòng công khai. Bất kỳ ai có liên kết đều có thể tham gia."}
            </p>


            <div className="space-y-2">
                <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Liên kết phòng</Label>
                <div className="flex gap-2">
                    <Input readOnly value={inviteLink} className="bg-black/30 border-slate-700 text-slate-300 font-mono text-sm h-10" />
                    <Button size="icon" variant="outline" className="border-slate-700 hover:bg-white/10 h-10 w-10 shrink-0" onClick={handleCopyLink}>
                        {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-black" />}
                    </Button>
                </div>
            </div>

            {joinCode && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Mã tham gia (Join Code)</Label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-black/30 border border-slate-700 rounded-md flex items-center justify-center h-12 bg-[url('/images/noise.png')]">
                            <span className="text-2xl font-bold tracking-[0.3em] text-red-500 drop-shadow-md font-mono">{joinCode}</span>
                        </div>
                        <Button size="icon" variant="outline" className="border-slate-700 hover:bg-white/10 h-12 w-12 shrink-0" onClick={handleCopyCode}>
                            {copiedCode ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-black" />}
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}