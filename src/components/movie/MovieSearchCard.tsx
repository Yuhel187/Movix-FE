import { Card } from "@/components/ui/card"


interface MovieSearchCardProps {
  slug: string;
  title: string
  subTitle?: string;
  imageUrl: string;
  onClick: (slug: string) => void;
}

export function MovieSearchCard({
  title,
  subTitle,
  imageUrl,
  slug,
  onClick
}: MovieSearchCardProps) {

  return (
    <div
      className="flex items-center gap-4 cursor-pointer hover:bg-[#3a3a3a] p-2 rounded-md transition-colors duration-150"
      onClick={() => onClick(slug)}
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-12 h-16 md:w-16 md:h-20 rounded-md object-cover flex-shrink-0 bg-zinc-700"
      />

      <div className="flex flex-col gap-0.5 min-w-0">
        <h3 className="text-base font-semibold truncate text-white">{title}</h3>
        <p className="text-sm text-gray-400 truncate">{subTitle}</p>
        <span className="text-xs text-red-400 mt-1">Phim</span>
      </div>
    </div>
  )
}