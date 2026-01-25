"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import ReservationReport from "@/components/admin/reservation-report"

export default function ReportPage() {
  return (
    <DashboardLayout role="admin">
      <ReservationReport />
    </DashboardLayout>
  )
}

