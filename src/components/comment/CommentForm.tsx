"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; 

interface CommentFormProps {
  onSubmit: (text: string, isSpoiler: boolean) => Promise<void> | void;
  initialText?: string;
  onCancel?: () => void;
  showAvatar?: boolean; 
}

export function CommentForm({
  onSubmit,
  initialText = '',
  onCancel,
  showAvatar = true,
}: CommentFormProps) {
  const { user } = useAuth(); 
  const [text, setText] = useState(initialText);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const maxChars = 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(text, isSpoiler);
      setText('');
      setIsSpoiler(false);
      if (onCancel) onCancel(); 
    } catch (error) {
      console.error('Không thể gửi bình luận:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const avatarUrl = user?.avatarUrl || '';
  const displayName = user?.display_name || 'User';

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      {showAvatar && (
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div className={`flex-1 space-y-3 ${!showAvatar ? 'w-full' : ''}`}>
        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              showAvatar ? 'Viết bình luận...' : 'Viết trả lời...'
            }
            className="bg-zinc-800 border-zinc-700 text-white min-h-[100px] pr-20"
            maxLength={maxChars}
            disabled={isLoading}
          />
          <span className="absolute bottom-3 right-4 text-xs text-gray-400">
            {text.length} / {maxChars}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id={`spoiler-toggle-${showAvatar}`}
              checked={isSpoiler}
              onCheckedChange={setIsSpoiler}
              className="data-[state=checked]:bg-red-600"
              disabled={isLoading}
            />
            <Label
              htmlFor={`spoiler-toggle-${showAvatar}`}
              className="text-gray-400 font-normal"
            >
              Có tiết lộ nội dung?
            </Label>
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
            )}
            <Button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Đang gửi...' : 'Gửi'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}