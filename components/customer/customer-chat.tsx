"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import CustomerConversationList from "./customer-conversation-list"
import CustomerChatWindow from "./customer-chat-window"
import { MessageSquare, Users, Clock } from "lucide-react"

interface ConversationRow {
  id: string
  agentId: string
  agentName: string
  propertyId: string
  propertyName: string
  status: "active" | "pending" | "completed"
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface ChatMessageRow {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: "agent" | "customer"
  message: string
  timestamp: string
  isRead: boolean
}

export default function CustomerChat() {
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationRow | null>(null)
  const [messages, setMessages] = useState<ChatMessageRow[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem("userId") : null
    setCustomerId(id)
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!customerId) { setLoadingConvs(false); return }
      try {
        const res = await fetch(`/api/customer/conversations?customerId=${encodeURIComponent(customerId)}`)
        if (res.ok) {
          const data = await res.json()
          setConversations(data)
          
          // Check if conversationId is in URL params
          const conversationIdFromUrl = searchParams?.get('conversationId')
          if (conversationIdFromUrl) {
            const conversationFromUrl = data.find((c: ConversationRow) => c.id === conversationIdFromUrl)
            if (conversationFromUrl) {
              setSelectedConversation(conversationFromUrl)
            } else {
              // If conversation not found, select first one or null
              setSelectedConversation(data[0] ?? null)
            }
          } else {
            // No conversationId in URL, select first conversation
            setSelectedConversation((prev) => prev ?? data[0] ?? null)
          }
        }
      } finally {
        setLoadingConvs(false)
      }
    })()
  }, [customerId, searchParams])

  const loadMessages = async (conversationId: string) => {
    setLoadingMsgs(true)
    try {
      const res = await fetch(`/api/customer/conversations?conversationId=${conversationId}`)
      if (res.ok) setMessages(await res.json())
    } finally {
      setLoadingMsgs(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      if (!selectedConversation) { setMessages([]); return }
      await loadMessages(selectedConversation.id)

      try {
        const { getBrowserSupabaseClient } = await import("@/lib/supabase/browser-client")
        const supa = getBrowserSupabaseClient()
        const channel = supa
          .channel(`conv-${selectedConversation.id}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${selectedConversation.id}` },
            (payload: any) => {
              setMessages((prev) => [
                ...prev,
                {
                  id: payload.new.id,
                  conversationId: payload.new.conversation_id,
                  senderId: payload.new.sender_id,
                  senderName: '',
                  senderRole: payload.new.sender_role,
                  message: payload.new.message,
                  timestamp: new Date(payload.new.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                  isRead: true,
                } as any,
              ])
            }
          )
          .subscribe()
        return () => { supa.removeChannel(channel) }
      } catch {}
    })()
  }, [selectedConversation])

  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (c) =>
        c.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.propertyName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [conversations, searchTerm])

  const currentMessages = selectedConversation
    ? messages.filter((m) => m.conversationId === selectedConversation.id)
    : []

  const onSend = async () => {
    if (!newMessage.trim() || !selectedConversation || !customerId) return

    try {
      const res = await fetch("/api/agent/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          senderId: customerId,
          senderRole: "customer",
          message: newMessage,
        }),
      })
      if (!res.ok) throw new Error("failed")
      setNewMessage("")
      await loadMessages(selectedConversation.id)
    } catch {
      // fallback UI append
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          conversationId: selectedConversation.id,
          senderId: customerId,
          senderName: "Anda",
          senderRole: "customer",
          message: newMessage,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          isRead: true,
        } as any,
      ])
      setNewMessage("")
    }

    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 800)
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Chat dengan Agen</h1>
            <p className="text-blue-600 mt-1">Percakapan Anda dengan agen yang ditugaskan</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Percakapan</p>
                <p className="text-xl font-bold text-gray-800">{conversations.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chat Aktif</p>
                <p className="text-xl font-bold text-gray-800">
                  {conversations.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Menunggu</p>
                <p className="text-xl font-bold text-gray-800">
                  {conversations.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        <CustomerConversationList
          conversations={filteredConversations as any}
          selectedConversation={selectedConversation as any}
          onSelectConversation={setSelectedConversation as any}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <div className="lg:col-span-2 flex flex-col bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
          {loadingMsgs && selectedConversation && (
            <div className="p-4 text-sm text-gray-500 bg-blue-50 border-b">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Memuat pesan...
              </div>
            </div>
          )}
          {selectedConversation ? (
            <CustomerChatWindow
              conversation={selectedConversation as any}
              messages={currentMessages as any}
              isTyping={isTyping}
              onSendMessage={onSend}
              newMessage={newMessage}
              onNewMessageChange={setNewMessage}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              {loadingConvs ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Memuat percakapan...</p>
                </div>
              ) : (
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Pilih percakapan untuk mulai mengobrol</p>
                  <p className="text-gray-400 text-sm mt-2">Percakapan akan muncul di panel kiri</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
