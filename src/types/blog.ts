export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  HIDDEN = 'HIDDEN',
}

export interface BlogUser {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
}

export interface BlogMovie {
  title: string;
  thumbnail?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  status: PostStatus;
  user_id: string;
  movie_id?: string;
  created_at: string;
  updated_at: string;
  user: BlogUser;
  movie?: BlogMovie;
  _count?: {
    likes: number;
    bookmarks: number;
  };
}

export interface BlogPaginationResponse {
  blogs: BlogPost[];
  total: number;
  totalPages: number;
}
