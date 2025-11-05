export interface Movie {
  id: string | number
  slug?: string //tạm thời để null để không lỗi
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
  views?: number        
}
