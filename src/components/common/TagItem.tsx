import { X } from "lucide-react"

interface TagItemProps {
  label: string
  onRemove?: () => void
  variant?: "active" | "default"
}

export function TagItem({ label, onRemove, variant = "default" }: TagItemProps) {
  const baseStyle =
    "inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-medium border transition select-none"
  const colorStyle =
    variant === "active"
      ? "bg-red-900/60 border-red-600 text-white"
      : "bg-gray-600/40 border-gray-500 text-gray-200"

  return (
    <span className={`${baseStyle} ${colorStyle}`}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-red-600/70 transition"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </span>
  )
}
