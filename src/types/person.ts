export interface PersonItemResponse {
  id: string;
  name: string;
  role_type: string; 
  avatar_url: string | null;
  tmdb_id: number | null;
}

export interface PeopleListResponse {
  data: PersonItemResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PersonCreditResponse {
  id: string;
  title: string;
  original_title: string;
  poster_url: string | null;
  slug: string;
  release_date: string | null;
  media_type: "MOVIE" | "TV";
  character?: string; 
  credit_type: string; 
  job?: string; 
}

export interface PersonDetailResponse {
  id: string;
  tmdb_id: number | null;
  name: string;
  biography: string | null;
  stage_name: string | null;
  birthday: string | null;
  gender: number | null;
  role_type: string;
  avatar_url: string | null;
  movies: PersonCreditResponse[];
}

export interface Person {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  biography?: string;
  birthday?: string;
  gender?: string;
  credits?: {
    id: string;
    title: string;
    posterUrl: string;
    roleName: string;
    year: string;
    slug: string;
  }[];
}