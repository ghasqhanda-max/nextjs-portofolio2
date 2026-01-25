"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import CustomerChat from "@/components/customer/customer-chat"

export default function ChatPage() {
  return (
    <DashboardLayout role="customer">
      <CustomerChat />
    </DashboardLayout>
  )
}
