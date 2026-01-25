"use client"

import { Input } from "@/components/ui/input"
import { Search, MessageCircle, Clock, User } from "lucide-react"

interface ConversationRow {
  id: string
  customerId: string
  customerName: string
  agentId: string
  propertyId: string
  propertyName: string
  status: "active" | "pending" | "completed"
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface ConversationListProps {
  conversations: ConversationRow[]
  selectedConversation: ConversationRow | null
  onSelectConversation: (conversation: ConversationRow) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchTerm,
  onSearchChange,
}: ConversationListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-600" />
          Percakapan ({conversations.length})
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <Input
            placeholder="Cari percakapan..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Tidak ada percakapan</p>
            <p className="text-sm mt-1">Percakapan baru akan muncul di sini</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full p-4 border-b border-gray-100 text-left transition-all duration-200 hover:bg-blue-50 group ${
                selectedConversation?.id === conversation.id
                  ? "bg-blue-50 border-l-4 border-l-blue-500 shadow-sm"
                  : "hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {conversation.customerName.charAt(0).toUpperCase()}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 truncate group-hover:text-blue-800 transition-colors">
                        {conversation.customerName}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs whitespace-nowrap px-2 py-1 rounded-full font-medium ${
                        conversation.status === "active"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : conversation.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {conversation.status}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {conversation.propertyName}
                  </p>
                  
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mb-2">
                      "{conversation.lastMessage}"
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {conversation.lastMessageTime}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
