"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "admin" | "agent" | "customer"
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (!userRole || userRole !== role) {
      router.push("/")
    } else {
      setIsAuthorized(true)
    }
  }, [role, router])

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={role} />
      <main className="flex-1 md:ml-64 overflow-auto">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
