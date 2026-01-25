"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import CustomerReservations from "@/components/customer/customer-reservations"

export default function ReservationsPage() {
  return (
    <DashboardLayout role="customer">
      <CustomerReservations />
    </DashboardLayout>
  )
}
