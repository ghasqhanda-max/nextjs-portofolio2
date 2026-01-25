"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface ConversationRow { id: string; propertyName: string; agentName: string }
interface ChatMessageRow { id: string; senderRole: "agent" | "customer"; message: string; timestamp: string }
interface ReservationInfo { status: string; reservationTime: string }

interface CustomerChatWindowProps {
  conversation: ConversationRow
  messages: ChatMessageRow[]
  isTyping: boolean
  onSendMessage: () => void
  newMessage: string
  onNewMessageChange: (message: string) => void
}

export default function CustomerChatWindow({
  conversation,
  messages,
  isTyping,
  onSendMessage,
  newMessage,
  onNewMessageChange,
}: CustomerChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [reservation, setReservation] = useState<ReservationInfo | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/conversations/reservation?conversationId=${conversation.id}`)
        if (res.ok) setReservation(await res.json())
      } catch {}
    })()
  }, [conversation.id])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/50">
        <h3 className="font-semibold text-foreground">{conversation.propertyName}</h3>
        <p className="text-sm text-muted-foreground">Agen: {conversation.agentName}</p>
        {reservation && (
          <p className="text-xs text-muted-foreground mt-1">
            Reservasi: {reservation.status} • {new Date(reservation.reservationTime).toLocaleString("id-ID")}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderRole === "customer" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderRole === "customer"
                  ? "bg-primary text-white rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none"
              }`}
            >
              <p className="text-sm">{message.message}</p>
              <p
                className={`text-xs mt-1 ${message.senderRole === "customer" ? "text-white/70" : "text-muted-foreground"}`}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="flex gap-2">
          <Input
            placeholder="Tulis pesan..."
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary-light text-white"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </>
  )
}
