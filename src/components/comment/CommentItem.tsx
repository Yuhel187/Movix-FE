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
  Pin,
} from 'lucide-react';
import { ReportModal } from '@/components/common/ReportModal';
import { ReportTargetType } from '@/types/report';
import { FollowButton } from '@/components/common/FollowButton';
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

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

interface CommentItemProps {
  comment: CommentData | CommentWithReplies; 
  targetId: string;
  targetType?: 'movie' | 'blog';
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

function getBadgeClassName(rankKey: string) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide border';
  switch (rankKey) {
    case 'NEWBIE':
      return `${base} border-zinc-500/40 bg-zinc-500/20 text-zinc-200`;
    case 'MEMBER':
      return `${base} border-sky-300/40 bg-sky-500/20 text-sky-100`;
    case 'EXPERT':
      return `${base} border-cyan-300/40 bg-cyan-500/20 text-cyan-100`;
    case 'LEGEND':
      return `${base} border-amber-300/50 bg-amber-500/20 text-amber-100`;
    default:
      return `${base} border-violet-300/40 bg-violet-500/20 text-violet-100`;
  }
}

export function CommentItem({
  comment,
  targetId,
  targetType = 'movie',
  onCommentUpdated,
  isReply = false,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isAuthor = user?.id === comment.user.id;
  const timeAgo = formatTimeAgo(comment.created_at);
  const isPinned = Boolean(comment.is_pinned);
  const userNameColor = comment.user.display_name_color;
  const isValidNameColor = Boolean(userNameColor && HEX_COLOR_REGEX.test(userNameColor));
  const userBadge = comment.user.user_badge?.trim().toUpperCase() || null;

  const handleReplySubmit = async (text: string, isSpoiler: boolean) => {
    try {
      const parentId = comment.parent_comment_id || comment.id;
      const payload: any = {
        comment: text,
        isSpoiler,
        parentCommentId: parentId,
      };
      if (targetType === 'movie') payload.movieId = targetId;
      else payload.postId = targetId;

      const result = await commentService.postComment(payload);
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
    <div
      className={`flex gap-4 py-4 ${isReply ? 'ml-10' : ''} ${
        isPinned
          ? 'rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 px-4 shadow-[0_0_0_1px_rgba(245,158,11,0.08)]'
          : ''
      }`}
    >
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
          <span
            className="font-semibold text-white"
            style={isValidNameColor ? { color: userNameColor as string } : undefined}
          >
            {comment.user.display_name}
          </span>
          {comment.user.id && (
            <FollowButton targetUserId={comment.user.id} variant="ghost" size="sm" className="h-5 px-2 text-[10px] bg-zinc-800/50 hover:bg-zinc-700" showIcon={false} />
          )}
          {userBadge && (
            <span
              title={`Thành viên hạng ${userBadge}`}
              className={getBadgeClassName(userBadge)}
            >
              {userBadge}
            </span>
          )}
          {isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-200">
              <Pin className="h-3 w-3" />
              Đã ghim
            </span>
          )}
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
              <p className="text-gray-300 whitespace-pre-line break-words">
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
            {user && !isAuthor && (
              <ReportModal
                targetType={ReportTargetType.COMMENT}
                targetId={comment.id}
                triggerElement={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 px-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">Báo cáo</span>
                  </Button>
                }
              />
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