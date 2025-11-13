import { CommentWithReplies } from '@/types/comment'; 
import { CommentItem } from './CommentItem';
import { MessageSquare } from 'lucide-react';

interface CommentListProps {
  comments: CommentWithReplies[];
  movieId: string;
  onCommentUpdated: () => void; 
}

export function CommentList({
  comments,
  movieId,
  onCommentUpdated,
}: CommentListProps) {
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
        <div key={comment.id}>
          {/* Bình luận gốc */}
          <CommentItem
            comment={comment}
            movieId={movieId}
            onCommentUpdated={onCommentUpdated}
          />
          {/* Các bình luận trả lời (nếu có) */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="pl-10 border-l-2 border-zinc-700 ml-5">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  movieId={movieId}
                  onCommentUpdated={onCommentUpdated}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}