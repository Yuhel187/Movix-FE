export interface Movie {
  id: string | number
  slug?: string
  title: string
  subTitle?: string
  posterUrl: string
  backdropUrl?: string
  poster_url?: string
  backdrop_url?: string
  original_title?: string 
  description?: string
  videoUrl?: string
  year?: number
  type?: string
  episode?: string
  tags?: string[]
  rating?: number
  duration?: string
  country?: string
  views?: number
metadata?: {
    tmdb_rating?: number
    duration?: string
    [key: string]: any
  }       
}