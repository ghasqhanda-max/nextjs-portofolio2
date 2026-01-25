"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  Mail,
  Calendar,
  MapPin,
  TrendingUp,
  Building2,
  Plus,
  Wrench,
  RefreshCw,
  Trash2,
  X,
  User,
  Phone,
  Clock,
} from "lucide-react";
import AgentModal from "./agent-modal";
import FixAgentModal from "./fix-agent-modal";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";

export default function AgentManagement() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedAgentForCustomers, setSelectedAgentForCustomers] =
    useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        console.log("Fetching agents...");

        const res = await fetch("/api/admin/agents");
        console.log("API Response status:", res.status);

        if (res.ok) {
          const agentsData = await res.json();
          console.log("Raw agents data:", agentsData);

          if (!Array.isArray(agentsData)) {
            console.error("Invalid agents data format:", agentsData);
            toast({
              title: "Error",
              description: "Format data agen tidak valid",
              variant: "destructive",
            });
            return;
          }

          // Fetch real performance data for each agent
          const agentsWithRealStats = await Promise.all(
            agentsData.map(async (agent: any) => {
              try {
                // Fetch agent's properties
                const propertiesRes = await fetch(
                  `/api/admin/properties?agentId=${agent.id}`
                );
                const properties = propertiesRes.ok
                  ? await propertiesRes.json()
                  : [];

                // Fetch agent's reservations
                const reservationsRes = await fetch(
                  `/api/agent/reservations?agentId=${agent.id}`
                );
                const reservations = reservationsRes.ok
                  ? await reservationsRes.json()
                  : [];

                // Calculate real stats
                const propertiesCount = Array.isArray(properties)
                  ? properties.length
                  : 0;
                const reservationsCount = Array.isArray(reservations)
                  ? reservations.length
                  : 0;

                // Get location from agent's properties (use first property's location)
                const agentLocation =
                  Array.isArray(properties) &&
                  properties.length > 0 &&
                  properties[0].location
                    ? properties[0].location
                    : "Lokasi tidak diketahui";

                // Get join date from created_at or use current date
                const joinDate = agent.created_at
                  ? new Date(agent.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                return {
                  ...agent,
                  properties: propertiesCount,
                  reservations: reservationsCount,
                  joinDate: joinDate,
                  location: agentLocation,
                };
              } catch (error) {
                console.error(
                  `Error fetching stats for agent ${agent.id}:`,
                  error
                );
                // Fallback to basic data if stats fetch fails
                return {
                  ...agent,
                  properties: 0,
                  reservations: 0,
                  joinDate: new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                  location: "Lokasi tidak diketahui",
                };
              }
            })
          );

          console.log("Processed agents with real stats:", agentsWithRealStats);
          setAgents(agentsWithRealStats);

          toast({
            title: "Berhasil",
            description: `${agentsWithRealStats.length} agen berhasil dimuat`,
          });
        } else {
          const errorData = await res.text();
          console.error("API Error:", errorData);
          toast({
            title: "Error",
            description: "Gagal memuat data agen",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat memuat data agen",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSaveAgent = async (agentData: any) => {
    try {
      const response = await fetch("/api/admin/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: agentData.email,
          password:
            agentData.password ||
            Math.random().toString(36).slice(2, 10) + "A1!",
          name: agentData.name,
          phone: agentData.phone,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Berhasil",
          description: result.message || "Agent berhasil dibuat",
        });
        setShowModal(false);
        setSelectedAgent(null);
        // Refresh agents list
        window.location.reload();
      } else {
        const error = await response.json();
        console.error("Agent creation error:", error);
        toast({
          title: "Error",
          description: error.error || "Gagal membuat agent",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat agent",
        variant: "destructive",
      });
    }
  };

  const handleSyncProfiles = async () => {
    try {
      const response = await fetch("/api/admin/sync-auth-profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Berhasil",
          description:
            result.message || `${result.synced} profile berhasil disinkronkan`,
        });
        // Refresh agents list
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result.error || "Gagal sinkronisasi profiles",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat sinkronisasi profiles",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAgent = async (agent: any) => {
    // Check if agent has properties
    if (agent.properties > 0) {
      toast({
        title: "Tidak dapat menghapus",
        description: `Agen ini memiliki ${agent.properties} properti. Harap hapus atau pindahkan properti terlebih dahulu.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Yakin ingin menghapus agen ${agent.name || agent.email}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/agents?id=${encodeURIComponent(agent.id)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Agen berhasil dihapus",
        });
        // Remove agent from list
        setAgents(agents.filter((a) => a.id !== agent.id));
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Gagal menghapus agen",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus agen",
        variant: "destructive",
      });
    }
  };

  // Filter and search agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [agents, searchTerm]);

  // Calculate stats
  const stats = {
    total: agents.length,
    totalProperties: agents.reduce((sum, a) => sum + (a.properties || 0), 0),
    totalReservations: agents.reduce(
      (sum, a) => sum + (a.reservations || 0),
      0
    ),
  };

  const topAgentsByReservations = useMemo(
    () =>
      [...agents]
        .sort((a, b) => (b.reservations || 0) - (a.reservations || 0))
        .map((a) => ({
          id: a.id,
          name: a.name || a.email || "Agen",
          reservations: a.reservations || 0,
        })),
    [agents]
  );

  const handleAgentClick = async (agentData: any) => {
    if (!agentData || !agentData.id) return;

    const agent = agents.find((a) => a.id === agentData.id);
    if (!agent) return;

    setSelectedAgentForCustomers(agent);
    setShowCustomerModal(true);
    setLoadingCustomers(true);
    setCustomers([]);

    try {
      const response = await fetch(`/api/agent/customers?agentId=${agent.id}`);
      if (response.ok) {
        const customerData = await response.json();
        setCustomers(customerData || []);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data customer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data customer",
        variant: "destructive",
      });
    } finally {
      setLoadingCustomers(false);
    }
  };

  const reservationsChartConfig = {
    reservations: {
      label: "Reservasi",
      color: "hsl(142 71% 45%)",
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Manajemen Agen
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola dan pantau performa agen properti Anda
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Agen</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Users className="w-3 h-3" />
                  <span>Semua agen</span>
                </div>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  Total Properti
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalProperties}
                </p>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Building2 className="w-3 h-3" />
                  <span>Dikelola agen</span>
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
                <p className="text-sm font-medium text-gray-600">
                  Total Reservasi
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalReservations}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Calendar className="w-3 h-3" />
                  <span>Dari semua agen</span>
                </div>
              </div>
              <div className="p-4 bg-green-100 rounded-xl">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Agents by Reservations - Chart */}
      {topAgentsByReservations.length > 0 && (
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 via-white to-sky-50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Agen dengan Reservasi Terbanyak
                </CardTitle>
                <CardDescription>
                  Semua agen dengan jumlah reservasi (klik pada bar untuk
                  melihat detail customer)
                </CardDescription>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                {stats.totalReservations} total reservasi
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer
              config={reservationsChartConfig}
              className="w-full h-96 rounded-xl border border-emerald-100 bg-white/80 px-3 py-2"
            >
              <BarChart
                data={topAgentsByReservations}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    const agentData = data.activePayload[0].payload;
                    handleAgentClick(agentData);
                  }
                }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickMargin={8}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(16,185,129,0.08)" }}
                  content={
                    <ChartTooltipContent
                      labelClassName="text-xs font-semibold"
                      formatter={(value) => [`${value} reservasi`, "Total"]}
                    />
                  }
                />
                <Bar
                  dataKey="reservations"
                  fill="var(--color-reservations)"
                  radius={[8, 8, 4, 4]}
                  barSize={32}
                >
                  {topAgentsByReservations.map((entry, index) => (
                    <Cell key={`cell-${index}`} style={{ cursor: "pointer" }} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                placeholder="Cari berdasarkan nama atau email agen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat data agen...</p>
          </div>
        </div>
      ) : filteredAgents.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "Tidak ada agen yang ditemukan"
                : "Belum ada data agen"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Coba ubah kata kunci pencarian atau filter"
                : "Agen akan muncul di sini setelah dibuat"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card
              key={agent.id}
              className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {agent.name?.charAt(0)?.toUpperCase() ||
                        agent.email?.charAt(0)?.toUpperCase() ||
                        "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg truncate">
                          {agent.name || "Tanpa Nama"}
                        </CardTitle>
                        <Badge
                          variant="default"
                          className="bg-green-500 text-white text-xs whitespace-nowrap px-2 py-0.5 flex-shrink-0"
                        >
                          Aktif
                        </Badge>
                      </div>
                      <p
                        className="text-sm text-muted-foreground break-words not-italic font-normal"
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          lineHeight: "1.5",
                        }}
                      >
                        {agent.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate min-w-0 flex-1">
                    {agent.location || "Lokasi tidak diketahui"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate min-w-0 flex-1">
                    Bergabung {agent.joinDate}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {agent.properties}
                    </p>
                    <p className="text-xs text-muted-foreground">Properti</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">
                      {agent.reservations}
                    </p>
                    <p className="text-xs text-muted-foreground">Reservasi</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAgent(agent)}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Agen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Agent Modal */}
      {showModal && (
        <AgentModal
          agent={selectedAgent}
          onSave={handleSaveAgent}
          onClose={() => {
            setShowModal(false);
            setSelectedAgent(null);
          }}
        />
      )}

      {/* Fix Agent Modal */}
      {showFixModal && (
        <FixAgentModal
          onClose={() => setShowFixModal(false)}
          onSuccess={() => {
            // Refresh agents list after fixing
            window.location.reload();
          }}
        />
      )}

      {/* Customer Modal */}
      {showCustomerModal && selectedAgentForCustomers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Customer yang Mereservasi
                    </h2>
                    <p className="text-blue-100 mt-1 not-italic font-normal">
                      Agen:{" "}
                      {selectedAgentForCustomers.name ||
                        selectedAgentForCustomers.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setSelectedAgentForCustomers(null);
                    setCustomers([]);
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingCustomers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      Memuat data customer...
                    </p>
                  </div>
                </div>
              ) : customers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Belum ada customer yang mereservasi
                  </h3>
                  <p className="text-muted-foreground">
                    Agen ini belum memiliki reservasi dari customer
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Total:{" "}
                      <span className="font-semibold text-gray-900">
                        {customers.length}
                      </span>{" "}
                      customer
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {customers.map((customer: any) => (
                      <Card
                        key={customer.id}
                        className="border border-gray-200 hover:shadow-lg transition-all duration-200"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {customer.name?.charAt(0)?.toUpperCase() || "C"}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-800 text-lg">
                                  {customer.name || "Tanpa Nama"}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {customer.propertyInterest ||
                                    "Properti tidak diketahui"}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={
                                customer.status === "confirmed"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : customer.status === "pending"
                                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                                  : "bg-gray-100 text-gray-700 border border-gray-200"
                              }
                            >
                              {customer.status || "pending"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium text-gray-800 not-italic font-normal">
                                  {customer.email || "-"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Telepon</p>
                                <p className="text-sm font-medium text-gray-800">
                                  {customer.phone || "-"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Bergabung
                                </p>
                                <p className="text-sm font-medium text-gray-800">
                                  {customer.joinDate || "-"}
                                </p>
                              </div>
                            </div>
                            {customer.lastActivity && (
                              <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Aktivitas Terakhir
                                  </p>
                                  <p className="text-sm font-medium text-gray-800">
                                    {new Date(
                                      customer.lastActivity
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
