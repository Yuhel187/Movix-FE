'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Check, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    movieTitle: string;
    movieSlug: string;
}

export const ShareDialog = ({ open, onOpenChange, movieTitle, movieSlug }: Props) => {
    const [copied, setCopied] = useState(false);
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUrl(`${window.location.origin}/movies/${movieSlug}`);
        }
    }, [movieSlug]);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Đã sao chép liên kết!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSocialShare = (platform: 'facebook' | 'twitter') => {
        let shareUrl = '';
        if (platform === 'facebook') {
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        } else if (platform === 'twitter') {
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Xem phim ${movieTitle} tại Movix!`)}`;
        }
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-[#1A1A1A] border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle>Chia sẻ phim</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Sao chép liên kết bên dưới để chia sẻ phim <span className="font-bold text-white">{movieTitle}</span> với bạn bè.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 mt-2">
                    <div className="grid flex-1 gap-2">
                        <Input
                            id="link"
                            value={url}
                            readOnly
                            className="bg-[#0F0F0F] border-gray-700 text-gray-300 focus-visible:ring-red-500"
                        />
                    </div>
                    <Button type="button" size="sm" className="px-3 bg-red-600 hover:bg-red-700" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button variant="outline" className="dark w-full border-gray-700 text-gray-300 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors" onClick={() => handleSocialShare('facebook')}>
                        <Facebook className="mr-2 h-4 w-4" /> Facebook
                    </Button>
                    <Button variant="outline" className="dark w-full border-gray-700 text-gray-300 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors" onClick={() => handleSocialShare('twitter')}>
                        <Twitter className="mr-2 h-4 w-4" /> Twitter
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
