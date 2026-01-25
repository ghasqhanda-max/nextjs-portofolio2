"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import AgentReservations from "@/components/agent/agent-reservations"

export default function ReservationsPage() {
  return (
    <DashboardLayout role="agent">
      <AgentReservations />
    </DashboardLayout>
  )
}
