"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import AgentProfile from "@/components/agent/agent-profile"

export default function ProfilePage() {
  return (
    <DashboardLayout role="agent">
      <AgentProfile />
    </DashboardLayout>
  )
}
