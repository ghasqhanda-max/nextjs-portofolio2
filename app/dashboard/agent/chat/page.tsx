"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import ChatInterface from "@/components/agent/chat-interface"

export default function ChatPage() {
  return (
    <DashboardLayout role="agent">
      <ChatInterface />
    </DashboardLayout>
  )
}
