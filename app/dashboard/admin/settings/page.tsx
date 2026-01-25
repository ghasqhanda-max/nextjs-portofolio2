"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import AdminSettings from "@/components/admin/admin-settings"

export default function SettingsPage() {
  return (
    <DashboardLayout role="admin">
      <AdminSettings />
    </DashboardLayout>
  )
}
