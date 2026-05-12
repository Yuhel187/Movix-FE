import apiClient  from '@/lib/apiClient';
import { CommentData, CommentWithReplies } from '@/types/comment'; 

export const getComments = async (targetId: string, targetType: 'movie' | 'blog' = 'movie') => {
  const params = targetType === 'movie' ? { movieId: targetId } : { postId: targetId };
  const { data } = await apiClient.get<CommentWithReplies[]>('/comments', {
    params,
  });
  return data;
};


interface PostCommentPayload {
  movieId?: string;
  postId?: string;
  comment: string;
  parentCommentId?: string;
  isSpoiler?: boolean; 
}

export const postComment = async (payload: PostCommentPayload) => {
  const { data } = await apiClient.post<CommentData>(
    '/comments',
    payload,
    {
      withCredentials: true,
    },
  );
  return data;
};

export const updateComment = async (commentId: string, comment: string) => {
  const { data } = await apiClient.put(
    `/comments/${commentId}`,
    { comment },
    {
      withCredentials: true,
    },
  );
  return data;
};

export const deleteComment = async (commentId: string) => {
  const { data } = await apiClient.delete(`/comments/${commentId}`, {
    withCredentials: true,
  });
  return data;
};