"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import CustomerDashboard from "@/components/dashboards/customer-dashboard"

export default function CustomerPage() {
  return (
    <DashboardLayout role="customer">
      <CustomerDashboard />
    </DashboardLayout>
  )
}
