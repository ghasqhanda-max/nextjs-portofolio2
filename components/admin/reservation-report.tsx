"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Home,
  RefreshCw,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ReservationReportRow {
  id: string;
  customerId: string;
  customerName: string;
  propertyId: string;
  propertyName: string;
  reservationTime: string;
  createdAt: string;
  date: string;
  time: string;
  submittedDate: string;
  submittedTime: string;
  status: "confirmed" | "cancelled";
  notes: string;
  rejectionReason: string;
}

export default function ReservationReport() {
  const [reservations, setReservations] = useState<ReservationReportRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "confirmed" | "cancelled"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/reservations/report");
        if (!response.ok) {
          throw new Error("Gagal memuat data report");
        }
        const data = await response.json();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        console.error("Error fetching report data:", err);
        toast({
          title: "Error",
          description: "Gagal memuat data report",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [toast]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const matchesSearch =
        res.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.propertyId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || res.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, filterStatus]);

  const handleExportPDF = async () => {
    if (!reportRef.current) {
      toast({
        title: "Error",
        description: "Tidak dapat menemukan konten untuk diekspor",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Create a temporary iframe for complete CSS isolation
      // This prevents any CSS from the main page (including oklch) from affecting PDF generation
      const iframe = document.createElement("iframe");
      iframe.style.cssText = `
        position: absolute;
        left: -9999px;
        width: 210mm;
        height: 297mm;
        border: none;
      `;
      document.body.appendChild(iframe);

      // Wait for iframe to load
      await new Promise((resolve) => {
        iframe.onload = resolve;
        iframe.src = "about:blank";
      });

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error("Cannot access iframe document");
      }

      const printContainer = iframeDoc.createElement("div");
      printContainer.style.cssText = `
        width: 100%;
        padding: 20mm;
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        color: #1f2937;
      `;
      iframeDoc.body.appendChild(printContainer);
      iframeDoc.body.style.cssText =
        "margin: 0; padding: 0; background: #ffffff;";

      // Build PDF content
      const currentDate = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const currentTime = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const confirmedCount = filteredReservations.filter(
        (r) => r.status === "confirmed"
      ).length;
      const cancelledCount = filteredReservations.filter(
        (r) => r.status === "cancelled"
      ).length;

      printContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #1f2937;">
          <!-- Kop Surat -->
          <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 20%; vertical-align: top; padding-right: 15px;">
                  <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">
                    N
                  </div>
                </td>
                <td style="vertical-align: top;">
                  <h1 style="color: #1e40af; margin: 0 0 5px 0; font-size: 24px; font-weight: bold;">PT Nam3Land Indonesia</h1>
                  <p style="color: #374151; margin: 2px 0; font-size: 12px; line-height: 1.6;">
                    Platform Layanan Pelanggan dan Pemasaran Properti<br>
                    Jl. Sudirman No. 123, Jakarta Pusat 10220<br>
                    Telp: (021) 1234-5678 | Email: info@nam3land.com<br>
                    Website: www.nam3land.com
                  </p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Judul Laporan -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #1e40af; margin: 0 0 10px 0; font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
              Laporan Reservasi Properti
            </h2>
            <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">
              Periode: ${currentDate} | Dibuat: ${currentDate} ${currentTime}
            </p>
          </div>

          <!-- Table -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px;">
            <thead>
              <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">No</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Tanggal Pengajuan</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Nama Customer</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Nama Properti</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Jadwal Viewing</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Status</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Alasan Penolakan</th>
              </tr>
            </thead>
            <tbody>
              ${filteredReservations
                .map(
                  (res, index) => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${
                    index + 1
                  }</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">
                    <div style="font-weight: 500;">${res.submittedDate}</div>
                    <div style="color: #6b7280; font-size: 10px;">${
                      res.submittedTime
                    }</div>
                  </td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${
                    res.customerName || "Tidak diketahui"
                  }</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${
                    res.propertyName || "Tidak diketahui"
                  }</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">
                    <div style="font-weight: 500;">${res.date}</div>
                    <div style="color: #6b7280; font-size: 10px;">${
                      res.time
                    }</div>
                  </td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 500; 
                      ${
                        res.status === "confirmed"
                          ? "background: #dbeafe; color: #1e40af;"
                          : "background: #fee2e2; color: #dc2626;"
                      }">
                      ${
                        res.status === "confirmed"
                          ? "Dikonfirmasi"
                          : "Ditolak/Dibatalkan"
                      }
                    </span>
                  </td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb; color: #6b7280; font-size: 10px;">
                    ${res.rejectionReason || "-"}
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          ${
            filteredReservations.length === 0
              ? `
            <div style="text-align: center; padding: 40px; color: #6b7280;">
              <p>Tidak ada data reservasi untuk ditampilkan</p>
            </div>
          `
              : ""
          }

          <!-- Area Tanda Tangan -->
          <div style="margin-top: 50px; padding-top: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 30px;">
                  <div style="text-align: center;">
                    <p style="margin: 0 0 60px 0; color: #6b7280; font-size: 11px;">
                      Mengetahui,<br>
                      <span style="font-weight: bold; color: #374151;">Manager Operasional</span>
                    </p>
                    <div style="border-top: 1px solid #1f2937; width: 200px; margin: 0 auto; padding-top: 5px;">
                      <p style="margin: 0; font-weight: bold; color: #1f2937; font-size: 12px;">[Nama Manager]</p>
                      <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 10px;">NIP: [NIP Manager]</p>
                    </div>
                  </div>
                </td>
                <td style="width: 50%; vertical-align: top; padding-left: 30px;">
                  <div style="text-align: center;">
                    <p style="margin: 0 0 60px 0; color: #6b7280; font-size: 11px;">
                      Jakarta, ${currentDate}<br>
                      <span style="font-weight: bold; color: #374151;">Administrator Sistem</span>
                    </p>
                    <div style="border-top: 1px solid #1f2937; width: 200px; margin: 0 auto; padding-top: 5px;">
                      <p style="margin: 0; font-weight: bold; color: #1f2937; font-size: 12px;">[Nama Admin]</p>
                      <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 10px;">NIP: [NIP Admin]</p>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 10px;">
            <p style="margin: 0;">Laporan ini dibuat secara otomatis oleh sistem Nam3Land</p>
            <p style="margin: 3px 0 0 0;">Halaman 1 | Dicetak pada: ${currentDate} ${currentTime}</p>
          </div>
        </div>
      `;

      // Wait for content to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Convert to canvas then PDF
      // Since we're using iframe, CSS is already isolated
      // Use the iframe's window for html2canvas
      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: iframe.contentWindow?.innerWidth || 794, // A4 width in pixels at 96dpi
        windowHeight: iframe.contentWindow?.innerHeight || 1123, // A4 height in pixels at 96dpi
        foreignObjectRendering: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename
      const filename = `Laporan_Reservasi_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(filename);

      // Cleanup
      document.body.removeChild(iframe);

      toast({
        title: "Berhasil",
        description: "PDF berhasil diekspor",
      });
    } catch (err) {
      console.error("Error exporting PDF:", err);
      toast({
        title: "Error",
        description: "Gagal mengekspor PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "confirmed") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Dikonfirmasi
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Ditolak/Dibatalkan
      </Badge>
    );
  };

  const confirmedCount = filteredReservations.filter(
    (r) => r.status === "confirmed"
  ).length;
  const cancelledCount = filteredReservations.filter(
    (r) => r.status === "cancelled"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Laporan Reservasi
          </h1>
          <p className="text-muted-foreground mt-2">
            Laporan reservasi yang dikonfirmasi dan ditolak/dibatalkan
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={isExporting || filteredReservations.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Mengekspor...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  Dikonfirmasi
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {confirmedCount}
                </p>
              </div>
              <div className="p-4 bg-green-100 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  Ditolak/Dibatalkan
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {cancelledCount}
                </p>
              </div>
              <div className="p-4 bg-red-100 rounded-xl">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-blue-600">
                  {filteredReservations.length}
                </p>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>
            Filter dan cari reservasi berdasarkan kriteria tertentu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari berdasarkan nama customer, properti, atau ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value: any) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                <SelectItem value="cancelled">Ditolak/Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Reservasi</CardTitle>
          <CardDescription>
            Data diurutkan berdasarkan waktu pengajuan reservasi (yang paling
            baru di atas)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={reportRef}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Memuat data...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <p>{error}</p>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Tidak ada data reservasi yang ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tanggal Pengajuan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Properti
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Jadwal Viewing
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Alasan Penolakan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredReservations.map((res, index) => (
                      <tr
                        key={res.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {res.submittedDate}
                          </div>
                          <div className="text-xs text-gray-500">
                            {res.submittedTime}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {res.customerName || "Tidak diketahui"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {res.propertyName || "Tidak diketahui"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {res.date}
                              </div>
                              <div className="text-xs text-gray-500">
                                {res.time}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(res.status)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-600 max-w-xs">
                            {res.rejectionReason || (
                              <span className="text-gray-400 italic">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
