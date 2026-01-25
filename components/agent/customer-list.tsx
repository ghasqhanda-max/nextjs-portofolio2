"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Mail, Phone, MapPin, MessageSquare, Users, Calendar, Send } from "lucide-react"
import { useRouter } from "next/navigation"

interface CustomerRow {
  id: string
  name: string
  email: string
  phone: string
  status: "confirmed" | "pending" | string
  propertyInterest: string
  joinDate: string
  lastActivity?: string
}

export default function CustomerList() {
  const router = useRouter()
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "confirmed" | "pending">("all")

  useEffect(() => {
    ;(async () => {
      const agentId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      if (!agentId) { setLoading(false); return }
      try {
        const res = await fetch(`/api/agent/customers?agentId=${encodeURIComponent(agentId)}`)
        if (res.ok) setCustomers(await res.json())
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        (customer.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || (customer.status as string) === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [customers, searchTerm, filterStatus])

  const handleSendMessage = (customer: CustomerRow) => {
    // Navigate to chat with pre-selected customer
    localStorage.setItem("selectedCustomerId", customer.id)
    localStorage.setItem("selectedCustomerName", customer.name)
    router.push("/dashboard/agent/chat")
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Pelanggan Saya</h1>
            <p className="text-blue-600 mt-1">Daftar pelanggan yang terkait dengan properti Anda</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pelanggan</p>
                <p className="text-xl font-bold text-gray-800">{customers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-xl font-bold text-gray-800">
                  {customers.filter(c => c.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-800">
                  {customers.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-800">Daftar Pelanggan</CardTitle>
              <CardDescription className="text-gray-600">Total: {filteredCustomers.length} pelanggan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                placeholder="Cari berdasarkan nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: "Semua", color: "bg-gray-100 text-gray-700" },
                { key: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-700" },
                { key: "pending", label: "Pending", color: "bg-orange-100 text-orange-700" }
              ].map((status) => (
                <Button
                  key={status.key}
                  variant={filterStatus === status.key ? "default" : "outline"}
                  onClick={() => setFilterStatus(status.key as any)}
                  className={`${filterStatus === status.key ? 'bg-blue-500 text-white' : status.color} border-0`}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">Memuat pelanggan...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Belum ada data pelanggan</p>
              <p className="text-gray-400 text-sm mt-2">Pelanggan akan muncul di sini setelah mereka tertarik dengan properti Anda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-105">
                  {/* Customer Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{customer.name}</h3>
                        <p className="text-sm text-gray-600">{customer.propertyInterest}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      customer.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : customer.status === 'pending'
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {customer.status}
                    </span>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-3 mb-6">
                    {customer.email && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <a href={`mailto:${customer.email}`} className="text-sm text-gray-700 hover:text-blue-600 transition-colors truncate">
                          {customer.email}
                        </a>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${customer.phone}`} className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                          {customer.phone}
                        </a>
                      </div>
                    )}
                    {customer.joinDate && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Bergabung</div>
                          <div className="text-sm font-medium text-gray-700">
                            {new Date(customer.joinDate).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                    )}
                    {customer.lastActivity && (
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Aktivitas Terakhir</div>
                          <div className="text-sm font-medium text-gray-700">
                            {new Date(customer.lastActivity).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => handleSendMessage(customer)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Kirim Pesan
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
