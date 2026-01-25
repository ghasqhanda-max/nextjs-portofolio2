"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import CustomerList from "@/components/agent/customer-list"

export default function CustomersPage() {
  return (
    <DashboardLayout role="agent">
      <CustomerList />
    </DashboardLayout>
  )
}
