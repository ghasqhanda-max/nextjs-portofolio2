"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, CheckCircle, Clock, XCircle } from "lucide-react";

interface ReservationRow {
  id: string;
  customerId: string;
  customerName: string;
  propertyId: string;
  propertyName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string;
  rejectionReason?: string;
}

export default function AgentReservations() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "confirmed" | "cancelled"
  >("all");
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    const id =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!id) {
      console.warn("No agentId found in localStorage");
    }
    setAgentId(id);
  }, []);

  useEffect(() => {
    (async () => {
      if (!agentId) {
        console.warn("No agentId available, skipping fetch");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/agent/reservations?agentId=${encodeURIComponent(agentId)}`
        );
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched reservations:", data);
          setReservations(Array.isArray(data) ? data : []);
        } else {
          const errorData = await res
            .json()
            .catch(() => ({ error: "Unknown error" }));
          console.error("Error fetching reservations:", errorData);
          // Don't show alert for empty results, just log
          if (res.status !== 500) {
            setReservations([]);
          } else {
            alert(
              `Gagal memuat reservasi: ${errorData.error || "Unknown error"}`
            );
          }
        }
      } catch (error) {
        console.error("Exception fetching reservations:", error);
        // Don't show alert for network errors, just log
        setReservations([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [agentId]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      const matchesSearch =
        res.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || res.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, filterStatus]);

  const handleConfirmReservation = async (id: string) => {
    try {
      const res = await fetch("/api/agent/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "confirmed" }),
      });
      if (res.ok) {
        // Refresh reservations from server
        const fetchRes = await fetch(
          `/api/agent/reservations?agentId=${encodeURIComponent(agentId!)}`
        );
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setReservations(data);
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gagal mengonfirmasi reservasi");
      }
    } catch (error) {
      console.error("Error confirming reservation:", error);
      alert("Terjadi kesalahan saat mengonfirmasi reservasi");
    }
  };

  const handleOpenRejectModal = (id: string) => {
    setSelectedReservationId(id);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedReservationId(null);
    setRejectionReason("");
  };

  const handleRejectReservation = async () => {
    if (!selectedReservationId || !rejectionReason.trim()) {
      alert("Harap isi alasan penolakan");
      return;
    }

    setIsRejecting(true);
    try {
      const res = await fetch("/api/agent/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedReservationId,
          status: "cancelled",
          rejection_reason: rejectionReason.trim(),
        }),
      });
      if (res.ok) {
        // Refresh reservations from server
        const fetchRes = await fetch(
          `/api/agent/reservations?agentId=${encodeURIComponent(agentId!)}`
        );
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setReservations(data);
        }
        handleCloseRejectModal();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gagal menolak reservasi");
      }
    } catch (error) {
      console.error("Error rejecting reservation:", error);
      alert("Terjadi kesalahan saat menolak reservasi");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reservasi Saya</h1>
        <p className="text-muted-foreground mt-2">
          Kelola reservasi pelanggan untuk properti Anda
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
                placeholder="Cari berdasarkan pelanggan atau properti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "confirmed", "cancelled"] as const).map(
                (status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    onClick={() => setFilterStatus(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                )
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Memuat reservasi...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {reservation.customerName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {reservation.propertyName}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 ${
                          reservation.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : reservation.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : reservation.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {reservation.status === "confirmed" && (
                          <CheckCircle size={14} />
                        )}
                        {reservation.status === "pending" && (
                          <Clock size={14} />
                        )}
                        {reservation.status === "cancelled" && (
                          <XCircle size={14} />
                        )}
                        {reservation.status === "completed" && (
                          <CheckCircle size={14} />
                        )}
                        {reservation.status.charAt(0).toUpperCase() +
                          reservation.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Tanggal:</span>{" "}
                        {reservation.date}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Waktu:</span>{" "}
                        {reservation.time}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Catatan:</span>{" "}
                        {reservation.notes || "-"}
                      </p>
                      {reservation.status === "cancelled" &&
                        reservation.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm font-medium text-red-800 mb-1">
                              Alasan Penolakan:
                            </p>
                            <p className="text-sm text-red-700">
                              {reservation.rejectionReason}
                            </p>
                          </div>
                        )}
                    </div>

                    {reservation.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            handleConfirmReservation(reservation.id)
                          }
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Konfirmasi
                        </Button>
                        <Button
                          onClick={() => handleOpenRejectModal(reservation.id)}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredReservations.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Tidak ada reservasi</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reject Reservation Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Reservasi</DialogTitle>
            <DialogDescription>
              Harap berikan alasan mengapa Anda menolak reservasi ini. Alasan
              ini akan dikirim ke pelanggan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Masukkan alasan penolakan reservasi..."
                rows={4}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseRejectModal}
              disabled={isRejecting}
            >
              Batal
            </Button>
            <Button
              onClick={handleRejectReservation}
              disabled={isRejecting || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRejecting ? "Menolak..." : "Tolak Reservasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
