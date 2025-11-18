import Image from "next/image"
import { Trash, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActorCardProps {
  name: string
  profileUrl?: string | null; 
  imageUrl?: string | null;   
  avatar_url?: string | null; 
  layout?: "vertical" | "horizontal"
  onRemove?: () => void
  character?: string
}

export function ActorCard({ name, profileUrl, imageUrl, avatar_url, layout = "vertical", onRemove, character }: ActorCardProps) {
  const isHorizontal = layout === "horizontal"
  const displayUrl = avatar_url || profileUrl || imageUrl;

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
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 15vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <User className="w-1/2 h-1/2 text-gray-500" />
          </div>
        )}
        
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
        {character}
      </span>
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