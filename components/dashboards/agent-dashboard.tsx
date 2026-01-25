"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { MessageSquare, Users, Calendar, TrendingUp, Clock, BarChart3, Activity, Target } from "lucide-react"

interface Conversation {
  id: string
  customerName: string
  propertyName: string
  status: string
  lastMessage: string
  lastMessageTime: string
}

export default function AgentDashboard() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<{ activeChats: number; assignedCustomers: number; pendingReservations: number; avgResponseMinutes: number | null } | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const agentId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      if (!agentId) { setLoading(false); return }

      const [resMetrics, resConvs] = await Promise.all([
        fetch(`/api/agent/metrics?agentId=${encodeURIComponent(agentId)}`),
        fetch(`/api/agent/conversations?agentId=${encodeURIComponent(agentId)}`),
      ])

      if (resMetrics.ok) setMetrics(await resMetrics.json())
      if (resConvs.ok) {
        const data = await resConvs.json()
        setConversations(data.slice(0, 5))
      }
      setLoading(false)
    })()
  }, [])

  const items = [
    { 
      title: "Chat Aktif", 
      value: metrics?.activeChats ?? 0,
      description: "Percakapan berlangsung",
      icon: MessageSquare,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    { 
      title: "Pelanggan Ditugaskan", 
      value: metrics?.assignedCustomers ?? 0,
      description: "Total pelanggan Anda",
      icon: Users,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    { 
      title: "Reservasi Tertunda", 
      value: metrics?.pendingReservations ?? 0,
      description: "Menunggu konfirmasi",
      icon: Calendar,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    },
  ]

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-500 rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-blue-800">Dasbor Agen</h1>
              <p className="text-blue-600 mt-2 text-lg">Kelola pelanggan dan reservasi Anda dengan efisien</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">Online</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Performance</span>
              </div>
              <div className="text-sm font-semibold text-gray-700">Excellent</div>
            </div>
          </div>
        </div>
        
        {/* Quick Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
            <div className="text-2xl font-bold text-blue-800">{metrics?.activeChats ?? 0}</div>
            <div className="text-xs text-blue-600 font-medium">Chat Aktif</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
            <div className="text-2xl font-bold text-green-800">{metrics?.assignedCustomers ?? 0}</div>
            <div className="text-xs text-green-600 font-medium">Total Pelanggan</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
            <div className="text-2xl font-bold text-orange-800">{metrics?.pendingReservations ?? 0}</div>
            <div className="text-xs text-orange-600 font-medium">Reservasi Pending</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
            <div className="text-2xl font-bold text-purple-800">{conversations.length}</div>
            <div className="text-xs text-purple-600 font-medium">Percakapan Hari Ini</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Card key={stat.title} className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${stat.color}`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className={`text-lg font-semibold ${stat.textColor}`}>
                          {stat.title}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                      {String(stat.value)}
                    </div>
                    <CardDescription className={`text-sm ${stat.textColor} opacity-80`}>
                      {stat.description}
                    </CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-blue-800">Percakapan Terbaru</CardTitle>
              <CardDescription className="text-blue-600">Interaksi pelanggan terbaru Anda</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat percakapan...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada percakapan</p>
              <p className="text-sm text-muted-foreground mt-1">Percakapan akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv, index) => (
                <div
                  key={conv.id}
                  onClick={() => router.push("/dashboard/agent/chat")}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {conv.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 group-hover:text-blue-800 transition-colors">
                        {conv.customerName}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {conv.propertyName}
                      </p>
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-md">
                          "{conv.lastMessage}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        conv.status === "active"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : conv.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {conv.status}
                    </span>
                    {conv.lastMessageTime && (
                      <p className="text-xs text-gray-400">{conv.lastMessageTime}</p>
                    )}
                  </div>
                </div>
              ))}
              {conversations.length >= 5 && (
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => router.push("/dashboard/agent/chat")}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-2 rounded-lg transition-colors font-medium"
                  >
                    Lihat semua percakapan →
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
