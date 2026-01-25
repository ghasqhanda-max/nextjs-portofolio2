"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import PropertyGallery from "@/components/customer/property-gallery"

export default function PropertiesPage() {
  return (
    <DashboardLayout role="customer">
      <PropertyGallery />
    </DashboardLayout>
  )
}
