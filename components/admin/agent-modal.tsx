"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import type { Agent } from "@/lib/mock-data"

interface AgentModalProps {
  agent: Agent | null
  onSave: (agent: Agent | Omit<Agent, "id" | "joinDate">) => void
  onClose: () => void
}

export default function AgentModal({ agent, onSave, onClose }: AgentModalProps) {
  const [formData, setFormData] = useState<any>(
    agent || {
      name: "",
      email: "",
      phone: "",
      password: "",
      properties: 0,
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (agent) {
      onSave({ ...formData, id: agent.id, joinDate: agent.joinDate } as Agent)
    } else {
      onSave(formData as Omit<Agent, "id" | "joinDate">)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">{agent ? "Edit Agent" : "Add New Agent"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Agent name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="agent@propertyhub.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0000"
            />
          </div>
          {!agent && (
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave empty for auto-generated password"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Properties Assigned</label>
            <Input
              required
              type="number"
              value={formData.properties}
              onChange={(e) => setFormData({ ...formData, properties: Number(e.target.value) })}
              placeholder="0"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-light text-white">
              {agent ? "Update Agent" : "Add Agent"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
