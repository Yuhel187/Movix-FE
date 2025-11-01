// src/components/movie/comments/CommentItem.tsx
import type { Comment } from "@/types/comment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquareReply } from "lucide-react";
import { SpoilerWarning } from "./SpoilerWarning";

interface CommentItemProps {
  comment: Comment;
}

// Hàm giả lập để format thời gian (bạn có thể thay bằng thư viện date-fns hoặc moment)
function formatTimeAgo(dateString: string) {
  // Logic format thời gian... (ví dụ: "5 phút trước")
  return "5 phút trước"; 
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex gap-4 py-4">
      <Avatar className="h-10 w-10">
        <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
        <AvatarFallback>
          {comment.user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{comment.user.name}</span>
          <span className="text-xs text-gray-400">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>
        
        <div className="mt-2 text-sm">
          {comment.isSpoiler ? (
            <SpoilerWarning>{comment.text}</SpoilerWarning>
          ) : (
            <p className="text-gray-300 whitespace-pre-line">{comment.text}</p>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white px-2"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs">{comment.likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white px-2"
          >
            <MessageSquareReply className="h-4 w-4" />
            <span className="text-xs">Phản hồi</span>
          </Button>
        </div>

        {/* Thêm logic render replies (comment.replies) ở đây nếu cần */}
      </div>
    </div>
  );
}