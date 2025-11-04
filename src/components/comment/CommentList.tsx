// src/components/movie/comments/CommentList.tsx
import type { Comment } from "@/types/comment";
import { CommentItem } from "./CommentItem";
import { MessageSquare } from "lucide-react";

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-500">
        <MessageSquare className="h-16 w-16" />
        <p className="text-lg font-medium">Chưa có bình luận nào</p>
        <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 divide-y divide-zinc-800">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}