"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  Settings, 
  Building2, 
  Save
} from "lucide-react"

export default function AdminSettings() {
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  
  const [companySettings, setCompanySettings] = useState({
    name: "Nam3Land",
    description: "Platform layanan pelanggan dan pemasaran properti",
    email: "support@nam3land.com",
    phone: "+62 21 1234 5678"
  })


  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Berhasil",
        description: "Pengaturan berhasil disimpan"
      })
    } catch (error) {
      toast({
        title: "Error", 
        description: "Gagal menyimpan pengaturan",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
          <p className="text-muted-foreground mt-2">Kelola konfigurasi dasar sistem</p>
        </div>
        
        <Button onClick={handleSaveSettings} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Simpan
            </>
          )}
        </Button>
      </div>

      {/* Company Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Informasi Perusahaan
          </CardTitle>
          <CardDescription>Kelola detail perusahaan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nama Perusahaan</Label>
              <Input 
                id="company-name"
                value={companySettings.name} 
                onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input 
                id="company-email"
                type="email"
                value={companySettings.email}
                onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-desc">Deskripsi</Label>
            <Textarea 
              id="company-desc"
              value={companySettings.description}
              onChange={(e) => setCompanySettings({...companySettings, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-phone">Telepon</Label>
            <Input 
              id="company-phone"
              value={companySettings.phone}
              onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-600" />
            Pengaturan Sistem
          </CardTitle>
          <CardDescription>Konfigurasi dasar sistem</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Bahasa</Label>
              <Input value="Bahasa Indonesia" disabled />
            </div>
            
            <div className="space-y-2">
              <Label>Zona Waktu</Label>
              <Input value="WIB (Jakarta)" disabled />
            </div>
            
            <div className="space-y-2">
              <Label>Mata Uang</Label>
              <Input value="IDR (Rupiah)" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
