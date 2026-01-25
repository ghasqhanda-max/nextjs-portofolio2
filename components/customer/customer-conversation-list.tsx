"use client"

import { Input } from "@/components/ui/input"
import { Search, MessageCircle } from "lucide-react"

interface ConversationRow {
  id: string
  agentName: string
  propertyName: string
  status: "active" | "pending" | "completed"
  lastMessage: string
  lastMessageTime: string
}

interface CustomerConversationListProps {
  conversations: ConversationRow[]
  selectedConversation: ConversationRow | null
  onSelectConversation: (conversation: ConversationRow) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export default function CustomerConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchTerm,
  onSearchChange,
}: CustomerConversationListProps) {
  return (
    <div className="bg-card rounded-lg border border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <Input
            placeholder="Cari percakapan..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p>Tidak ada percakapan</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full p-4 border-b border-border text-left transition-colors hover:bg-muted ${
                selectedConversation?.id === conversation.id
                  ? "bg-primary bg-opacity-10 border-l-4 border-l-primary"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{conversation.propertyName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Agen: {conversation.agentName}</p>
                  <p className="text-sm text-muted-foreground truncate mt-2">{conversation.lastMessage}</p>
                </div>
                <span
                  className={`text-xs whitespace-nowrap px-2 py-1 rounded-full ${
                    conversation.status === "active"
                      ? "bg-green-100 text-green-700"
                      : conversation.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {conversation.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{conversation.lastMessageTime}</p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
