"use client"

import { X } from "lucide-react"

interface ModalHeaderProps {
  title: string
  description?: string
  onClose: () => void
}

export default function ModalHeader({ title, description, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <button onClick={onClose} className="p-1 hover:bg-muted rounded">
        <X size={20} />
      </button>
    </div>
  )
}
