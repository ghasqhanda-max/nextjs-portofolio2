"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import AgentDashboard from "@/components/dashboards/agent-dashboard"

export default function AgentPage() {
  return (
    <DashboardLayout role="agent">
      <AgentDashboard />
    </DashboardLayout>
  )
}
