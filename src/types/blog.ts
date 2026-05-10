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

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string | null;
  images?: string[];
  is_spoiler?: boolean;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";
  view_count: number;
  created_at: string;
  updated_at: string;
  user: BlogUser;
  movie?: BlogMovie | null;
  likes: BlogLike[];
  bookmarks: BlogBookmark[];
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
