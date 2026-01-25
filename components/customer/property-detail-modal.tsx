"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Calendar,
  MessageSquare,
  Eye,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PropertyRow {
  id: string;
  name: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  description: string;
  status: "available" | "reserved" | "sold";
  agent?: string;
  units_total?: number;
  units_available?: number;
}

interface PropertyDetailModalProps {
  property: PropertyRow;
  onClose: () => void;
}

interface Property extends PropertyRow {
  status: "available" | "reserved" | "sold";
  // tambahkan properti lain yang diperlukan
}

export default function PropertyDetailModal({
  property: initialProperty,
  onClose,
}: PropertyDetailModalProps) {
  const router = useRouter();
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledConversationId, setScheduledConversationId] = useState<
    string | null
  >(null);
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const [reservationStatus, setReservationStatus] = useState<string | null>(
    null
  );
  const [property, setProperty] = useState<Property>({
    ...initialProperty,
    status:
      (initialProperty.status as "available" | "reserved" | "sold") ||
      "available",
  });

  const unitsTotal =
    (property as any).units_total ?? (property as any).unitsTotal ?? 1;
  const unitsAvailable =
    (property as any).units_available ??
    (property as any).unitsAvailable ??
    unitsTotal;
  const isSold = property.status === "sold";
  const isFull = !isSold && unitsAvailable <= 0;

  // Generate agent email based on property name
  const generateAgentEmail = (propertyName: string): string => {
    // Remove special characters and spaces, convert to lowercase
    const cleanName = propertyName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, ""); // Remove spaces

    return `${cleanName}agent@nam3land.com`;
  };

  const agentEmail = generateAgentEmail(property.name);

  // Cek status properti dan reservasi
  const checkPropertyAndReservation = useCallback(async () => {
    const customerId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!customerId) return;

    try {
      // Reset state terlebih dahulu
      setHasActiveReservation(false);
      setReservationStatus(null);
      setScheduledConversationId(null);

      // Cek status properti terbaru
      const propResponse = await fetch(`/api/properties/${property.id}`);
      if (propResponse.ok) {
        const propData = await propResponse.json();
        setProperty((prev: Property) => ({ ...prev, status: propData.status }));
      }

      // Cek reservasi aktif hanya untuk customer yang login
      const resvResponse = await fetch(
        `/api/customer/reservations?customerId=${customerId}&propertyId=${property.id}`
      );
      if (resvResponse.ok) {
        const resvData = await resvResponse.json();

        // Endpoint ini sudah difilter berdasarkan customerId,
        // jadi di sini kita cukup cek apakah ada reservasi untuk properti ini
        // dengan status pending atau confirmed.
        if (Array.isArray(resvData) && resvData.length > 0) {
          const customerReservation = resvData.find(
            (r: any) =>
              r.propertyId === property.id &&
              ["pending", "confirmed"].includes(r.status)
          );

          if (customerReservation) {
            setHasActiveReservation(true);
            setReservationStatus(customerReservation.status);
          }
        }
      }
    } catch (error) {
      console.error("Error checking property and reservation:", error);
      setHasActiveReservation(false);
      setReservationStatus(null);
    }
  }, [property.id]);

  // Jalankan pengecekan saat komponen dimuat dan properti berubah
  useEffect(() => {
    // Reset state terlebih dahulu
    setHasActiveReservation(false);
    setReservationStatus(null);

    // Lakukan pengecekan
    checkPropertyAndReservation();

    // Set interval untuk auto-refresh setiap 30 detik (dikurangi dari 10 detik untuk mengurangi beban server)
    const interval = setInterval(checkPropertyAndReservation, 30000);

    // Cleanup interval saat komponen di-unmount
    return () => clearInterval(interval);
  }, [checkPropertyAndReservation, property.id]);

  const handleSchedule = async () => {
    const customerId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!customerId || !date || !time) {
      alert("Harap isi tanggal dan waktu");
      return;
    }

    const selectedDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();
    if (selectedDateTime < now) {
      alert("Tanggal dan waktu tidak boleh di masa lalu");
      return;
    }

    setIsScheduling(true);
    try {
      const reservationTime = new Date(`${date}T${time}:00`).toISOString();
      const res = await fetch("/api/customer/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          propertyId: property.id,
          reservationTime,
          notes,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Gagal membuat reservasi");
      setShowReservationForm(false);
      if (payload?.conversationId) {
        setScheduledConversationId(payload.conversationId);
        // Simpan pilihan percakapan agar halaman chat bisa fokus
        localStorage.setItem("selectedConversationId", payload.conversationId);
      }
    } catch (e) {
      alert("Gagal menjadwalkan viewing. Coba lagi.");
    } finally {
      setIsScheduling(false);
    }
  };

  const goToChat = () => {
    router.push("/dashboard/customer/chat");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{property.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-blue-100">{property.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-8 space-y-8">
            {/* Enhanced Image Gallery */}
            <div className="relative">
              <div className="w-full h-80 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={property.image || "/placeholder.svg"}
                  alt={property.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/diverse-property-showcase.png";
                  }}
                />
                {/* Status & Units Badge */}
                <div className="absolute top-4 left-4 space-y-2">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                      isSold
                        ? "bg-gray-500 text-white"
                        : isFull
                        ? "bg-orange-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {isSold ? "Terjual" : isFull ? "Penuh" : "Tersedia"}
                  </span>
                  {!isSold && (
                    <span className="block px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 shadow">
                      {unitsAvailable}/{unitsTotal} unit tersisa
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  Rp {property.price.toLocaleString("id-ID")}
                </div>
                <div className="text-gray-600 text-lg">/bulan</div>
              </div>
            </div>

            {/* Enhanced Key Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Bed className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {property.beds}
                </div>
                <div className="text-sm text-gray-600">Kamar Tidur</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Bath className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {property.baths}
                </div>
                <div className="text-sm text-gray-600">Kamar Mandi</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Maximize2 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {property.sqft.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">m² Luas</div>
              </div>
            </div>

            {/* Enhanced Description Section */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Tentang Properti
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Agent & Status Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-800">
                    Status Properti
                  </h3>
                </div>
                <span
                  className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
                    isSold
                      ? "bg-gray-100 text-gray-700 border border-gray-200"
                      : isFull
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
                      : "bg-green-100 text-green-700 border border-green-200"
                  }`}
                >
                  {isSold ? "Terjual" : isFull ? "Penuh" : "Tersedia"}
                </span>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-800">Agen Properti</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nama Agen</p>
                    <p className="text-gray-800 font-medium">
                      {property.agent || "Agent Properti"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <a
                      href={`mailto:${agentEmail}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors underline"
                    >
                      {agentEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Features */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Fitur Properti
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: Bed,
                    label: `${property.beds} Kamar Tidur`,
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    icon: Bath,
                    label: `${property.baths} Kamar Mandi`,
                    color: "bg-green-100 text-green-600",
                  },
                  {
                    icon: Maximize2,
                    label: `${property.sqft.toLocaleString()} m²`,
                    color: "bg-purple-100 text-purple-600",
                  },
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className={`p-2 rounded-lg ${feature.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-700">
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Actions */}
            <div className="bg-white border-t border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {scheduledConversationId || hasActiveReservation || isFull ? (
                  <div className="flex-1 space-y-3">
                    <div className="w-full space-y-3">
                      <Button
                        onClick={goToChat}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-5 h-5" />
                        {reservationStatus === "confirmed"
                          ? "Lihat Detail Viewing"
                          : "Chat dengan CS"}
                      </Button>

                      {isFull && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg
                                className="h-5 w-5 text-yellow-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-yellow-700">
                                Properti ini sudah direservasi. Silakan hubungi
                                CS untuk informasi lebih lanjut.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {reservationStatus === "pending" && (
                        <p className="text-sm text-amber-600 text-center">
                          Menunggu konfirmasi jadwal viewing Anda
                        </p>
                      )}

                      {reservationStatus === "confirmed" && (
                        <p className="text-sm text-green-600 text-center">
                          Viewing Anda sudah dikonfirmasi
                        </p>
                      )}
                    </div>
                  </div>
                ) : isSold ? (
                  <div className="flex-1 space-y-3">
                    <Button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 font-semibold py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Sudah Terjual
                    </Button>
                    <p className="text-sm text-gray-600 text-center">
                      Properti ini sudah terjual
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowReservationForm(true)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Jadwalkan Viewing
                  </Button>
                )}
              </div>
            </div>

            {/* Enhanced Reservation Form */}
            {showReservationForm &&
              !hasActiveReservation &&
              !scheduledConversationId &&
              !isSold &&
              !isFull && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Jadwalkan Viewing
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tanggal Viewing
                        </label>
                        <input
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Waktu Viewing
                        </label>
                        <input
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          type="time"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Catatan Tambahan
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Permintaan khusus atau pertanyaan tentang properti..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowReservationForm(false)}
                        className="flex-1 border-2 border-gray-300 hover:bg-gray-50 font-semibold py-3 rounded-xl"
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={handleSchedule}
                        disabled={isScheduling}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        {isScheduling ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Konfirmasi Jadwal
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
