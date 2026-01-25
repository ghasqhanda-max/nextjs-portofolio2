"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  HomeIcon
} from "lucide-react"
import { formatRupiah, getPriceTier } from "@/lib/currency"
import type { Property } from "@/lib/mock-data"

interface PropertyDetailModalProps {
  property: Property
  onClose: () => void
}

export default function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  const priceTier = getPriceTier(property.price)
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative">
          {/* Property Image */}
          <div className="h-80 bg-gradient-to-br from-blue-100 to-purple-100">
            {property.image ? (
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/diverse-property-showcase.png"
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <HomeIcon className="w-24 h-24 text-blue-600" />
              </div>
            )}
          </div>
          
          {/* Overlay Header */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-2">{property.name}</h2>
                <div className="flex items-center gap-3">
                  <Badge className={`${priceTier.bgColor} ${priceTier.color} border-0`}>
                    {priceTier.label}
                  </Badge>
                  <Badge className={
                    property.status === 'available' ? 'bg-green-500 text-white' :
                    'bg-yellow-500 text-white'
                  }>
                    {property.status === 'available' ? 'Tersedia' : 'Di-reservasi'}
                  </Badge>
                </div>
              </div>
              
              <button 
                onClick={onClose} 
                className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-320px)]">
          <div className="p-6 space-y-6">
            {/* Price and Key Info */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Harga</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatRupiah(property.price)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Bed className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Kamar Tidur</p>
                    <p className="text-2xl font-bold text-gray-900">{property.beds}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Bath className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Kamar Mandi</p>
                    <p className="text-2xl font-bold text-gray-900">{property.baths}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Square className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Luas</p>
                    <p className="text-2xl font-bold text-gray-900">{property.sqft}m²</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Lokasi & Deskripsi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Alamat</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {property.location}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Deskripsi</p>
                    <p className="text-gray-900 leading-relaxed">
                      {property.description || 'Tidak ada deskripsi tersedia untuk properti ini.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Informasi Tambahan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Status Properti</p>
                    <div className="flex items-center gap-2">
                      {property.status === 'available' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {property.status === 'reserved' && <Clock className="w-4 h-4 text-yellow-500" />}
                      <span className="text-gray-900 capitalize">
                        {property.status === 'available' ? 'Tersedia' : 'Di-reservasi'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Agen Ditugaskan</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">
                        {(property as any).agent?.name || (property as any).agent || 'Belum ada agen'}
                      </span>
                    </div>
                  </div>
                  
                  {property.createdAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Tanggal Ditambahkan</p>
                      <p className="text-gray-900">
                        {new Date(property.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="h-11 px-6"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
