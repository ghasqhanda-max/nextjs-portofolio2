"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import AdminDashboard from "@/components/dashboards/admin-dashboard"

export default function AdminPage() {
  return (
    <DashboardLayout role="admin">
      <AdminDashboard />
    </DashboardLayout>
  )
}
