"use client"

import { useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export interface Toast {
  id: string
  type: "success" | "error" | "info"
  title: string
  message: string
  duration?: number
}

interface ToastNotificationProps {
  toast: Toast
  onClose: (id: string) => void
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => onClose(toast.id), toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast, onClose])

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle size={20} className="text-green-600" />
      case "error":
        return <AlertCircle size={20} className="text-red-600" />
      case "info":
        return <Info size={20} className="text-blue-600" />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "info":
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()} flex items-start gap-3 shadow-lg`}>
      {getIcon()}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{toast.title}</h3>
        <p className="text-sm text-muted-foreground">{toast.message}</p>
      </div>
      <button onClick={() => onClose(toast.id)} className="p-1 hover:bg-black/10 rounded">
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}
