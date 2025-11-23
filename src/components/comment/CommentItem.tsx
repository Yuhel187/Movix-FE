'use client';

import {
  CommentData,
  CommentWithReplies,
  CommentUser,
} from '@/types/comment'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ThumbsUp,
  MessageSquareReply,
  Edit,
  Trash,
  AlertTriangle,
} from 'lucide-react';
import { SpoilerWarning } from './SpoilerWarning';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as commentService from '@/services/comment.service';
import { CommentForm } from './CommentForm'; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from "sonner";

interface CommentItemProps {
  comment: CommentData | CommentWithReplies; 
  movieId: string;
  onCommentUpdated: () => void;
  isReply?: boolean;
}
function formatTimeAgo(dateString: string) {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: vi,
    });
  } catch (error) {
    return dateString;
  }
}

export function CommentItem({
  comment,
  movieId,
  onCommentUpdated,
  isReply = false,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isAuthor = user?.id === comment.user.id;
  const timeAgo = formatTimeAgo(comment.created_at);

  const handleReplySubmit = async (text: string, isSpoiler: boolean) => {
    try {
      const parentId = comment.parent_comment_id || comment.id;
      const result = await commentService.postComment({
        movieId,
        comment: text,
        isSpoiler,
        parentCommentId: parentId,
      });
      onCommentUpdated();
      setIsReplying(false);
      return result; 

    } catch (error) {
      console.error(error);
      throw error; 
    }
  };

  const handleEditSubmit = async (
    updatedText: string,
    isSpoiler: boolean,
  ) => {
    await commentService.updateComment(comment.id, updatedText);
    onCommentUpdated();
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await commentService.deleteComment(comment.id);
      onCommentUpdated();
    } catch (error) {
      console.error('Lỗi xóa bình luận:', error);
    }
  };

  return (
    <div className={`flex gap-4 py-4 ${isReply ? 'ml-10' : ''}`}>
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={comment.user.avatar_url || ''} 
          alt={comment.user.display_name}
        />
        <AvatarFallback>
          {comment.user.display_name?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">
            {comment.user.display_name}
          </span>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
        {isEditing ? (
          <div className="mt-2">
            <CommentForm
              initialText={comment.comment}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
              showAvatar={false}
            />
          </div>
        ) : (
          <div className="mt-2 text-sm">
            {comment.is_spoiler ? ( 
              <SpoilerWarning>{comment.comment}</SpoilerWarning>
            ) : (
              <p className="text-gray-300 whitespace-pre-line">
                {comment.comment}
              </p>
            )}
          </div>
        )}

        {!isEditing && (
          <div className="mt-3 flex items-center gap-1">
            {user && ( 
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-gray-400 hover:text-white px-2"
                onClick={() => setIsReplying(!isReplying)}
              >
                <MessageSquareReply className="h-4 w-4" />
                <span className="text-xs">Trả lời</span>
              </Button>
            )}
            {isAuthor && ( 
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white px-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1.5 text-red-500 hover:text-red-400 px-2"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center">
                        <AlertTriangle className="text-red-500 mr-2" />
                        Xác nhận xóa bình luận?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        )}
        {isReplying && (
          <div className="mt-4">
            <CommentForm
              onSubmit={handleReplySubmit}
              onCancel={() => setIsReplying(false)}
              showAvatar={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}