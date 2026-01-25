"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  TrendingUp,
  Building2,
  CheckCircle,
  Clock,
  Calendar
} from "lucide-react"
import { formatRupiah, getPriceTier } from "@/lib/currency"
import type { Property } from "@/lib/mock-data"
import PropertyModal from "./property-modal"
import PropertyDetailModal from "./property-detail-modal"

interface AgentOption { id: string; name: string; email: string }

export default function PropertyManagement() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "reserved">("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null)
  const [agents, setAgents] = useState<AgentOption[]>([])
  const [assignLoading, setAssignLoading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [resAgents, resProps] = await Promise.all([
        fetch("/api/admin/agents"),
        fetch("/api/admin/properties"),
      ])
      if (resAgents.ok) setAgents(await resAgents.json())
      if (resProps.ok) setProperties(await resProps.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAll()
  }, [])

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      const matchesSearch =
        prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prop.location || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || prop.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [properties, searchTerm, filterStatus])

  const handleAddProperty = async (newProperty: Omit<Property, "id" | "createdAt">) => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProperty.name,
          location: newProperty.location,
          price: newProperty.price,
          beds: newProperty.beds,
          baths: newProperty.baths,
          sqft: newProperty.sqft,
          image: (newProperty as any).image,
          description: newProperty.description,
          status: newProperty.status,
          unitsTotal: (newProperty as any).unitsTotal ?? 1,
          unitsAvailable: (newProperty as any).unitsAvailable ?? (newProperty as any).unitsTotal ?? 1,
          agentId: (newProperty as any).agentId || null,
          autoCreateAgent: (newProperty as any).autoCreateAgent ?? false,
          agentDisplayName: (newProperty as any).agentDisplayName || null,
          agentPassword: (newProperty as any).agentPassword || null,
          expectedAgentEmail: (newProperty as any).expectedAgentEmail || null,
        }),
      })
      if (!res.ok) throw new Error("Failed to create property")
      await fetchAll()
    setIsModalOpen(false)
    } catch (e) {
      alert("Gagal menambahkan properti. Pastikan backend Supabase aktif.")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProperty = async (updatedProperty: Property) => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedProperty.id,
          name: updatedProperty.name,
          location: updatedProperty.location,
          price: updatedProperty.price,
          beds: updatedProperty.beds,
          baths: updatedProperty.baths,
          sqft: updatedProperty.sqft,
          image: (updatedProperty as any).image,
          description: updatedProperty.description,
          status: updatedProperty.status,
          unitsTotal: (updatedProperty as any).unitsTotal,
          unitsAvailable: (updatedProperty as any).unitsAvailable,
          agentId: (updatedProperty as any).agentId || null,
          autoCreateAgent: (updatedProperty as any).autoCreateAgent ?? false,
          agentDisplayName: (updatedProperty as any).agentDisplayName || null,
          agentPassword: (updatedProperty as any).agentPassword || null,
          expectedAgentEmail: (updatedProperty as any).expectedAgentEmail || null,
        }),
      })
      if (!res.ok) throw new Error("Failed to update property")
      await fetchAll()
    setEditingProperty(null)
    setIsModalOpen(false)
    } catch (e) {
      alert("Gagal memperbarui properti.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Yakin ingin menghapus properti ini?")) return
    try {
      const res = await fetch(`/api/admin/properties?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete property")
      await fetchAll()
    } catch (e) {
      alert("Gagal menghapus properti.")
    }
  }

  const handleOpenModal = (property?: Property) => {
    if (property) {
      setEditingProperty(property)
    } else {
      setEditingProperty(null)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProperty(null)
  }

  const handleAssignAgent = async (propertyId: string, agentId: string) => {
    setAssignLoading(propertyId)
    try {
      const res = await fetch("/api/admin/properties/assign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, agentId }),
      })
      if (!res.ok) throw new Error("failed")
      await fetchAll()
    } catch {
      alert("Gagal meng-assign agen. Pastikan backend Supabase sudah dikonfigurasi.")
    } finally {
      setAssignLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Manajemen Properti
          </h1>
          <p className="text-muted-foreground">Kelola daftar properti dan penugasan agen dengan mudah</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-lg bg-card">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            onClick={() => handleOpenModal()} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02]" 
            disabled={saving}
          >
            <Plus size={18} className="mr-2" />
            Tambah Properti
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Properti</p>
                <p className="text-3xl font-bold text-gray-900">{properties.length}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>Semua properti</span>
                </div>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Unit Tersedia</p>
                <p className="text-3xl font-bold text-green-600">
                  {properties.reduce((sum, p: any) => sum + (p.unitsAvailable ?? p.unitsTotal ?? 0), 0)}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>Bisa direservasi</span>
                </div>
              </div>
              <div className="p-4 bg-green-100 rounded-xl">
                <Home className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Unit Terisi</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {properties.reduce((sum, p: any) => {
                    const total = p.unitsTotal ?? 0
                    const available = p.unitsAvailable ?? total
                    return sum + Math.max(0, total - available)
                  }, 0)}
                </p>
                <div className="flex items-center gap-1 text-xs text-yellow-600">
                  <Clock className="w-3 h-3" />
                  <span>Sedang dipesan</span>
                </div>
              </div>
              <div className="p-4 bg-yellow-100 rounded-xl">
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Cari berdasarkan nama atau lokasi properti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter:</span>
              <div className="flex gap-2">
                {(["all", "available", "reserved"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    onClick={() => setFilterStatus(status)}
                    size="sm"
                    className={`capitalize ${
                      filterStatus === status
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-gray-200 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {status === 'all' ? 'Semua' : 
                     status === 'available' ? 'Tersedia' :
                     'Di-reservasi'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat properti...</p>
          </div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm || filterStatus !== 'all' ? 'Tidak ada properti yang cocok' : 'Belum ada properti'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian Anda' 
                : 'Mulai dengan menambahkan properti pertama Anda'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Properti Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredProperties.map((property) => {
            const priceTier = getPriceTier(property.price)
            const unitsTotal = (property as any).unitsTotal ?? 1
            const unitsAvailable = (property as any).unitsAvailable ?? unitsTotal
            const assignedAgent = agents.find(a => a.id === (property as any).agentId)
            
            return viewMode === 'grid' ? (
              /* Grid View - Card Layout */
              <Card key={property.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className="relative">
                  {property.image ? (
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Home className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 left-3">
                    <Badge className={`${priceTier.bgColor} ${priceTier.color} border-0`}>
                      {priceTier.label}
                    </Badge>
                  </div>
                  
                  <div className="absolute top-3 right-3 space-y-1 text-right">
                    <Badge className={
                      unitsAvailable > 0 ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                    }>
                      {unitsAvailable > 0 ? 'Tersedia' : 'Penuh'}
                    </Badge>
                    <Badge variant="secondary">
                      {unitsAvailable}/{unitsTotal} unit
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground line-clamp-1">{property.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {property.location}
                      </div>
                    </div>

                    <div className="text-2xl font-bold text-blue-600">
                      {formatRupiah(property.price)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.beds} KT</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.baths} KM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        <span>{property.sqft}m²</span>
                      </div>
                    </div>

                    {assignedAgent && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {assignedAgent.name?.charAt(0) || assignedAgent.email?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {assignedAgent.name || assignedAgent.email}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingProperty(property)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Lihat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(property)}
                        className="flex-1"
                        disabled={saving}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleDeleteProperty(property.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* List View - Table Layout */
              <Card key={property.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      {property.image ? (
                        <img
                          src={property.image}
                          alt={property.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Home className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-foreground">{property.name}</h3>
                            <Badge className={`${priceTier.bgColor} ${priceTier.color} border-0`}>
                              {priceTier.label}
                            </Badge>
                            <Badge className={
                              unitsAvailable > 0 ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                            }>
                              {unitsAvailable > 0 ? 'Tersedia' : 'Penuh'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <MapPin className="w-3 h-3 mr-1" />
                            {property.location}
                          </div>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              <span>{property.beds} KT</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              <span>{property.baths} KM</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Square className="w-4 h-4" />
                              <span>{property.sqft}m²</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            {formatRupiah(property.price)}
                          </div>
                          
                          <Select
                            value={(property as any).agentId || ""}
                            onValueChange={(value) => value && handleAssignAgent(property.id, value)}
                            disabled={assignLoading === property.id}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Pilih Agen..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Tidak ada agen</SelectItem>
                              {agents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name || agent.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingProperty(property)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(property)}
                        disabled={saving}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleDeleteProperty(property.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <PropertyModal
          property={editingProperty}
          onSave={editingProperty ? handleUpdateProperty : handleAddProperty}
          onClose={handleCloseModal}
        />
      )}

      {viewingProperty && (
        <PropertyDetailModal 
          property={viewingProperty} 
          onClose={() => setViewingProperty(null)} 
        />
      )}
    </div>
  )
}
