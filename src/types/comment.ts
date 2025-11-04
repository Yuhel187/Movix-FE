export interface CommentUser {
  id: string | number;
  name: string;
  avatarUrl: string;
}

export interface Comment {
  id: string | number;
  user: CommentUser;
  createdAt: string;
  text: string;
  isSpoiler: boolean;
  likes: number;
  replies?: Comment[];
}