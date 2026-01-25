"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, MessageSquare, Calendar, MapPin, Eye, Sparkles, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/hooks/use-notifications"

interface PropertyRow {
  id: string
  name: string
  location: string | null
  price: number | null
  beds: number | null
  image: string | null
}

export default function CustomerDashboard() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [featuredProperties, setFeaturedProperties] = useState<PropertyRow[]>([])
  const [metrics, setMetrics] = useState<{
    activeReservations: number
    unreadMessages: number
    propertiesViewed: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize demo notifications on first load
    const hasInitializedNotifications = localStorage.getItem('notificationsInitialized')
    if (!hasInitializedNotifications) {
      setTimeout(() => {
        addNotification({
          title: 'Selamat Datang di Nam3Land!',
          message: 'Jelajahi properti menarik dan nikmati pengalaman booking yang mudah.',
          type: 'success'
        })
        
        setTimeout(() => {
          addNotification({
            title: 'Properti Baru Tersedia',
            message: 'Villa mewah dengan pemandangan laut telah ditambahkan. Lihat sekarang!',
            type: 'info',
            actionUrl: '/dashboard/customer/properties'
          })
        }, 2000)
      }, 1000)
      
      localStorage.setItem('notificationsInitialized', 'true')
    }
  }, [addNotification])

  useEffect(() => {
    ;(async () => {
      const customerId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      try {
        const [resProps, resMetrics] = await Promise.all([
          fetch("/api/properties/list"),
          customerId ? fetch(`/api/customer/metrics?customerId=${encodeURIComponent(customerId)}`) : null,
        ])
        if (resProps.ok) {
          const data = await resProps.json()
          setFeaturedProperties(data.slice(0, 4))
        }
        if (resMetrics?.ok) {
          setMetrics(await resMetrics.json())
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const stats = [
    {
      title: "Reservasi Aktif",
      value: metrics?.activeReservations ?? 0,
      description: "Booking Mendatang",
      icon: Calendar,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      trend: "1 pending"
    },
    {
      title: "Pesan Baru",
      value: metrics?.unreadMessages ?? 0,
      description: "Belum Dibaca",
      icon: MessageSquare,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      trend: "Dari agent"
    },
    {
      title: "Properti Dilihat",
      value: metrics?.propertiesViewed ?? 0,
      description: "Bulan Ini",
      icon: Eye,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      trend: "+15% dari bulan lalu"
    },
  ]

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-800 to-pink-800 bg-clip-text text-transparent">
                Selamat Datang!
              </h1>
              <p className="text-purple-600 mt-2 text-lg">Temukan properti impian Anda dan nikmati pengalaman booking terbaik</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color} shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                  </div>
                </div>
                <div>
                  <CardTitle className={`text-lg font-semibold ${stat.textColor} mb-1`}>
                    {stat.title}
                  </CardTitle>
                  <CardDescription className={`text-sm ${stat.textColor} opacity-80 mb-2`}>
                    {stat.description}
                  </CardDescription>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Enhanced Properties Section */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-orange-800">Properti Unggulan</CardTitle>
                <CardDescription className="text-orange-600">Properti terpopuler dan terbaru untuk Anda</CardDescription>
              </div>
            </div>
            <button 
              onClick={() => router.push("/dashboard/customer/properties")}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-800 transition-colors font-medium"
            >
              <span className="text-sm">Lihat Semua</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">Memuat properti unggulan...</p>
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Belum ada properti</p>
              <p className="text-gray-400 text-sm mt-2">Properti unggulan akan muncul di sini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {featuredProperties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => router.push("/dashboard/customer/properties")}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="relative w-full h-48 overflow-hidden">
                    {prop.image ? (
                      <img
                        src={prop.image || "/placeholder.svg"}
                        alt={prop.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/diverse-property-showcase.png"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 via-red-400 to-pink-400" />
                    )}
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Tersedia
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-orange-600 transition-colors">
                      {prop.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <p className="text-sm">{prop.location || "Lokasi tidak tersedia"}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-orange-600">
                          Rp {(prop.price ?? 0).toLocaleString('id-ID')}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">/bulan</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Home className="w-4 h-4" />
                        <span>{prop.beds ?? 0} kamar</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
