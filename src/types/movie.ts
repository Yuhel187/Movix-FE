export interface Movie {
  id: string | number
  title: string
  subTitle?: string
  posterUrl: string
  backdropUrl?: string
  description?: string
  year?: number
  type?: string
  episode?: string
  tags?: string[]
  rating?: number
  duration?: string
  country?: string
}
