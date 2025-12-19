import { Movie } from "./movie";
export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string; 
  isActive: boolean; 
  movieId?: number | string; 
  description?: string;
  movie?: Movie;
}

export interface CreateBannerDto {
  title: string;
  image_url: string;
  link_url?: string;
  movie_id?: string;
  is_active?: boolean;
}