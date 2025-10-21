import Image from "next/image"
import { Trash } from "lucide-react"

interface ActorCardProps {
  name: string
  imageUrl: string
  layout?: "vertical" | "horizontal"
  onRemove?: () => void
}

export function ActorCard({ name, imageUrl, layout = "vertical", onRemove }: ActorCardProps) {
  const isHorizontal = layout === "horizontal"

  return (
    <div
      className={`relative flex ${
        isHorizontal ? "flex-row items-center space-x-3" : "flex-col items-center space-y-2"
      }`}
    >
      <div
        className={`${
          isHorizontal ? "w-16 h-20" : "w-24 h-32"
        } rounded-md overflow-hidden flex-shrink-0 relative`}
      >
        <Image
          src={imageUrl}
          alt={name}
          width={isHorizontal ? 64 : 96}
          height={isHorizontal ? 80 : 128}
          className="object-cover w-full h-full"
        />
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white hover:bg-red-700"
          >
            <Trash className="w-3 h-3" />
          </button>
        )}
      </div>
      <span
        className={`text-sm text-gray-200 ${
          isHorizontal ? "text-left" : "text-center mt-1"
        }`}
      >
        {name}
      </span>
    </div>
  )
}
