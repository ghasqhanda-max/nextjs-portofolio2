"use client"

interface BadgeProps {
  label: string
  variant?: "default" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md"
}

export default function Badge({ label, variant = "default", size = "md" }: BadgeProps) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  }

  return <span className={`rounded-full font-semibold ${variantClasses[variant]} ${sizeClasses[size]}`}>{label}</span>
}
