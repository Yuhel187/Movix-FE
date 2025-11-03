import Image from "next/image"

interface ActorCardProps {
  name: string
  imageUrl: string
  layout?: "vertical" | "horizontal" 
}

export function ActorCard({ name, imageUrl, layout = "vertical" }: ActorCardProps) {
  const isHorizontal = layout === "horizontal"

  return (
    <div
      className={`flex ${
        isHorizontal ? "flex-row items-center space-x-3" : "flex-col items-center space-y-2"
      }`}
    >
      <div
        className={`${
          isHorizontal ? "w-16 h-20" : "w-24 h-32"
        } rounded-md overflow-hidden flex-shrink-0`}
      >
        <Image
          src={imageUrl}
          alt={name}
          width={isHorizontal ? 64 : 96}
          height={isHorizontal ? 80 : 128}
          className="object-cover w-full h-full"
        />
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
