"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Bed, Bath, Maximize2, Filter, Eye } from "lucide-react"
import PropertyDetailModal from "./property-detail-modal"

interface PropertyRow {
  id: string
  name: string
  location: string | null
  price: number | null
  beds: number | null
  baths: number | null
  sqft: number | null
  image: string | null
  description: string | null
  status: "available" | "reserved" | "sold"
  units_total?: number | null
  units_available?: number | null
}

export default function PropertyGallery() {
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "reserved">("all")
  const [selectedProperty, setSelectedProperty] = useState<PropertyRow | null>(null)
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity })
  const [priceDisplay, setPriceDisplay] = useState({ min: "", max: "" })

  // Helper functions for price formatting
  const formatPriceInput = (value: string): string => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''
    // Add dots as thousand separators
    return Number(numbers).toLocaleString('id-ID')
  }

  const parsePriceInput = (value: string): number => {
    // Remove dots and convert to number
    const numbers = value.replace(/\./g, '')
    return numbers ? Number(numbers) : 0
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatPriceInput(value)
    const numeric = parsePriceInput(value)
    
    setPriceDisplay({ ...priceDisplay, min: formatted })
    setPriceRange({ ...priceRange, min: numeric })
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setPriceDisplay({ ...priceDisplay, max: '' })
      setPriceRange({ ...priceRange, max: Infinity })
    } else {
      const formatted = formatPriceInput(value)
      const numeric = parsePriceInput(value)
      
      setPriceDisplay({ ...priceDisplay, max: formatted })
      setPriceRange({ ...priceRange, max: numeric })
    }
  }

  const resetPriceRange = () => {
    setPriceRange({ min: 0, max: Infinity })
    setPriceDisplay({ min: "", max: "" })
  }

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/properties/list")
        if (res.ok) {
          const data = await res.json()
          setProperties(data)
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      const price = prop.price ?? 0
      const nameMatch = (prop.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      const locMatch = (prop.location || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSearch = nameMatch || locMatch
      const matchesStatus = filterStatus === "all" || prop.status === filterStatus
      const matchesPrice = price >= priceRange.min && (priceRange.max === Infinity || price <= priceRange.max)
      return matchesSearch && matchesStatus && matchesPrice
    })
  }, [properties, searchTerm, filterStatus, priceRange])

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-8 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">
                Jelajahi Properti
              </h1>
              <p className="text-blue-600 mt-2 text-lg">Temukan properti impian Anda dengan mudah dan cepat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Section */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Filter & Pencarian</h2>
              <p className="text-gray-600 text-sm">Temukan properti sesuai kriteria Anda</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Cari berdasarkan lokasi atau nama properti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Status Properti</label>
            <div className="flex gap-3">
              {(["all", "available", "reserved"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  className={`capitalize px-6 py-2 rounded-lg font-medium transition-all ${
                    filterStatus === status 
                      ? "bg-blue-500 text-white shadow-lg" 
                      : "border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {status === "all" ? "Semua" : status === "available" ? "Tersedia" : "Direservasi"}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Rentang Harga</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Harga Minimum</label>
                <Input
                  type="text"
                  value={priceDisplay.min}
                  onChange={handleMinPriceChange}
                  placeholder="0"
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Harga Maksimum</label>
                <Input
                  type="text"
                  value={priceDisplay.max}
                  onChange={handleMaxPriceChange}
                  placeholder="Tidak terbatas"
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={resetPriceRange} 
                  className="w-full h-10 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium"
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat properti...</div>
      ) : (
        <>
          {/* Enhanced Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => {
              const unitsTotal = property.units_total ?? null
              const unitsAvailable = property.units_available ?? unitsTotal
              const remainingLabel =
                unitsTotal != null && unitsAvailable != null
                  ? `${unitsAvailable}/${unitsTotal} unit tersisa`
                  : null

              return (
              <div
                key={property.id}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={property.image || "/placeholder.svg"}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/diverse-property-showcase.png"
                    }}
                  />
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                        property.status === "available" 
                          ? "bg-green-500 text-white" 
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      {property.status === "available" ? "Tersedia" : "Direservasi"}
                    </span>
                  </div>
                  {remainingLabel && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 shadow">
                        {remainingLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{property.location || "Lokasi tidak tersedia"}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="py-2">
                    <span className="text-3xl font-bold text-blue-600">
                      Rp {(property.price ?? 0).toLocaleString('id-ID')}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">/bulan</span>
                  </div>

                  {/* Property Features */}
                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Bed className="w-4 h-4" />
                      <span className="text-sm font-medium">{property.beds ?? 0} kamar</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Bath className="w-4 h-4" />
                      <span className="text-sm font-medium">{property.baths ?? 0} kamar mandi</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Maximize2 className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {(property.sqft ?? 0).toLocaleString("id-ID")} m²
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {property.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {property.description}
                    </p>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => setSelectedProperty(property)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Lihat Detail Properti
                  </Button>
                </div>
              </div>
            )})}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak Ada Properti Ditemukan</h3>
                <p className="text-gray-600 mb-6">
                  Coba ubah filter pencarian atau kata kunci untuk menemukan properti yang sesuai
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("")
                    setFilterStatus("all")
                    resetPriceRange()
                  }}
                  variant="outline"
                  className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Reset Semua Filter
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedProperty && (
        <PropertyDetailModal property={selectedProperty as any} onClose={() => setSelectedProperty(null)} />
      )}
    </div>
  )
}
