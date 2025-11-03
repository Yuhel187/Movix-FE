import { Card, CardContent } from "@/components/ui/card"

interface MovieSearchCardProps {
  title: string
  subTitle: string
  imageUrl: string
  season: string
  episode: string
}

export function MovieSearchCard({ title, subTitle, imageUrl, season, episode }: MovieSearchCardProps) {
  return (
    <Card className="bg-[#2b2b2b] text-white hover:bg-[#3a3a3a] transition p-3 w-75 h-30">
  <div className="flex items-center gap-4">
    <img src={imageUrl} alt={title} className="w-20 h-24 rounded-md object-cover" />
    <CardContent className="p-0 flex flex-col">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-gray-400">{subTitle}</p>
      <p className="text-sm text-gray-300 mt-1">
        <span className="font-semibold">T16</span> — Phần {season} — Tập {episode}
      </p>
    </CardContent>
  </div>
</Card>

  )
}