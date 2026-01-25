"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import ReservationManagement from "@/components/admin/reservation-management"

export default function ReservationsPage() {
  return (
    <DashboardLayout role="admin">
      <ReservationManagement />
    </DashboardLayout>
  )
}
