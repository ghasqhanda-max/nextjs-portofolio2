"use client"

import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onClear?: () => void
}

export default function SearchBar({ value, onChange, placeholder = "Search...", onClear }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {value && (
        <button
          onClick={() => {
            onChange("")
            onClear?.()
          }}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
