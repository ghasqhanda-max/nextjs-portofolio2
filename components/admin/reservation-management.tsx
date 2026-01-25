"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, Clock, XCircle, Calendar, User, Home, MoreVertical, RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ReservationRow {
  id: string
  customerId: string
  customerName: string
  propertyId: string
  propertyName: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes: string
  reservation_time: string
}

export default function ReservationManagement() {
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch reservations on component mount
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/admin/reservations')
        if (!response.ok) {
          throw new Error('Gagal memuat data reservasi')
        }
        const data = await response.json()
        // Format the data to match our interface
        const formattedData = data.map((res: any) => ({
          ...res,
          date: new Date(res.reservation_time).toLocaleDateString('id-ID'),
          time: new Date(res.reservation_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          notes: res.notes || 'Tidak ada catatan'
        }))
        setReservations(formattedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        console.error('Error fetching reservations:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [])

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const matchesSearch =
        (res.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.propertyId?.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = filterStatus === "all" || res.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [reservations, searchTerm, filterStatus])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus reservasi ini? Tindakan ini tidak bisa dibatalkan.')) {
      return
    }
    try {
      const response = await fetch('/api/admin/reservations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (!response.ok) {
        throw new Error('Gagal menghapus reservasi')
      }

      // Hapus dari state lokal
      setReservations(prev => prev.filter(res => res.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      console.error('Error deleting reservation:', err)
    }
  }

  const handleStatusChange = async (id: string, newStatus: ReservationRow["status"]) => {
    try {
      const response = await fetch('/api/admin/reservations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Gagal memperbarui status reservasi')
      }

      // Update local state to reflect the change
      setReservations(reservations.map(res => 
        res.id === id ? { ...res, status: newStatus } : res
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      console.error('Error updating reservation status:', err)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 w-fit'
    
    switch (status) {
      case 'confirmed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}><CheckCircle className="w-3 h-3" /> Dikonfirmasi</span>
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><Clock className="w-3 h-3" /> Menunggu</span>
      case 'completed':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}><CheckCircle className="w-3 h-3" /> Selesai</span>
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}><XCircle className="w-3 h-3" /> Dibatalkan</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'EEEE, d MMMM yyyy HH:mm', { locale: id })
    } catch (e) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manajemen Reservasi</h1>
        <p className="text-muted-foreground mt-2">Lihat dan kelola semua reservasi properti</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Daftar Reservasi</CardTitle>
              <CardDescription>
                Total: {filteredReservations.length} reservasi • {reservations.filter(r => r.status === 'pending').length} menunggu konfirmasi
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Perbarui
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input
                placeholder="Cari berdasarkan ID, nama pelanggan, atau properti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "confirmed", "cancelled"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status as any)}
                  className="capitalize text-xs"
                >
                  {status === 'all'
                    ? 'Semua'
                    : status === 'pending'
                    ? 'Menunggu'
                    : status === 'confirmed'
                    ? 'Dikonfirmasi'
                    : 'Dibatalkan'}
                </Button>
              ))}
            </div>
          </div>

          {filteredReservations.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Tidak ada data reservasi</p>
              <p className="text-sm text-muted-foreground">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pelanggan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Properti
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu Reservasi
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{reservation.customerName || 'Pelanggan'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
                              <Home className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{reservation.propertyName || 'Properti'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(reservation.reservation_time)}</div>
                          <div className="text-xs text-gray-500">{reservation.date} • {reservation.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(reservation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Buka menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                                disabled={reservation.status === 'confirmed' || reservation.status === 'cancelled'}
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                <span>Konfirmasi</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                                disabled={reservation.status === 'cancelled'}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                <span>Batalkan</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(reservation.id)}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                <span>Hapus</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
