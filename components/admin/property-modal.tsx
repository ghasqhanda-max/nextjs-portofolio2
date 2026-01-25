"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Upload, 
  Home, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  Image as ImageIcon,
  User,
  Mail,
  Lock
} from "lucide-react"
import { formatRupiah, parseRupiah } from "@/lib/currency"
import type { Property } from "@/lib/mock-data"

interface PropertyFormData {
  name: string
  location: string
  price: number
  beds: number
  baths: number
  sqft: number
  image: string
  description: string
  status: "available" | "reserved"
  unitsTotal: number
  unitsAvailable: number
  agent: string
  autoCreateAgent: boolean
  agentDisplayName: string
  agentPassword: string
}

interface PropertyModalProps {
  property: Property | null
  onSave: (property: any) => void
  onClose: () => void
}

function toExpectedAgentEmail(name: string) {
  const cleaned = (name || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
  const parts = cleaned.split(" ").filter(Boolean)
  const last = parts[parts.length - 1] || cleaned || "agent"
  return `${last}agent@nam3land.com`
}

export default function PropertyModal({ property, onSave, onClose }: PropertyModalProps) {
  const [formData, setFormData] = useState<PropertyFormData>(
    property ? {
      name: property.name,
      location: property.location,
      price: property.price,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      image: property.image,
      description: property.description,
      status: property.status,
      unitsTotal: property.unitsTotal ?? 1,
      unitsAvailable: property.unitsAvailable ?? property.unitsTotal ?? 1,
      agent: property.agent || "",
      autoCreateAgent: true,
      agentDisplayName: "",
      agentPassword: "",
    } : {
      name: "",
      location: "",
      price: 0,
      beds: 0,
      baths: 0,
      sqft: 0,
      image: "",
      description: "",
      status: "available" as const,
      unitsTotal: 1,
      unitsAvailable: 1,
      agent: "",
      autoCreateAgent: true,
      agentDisplayName: "",
      agentPassword: "",
    },
  )
  const [imagePreview, setImagePreview] = useState<string>(property?.image || "")
  const [priceInput, setPriceInput] = useState(formatRupiah(property?.price || 0))

  const expectedEmail = useMemo(() => toExpectedAgentEmail(formData.name), [formData.name])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setFormData({ ...formData, image: base64String })
        setImagePreview(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPriceInput(value)
    
    // Parse the Rupiah value and update formData
    const numericValue = parseRupiah(value)
    setFormData({ ...formData, price: numericValue })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // pastikan unitsAvailable tidak lebih besar dari unitsTotal
    const safeUnitsAvailable = Math.min(
      Math.max(0, formData.unitsAvailable),
      Math.max(0, formData.unitsTotal),
    )

    const payload = property
      ? { ...formData, unitsAvailable: safeUnitsAvailable, id: property.id, createdAt: property.createdAt }
      : { ...formData, unitsAvailable: safeUnitsAvailable }
    onSave({ ...payload, expectedAgentEmail: expectedEmail })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {property ? "Edit Properti" : "Tambah Properti Baru"}
              </h2>
              <p className="text-sm text-gray-600">
                {property ? "Perbarui informasi properti" : "Lengkapi detail properti untuk ditambahkan"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Upload Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  Foto Properti
                </CardTitle>
                <CardDescription>
                  Upload foto terbaik properti untuk menarik pembeli
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-gray-50/50">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative group">
                        <img
                          src={imagePreview}
                          alt="Preview properti"
                          className="w-full h-64 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <label className="cursor-pointer">
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Upload size={16} />
                            Ganti Foto
                          </span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            className="hidden" 
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image: "" })
                            setImagePreview("")
                          }}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="flex flex-col items-center gap-3 py-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Upload size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Klik untuk upload foto properti</span>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF maksimal 10MB</p>
                        </div>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Informasi Dasar</CardTitle>
                <CardDescription>
                  Detail utama properti yang akan ditampilkan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Nama Properti
                    </Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="contoh: Villa Pinus Indah"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Lokasi
                    </Label>
                    <Input
                      id="location"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="contoh: Bandung, Jawa Barat"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Properti</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Jelaskan keunggulan dan fitur properti ini..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Detail Properti</CardTitle>
                <CardDescription>
                  Spesifikasi teknis dan harga properti
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Harga
                    </Label>
                    <Input
                      id="price"
                      required
                      value={priceInput}
                      onChange={handlePriceChange}
                      placeholder="Rp 0"
                      className="h-11 font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="beds" className="flex items-center gap-2">
                      <Bed className="w-4 h-4" />
                      Kamar Tidur
                    </Label>
                    <Input
                      id="beds"
                      required
                      type="number"
                      min="0"
                      value={formData.beds}
                      onChange={(e) => setFormData({ ...formData, beds: Number(e.target.value) })}
                      placeholder="0"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="baths" className="flex items-center gap-2">
                      <Bath className="w-4 h-4" />
                      Kamar Mandi
                    </Label>
                    <Input
                      id="baths"
                      required
                      type="number"
                      min="0"
                      value={formData.baths}
                      onChange={(e) => setFormData({ ...formData, baths: Number(e.target.value) })}
                      placeholder="0"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sqft" className="flex items-center gap-2">
                      <Square className="w-4 h-4" />
                      Luas (m²)
                    </Label>
                    <Input
                      id="sqft"
                      required
                      type="number"
                      min="0"
                      value={formData.sqft}
                      onChange={(e) => setFormData({ ...formData, sqft: Number(e.target.value) })}
                      placeholder="0"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unitsTotal" className="flex items-center gap-2">
                      Total Unit
                    </Label>
                    <Input
                      id="unitsTotal"
                      required
                      type="number"
                      min="1"
                      value={formData.unitsTotal}
                      onChange={(e) => {
                        const nextTotal = Number(e.target.value || 0)

                        // Untuk properti baru, samakan stok awal dengan total unit.
                        // Untuk properti yang sudah ada, jaga unitsAvailable tetap dalam batas 0..total.
                        setFormData((prev) => ({
                          ...prev,
                          unitsTotal: nextTotal,
                          unitsAvailable: property
                            ? Math.min(Math.max(0, prev.unitsAvailable), nextTotal)
                            : nextTotal,
                        }))
                      }}
                      placeholder="1"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status Properti</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "available" | "reserved") => {
                      setFormData({ ...formData, status: value })
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          Tersedia
                        </div>
                      </SelectItem>
                      <SelectItem value="reserved">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          Di-reservasi
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Agent Configuration */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Konfigurasi Agen
                </CardTitle>
                <CardDescription>
                  Atur akun agen yang akan menangani properti ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Buat Akun Agen Otomatis</div>
                      <div className="text-sm text-gray-600">Email akan dibuat otomatis dari nama properti</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.autoCreateAgent}
                      onChange={(e) => setFormData({ ...formData, autoCreateAgent: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Email agen (preview):</span>
                    <Badge variant="secondary" className="ml-2">
                      {expectedEmail}
                    </Badge>
                  </div>
                </div>

                {formData.autoCreateAgent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="space-y-2">
                      <Label htmlFor="agentDisplayName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nama Agen (opsional)
                      </Label>
                      <Input
                        id="agentDisplayName"
                        value={formData.agentDisplayName}
                        onChange={(e) => setFormData({ ...formData, agentDisplayName: e.target.value })}
                        placeholder="CS Agent Villa Pinus"
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="agentPassword" className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Kata Sandi (opsional)
                      </Label>
                      <Input
                        id="agentPassword"
                        type="text"
                        value={formData.agentPassword}
                        onChange={(e) => setFormData({ ...formData, agentPassword: e.target.value })}
                        placeholder="Jika kosong, digenerate otomatis"
                        className="h-11"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t border-gray-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="h-11 px-6"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="h-11 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {property ? "Simpan Perubahan" : "Tambah Properti"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
