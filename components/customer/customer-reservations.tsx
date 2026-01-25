"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  X,
  XCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser-client";

interface CustomerReservation {
  id: string;
  propertyName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string;
  rejectionReason?: string;
}

export default function CustomerReservations() {
  const [reservations, setReservations] = useState<CustomerReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "confirmed" | "completed" | "cancelled"
  >("all");

  const fetchReservations = useCallback(async () => {
    const customerId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!customerId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `/api/customer/reservations?customerId=${encodeURIComponent(
          customerId
        )}`
      );
      if (res.ok) setReservations(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();

    // Setup realtime subscription for reservations updates
    const customerId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!customerId) return;

    const supabase = getBrowserSupabaseClient();
    const channel = supabase
      .channel("reservations")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reservations",
          filter: `customer_id=eq.${customerId}`,
        },
        () => {
          // Refresh reservations when status changes
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const matchesSearch = res.propertyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || res.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, filterStatus]);

  const handleCancelReservation = async (id: string) => {
    const customerId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!customerId) return;

    const res = await fetch(`/api/customer/reservations`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "cancelled" }),
    });
    if (res.ok) {
      // Refresh to get latest data
      fetchReservations();
    }
  };

  const handleDeleteReservation = async (id: string) => {
    const customerId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!customerId) return;

    if (!confirm("Apakah Anda yakin ingin menghapus riwayat reservasi ini?")) {
      return;
    }

    try {
      const res = await fetch(`/api/customer/reservations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, customerId }),
      });
      if (res.ok) {
        // Refresh to get latest data
        fetchReservations();
      } else {
        alert("Gagal menghapus reservasi. Silakan coba lagi.");
      }
    } catch (error) {
      alert("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reservasi Saya</h1>
        <p className="text-muted-foreground mt-2">
          Lihat dan kelola jadwal viewing properti Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservasi</CardTitle>
          <CardDescription>
            Total: {filteredReservations.length} reservasi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-3 text-muted-foreground"
                size={18}
              />
              <Input
                placeholder="Cari berdasarkan nama properti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "confirmed", "completed", "cancelled"].map(
                (status) => (
                  <Button
                    key={status}
                    variant={
                      filterStatus === (status as any) ? "default" : "outline"
                    }
                    onClick={() => setFilterStatus(status as any)}
                    className="capitalize text-xs"
                  >
                    {status}
                  </Button>
                )
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Memuat reservasi...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-4 border border-border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {reservation.propertyName}
                      </h3>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 ${
                        reservation.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : reservation.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : reservation.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : reservation.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {reservation.status === "cancelled" && (
                        <XCircle size={14} />
                      )}
                      {reservation.status === "pending" && <Clock size={14} />}
                      {reservation.status === "confirmed" && (
                        <CheckCircle size={14} />
                      )}
                      {reservation.status.charAt(0).toUpperCase() +
                        reservation.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={16} />
                      {reservation.date}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={16} />
                      {reservation.time}
                    </div>
                    {reservation.notes && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Catatan:
                        </p>
                        <p className="text-muted-foreground">
                          {reservation.notes}
                        </p>
                      </div>
                    )}
                    {reservation.status === "cancelled" &&
                      reservation.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <div className="flex items-start gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-red-800 mb-1">
                                Reservasi Ditolak oleh Agent
                              </p>
                              <p className="text-xs text-red-700 mb-2">
                                Alasan penolakan:
                              </p>
                              <p className="text-sm text-red-800 bg-white p-2 rounded border border-red-100">
                                {reservation.rejectionReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {reservation.status === "pending" && (
                    <Button
                      onClick={() => handleCancelReservation(reservation.id)}
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={16} className="mr-2" />
                      Batalkan Reservasi
                    </Button>
                  )}
                  {reservation.status === "confirmed" && (
                    <div className="space-y-2">
                      <div className="text-center text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                        Reservasi Anda telah dikonfirmasi. Silakan hubungi agen
                        jika perlu perubahan.
                      </div>
                      <Button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X size={16} className="mr-2" />
                        Hapus Riwayat
                      </Button>
                    </div>
                  )}
                  {reservation.status === "cancelled" && (
                    <div className="space-y-2">
                      {reservation.rejectionReason && (
                        <div className="text-center text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <XCircle size={16} />
                            <span className="font-semibold">
                              Reservasi Ditolak
                            </span>
                          </div>
                          <p className="text-xs text-red-600 mt-1">
                            Agent telah menolak reservasi Anda. Silakan hubungi
                            agent untuk informasi lebih lanjut.
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X size={16} className="mr-2" />
                        Hapus Riwayat
                      </Button>
                    </div>
                  )}
                  {reservation.status === "completed" && (
                    <Button
                      onClick={() => handleDeleteReservation(reservation.id)}
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={16} className="mr-2" />
                      Hapus Riwayat
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && filteredReservations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tidak ada reservasi</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
