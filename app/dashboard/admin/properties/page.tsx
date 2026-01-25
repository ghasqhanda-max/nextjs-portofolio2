"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import PropertyManagement from "@/components/admin/property-management"

export default function PropertiesPage() {
  return (
    <DashboardLayout role="admin">
      <PropertyManagement />
    </DashboardLayout>
  )
}
