"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import AgentManagement from "@/components/admin/agent-management"

export default function AgentsPage() {
  return (
    <DashboardLayout role="admin">
      <AgentManagement />
    </DashboardLayout>
  )
}
