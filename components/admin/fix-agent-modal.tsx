"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FixAgentModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function FixAgentModal({ onClose, onSuccess }: FixAgentModalProps) {
  const [email, setEmail] = useState("agent1@nam3land.com")
  const [name, setName] = useState("Agent 1")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFix = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/fix-agent-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          name: name,
          role: "agent"
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: result.message || "Profile agent berhasil diperbaiki"
        })
        onSuccess()
        onClose()
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal memperbaiki profile agent",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbaiki profile agent",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold">Perbaiki Profile Agent</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Info:</strong> Tool ini akan membuat profile untuk akun agent yang sudah ada di sistem auth tapi belum memiliki profile di database.
            </p>
          </div>

          <form onSubmit={handleFix} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Agent</label>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@nam3land.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Nama Agent</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Agent"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isLoading ? "Memperbaiki..." : "Perbaiki Profile"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
