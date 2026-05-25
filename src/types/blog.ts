export interface BlogUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
  username?: string;
}

export interface BlogMovie {
  id: string;
  title: string;
  poster_url: string | null;
  slug: string;
}

export interface BlogLike {
  user_id: string;
}

export interface BlogBookmark {
  user_id: string;
}

export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  HIDDEN = "HIDDEN",
  ARCHIVED = "ARCHIVED",
  REJECTED = "REJECTED",
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string | null;
  images?: string[];
  is_spoiler?: boolean;
  status: PostStatus | "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED" | "REJECTED";
  view_count: number;

  created_at: string;
  updated_at: string;
  user: BlogUser;
  movie?: BlogMovie | null;
  likes: BlogLike[];
  bookmarks: BlogBookmark[];
  like_count?: number;
  comment_count?: number;
  bookmark_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  _count?: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
}

export interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface BlogListResponse {
  data: BlogPost[];
  pagination: BlogPagination;
}

export interface BlogDetailResponse {
  data: BlogPost;
}
