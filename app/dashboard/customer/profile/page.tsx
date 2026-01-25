"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import CustomerProfile from "@/components/customer/customer-profile"

export default function ProfilePage() {
  return (
    <DashboardLayout role="customer">
      <CustomerProfile />
    </DashboardLayout>
  )
}
