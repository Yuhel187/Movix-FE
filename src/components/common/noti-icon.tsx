import { Bell } from "lucide-react"

export function NotificationIcon() {
  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-300" />

      <span className="absolute top-0 left-3.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#1a1b1f]" />
    </div>
  )
}
