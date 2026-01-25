"use client"

import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  count: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export function NotificationBadge({ count, className, size = "md" }: NotificationBadgeProps) {
  if (count === 0) {
    return null
  }

  const sizeClasses = {
    sm: "w-2 h-2 -top-1 -right-1",
    md: "w-5 h-5 -top-2 -right-2 text-xs",
    lg: "w-6 h-6 -top-2 -right-2 text-sm"
  }

  const displayCount = count > 99 ? "99+" : count.toString()

  return (
    <div className={cn("relative inline-flex", className)}>
      <Bell className={size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"} />
      <span
        className={cn(
          "absolute flex items-center justify-center bg-red-500 text-white rounded-full font-bold animate-pulse",
          sizeClasses[size]
        )}
      >
        {size !== "sm" && displayCount}
      </span>
    </div>
  )
}
