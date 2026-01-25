"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Calendar,
  Home,
  Clock,
  MapPin,
  Star,
} from "lucide-react";
import { formatRupiah } from "@/lib/currency";
import ActivityLog from "@/components/shared/activity-log";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<{
    totalProperties: number;
    totalAgents: number;
    thisMonthReservations: number;
    conversionRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);
  const [topAgents, setTopAgents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Fetch metrics
        const metricsRes = await fetch("/api/admin/metrics");
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setMetrics(metricsData);
        }

        // Fetch recent properties (real data)
        const propertiesRes = await fetch("/api/admin/properties");
        if (propertiesRes.ok) {
          const propertiesData = await propertiesRes.json();
          // Take only the 3 most recent properties
          setRecentProperties(propertiesData.slice(0, 3));
        }

        // Fetch agents (real data)
        const agentsRes = await fetch("/api/admin/agents");
        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();

          // Calculate agent performance metrics
          const agentsWithPerformance = await Promise.all(
            agentsData.map(async (agent: any) => {
              // Get properties for this agent
              const propsRes = await fetch(`/api/admin/properties`);
              if (propsRes.ok) {
                const allProperties = await propsRes.json();
                const agentProperties = allProperties.filter(
                  (p: any) => p.agentId === agent.id
                );

                // Get reservations for agent's properties
                const reservationsRes = await fetch("/api/agent/reservations");
                if (reservationsRes.ok) {
                  const allReservations = await reservationsRes.json();
                  const agentReservations = allReservations.filter((r: any) =>
                    agentProperties.some((p: any) => p.id === r.propertyId)
                  );

                  return {
                    ...agent,
                    properties: agentProperties.length,
                    reservations: agentReservations.length,
                    rating: 4.5 + Math.random() * 0.5, // Mock rating between 4.5-5.0
                  };
                }
              }
              return {
                ...agent,
                properties: 0,
                reservations: 0,
                rating: 4.5,
              };
            })
          );

          // Sort by performance and take top 3
          const sortedAgents = agentsWithPerformance
            .sort((a: any, b: any) => b.reservations - a.reservations)
            .slice(0, 3);
          setTopAgents(sortedAgents);
        }

        // Fetch recent reservations (real data)
        const reservationsRes = await fetch("/api/agent/reservations");
        if (reservationsRes.ok) {
          const reservationsData = await reservationsRes.json();
          // Take only the 3 most recent reservations and map customer names
          const recentReservationsMapped = reservationsData
            .slice(0, 3)
            .map((reservation: any) => ({
              ...reservation,
              customerName:
                reservation.customerName ||
                `Customer ${reservation.id.slice(0, 8)}`,
              propertyName: reservation.propertyName || "Property",
              date: reservation.date || new Date().toISOString().split("T")[0],
              status: reservation.status || "pending",
            }));
          setRecentReservations(recentReservationsMapped);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Generate activities based on real data
  const generateActivities = () => {
    const activities = [];
    const now = new Date().toISOString();

    // Add recent property activities
    recentProperties.slice(0, 2).forEach((property, index) => {
      activities.push({
        id: `prop-${property.id}`,
        action: "Properti baru ditambahkan",
        user: "Admin",
        timestamp: now,
        details: `${property.name} di ${property.location}`,
      });
    });

    // Add recent reservation activities
    recentReservations.slice(0, 2).forEach((reservation, index) => {
      activities.push({
        id: `res-${reservation.id}`,
        action:
          reservation.status === "confirmed"
            ? "Reservasi dikonfirmasi"
            : "Reservasi baru",
        user: "CS Agent",
        timestamp: now,
        details: `${reservation.customerName} untuk ${reservation.propertyName}`,
      });
    });

    // Add agent activity if there are agents
    if (topAgents.length > 0) {
      activities.push({
        id: "agent-new",
        action: "Agen aktif",
        user: "System",
        timestamp: now,
        details: `${topAgents[0].name} menangani ${topAgents[0].properties} properti`,
      });
    }

    return activities.slice(0, 4);
  };

  const activities = generateActivities();

  const stats = [
    {
      title: "Total Properti",
      value: metrics?.totalProperties ?? 0,
      description: "Total properti",
      icon: Building2,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "CS Agents",
      value: metrics?.totalAgents ?? 0,
      description: "Agen aktif",
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Reservasi",
      value: metrics?.thisMonthReservations ?? 0,
      description: "Bulan ini",
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Admin
          </h1>
          <p className="text-muted-foreground mt-2">
            Selamat datang! Pantau informasi terkini bisnis properti Anda
          </p>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Properti
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {metrics?.totalProperties ?? 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  CS Agents
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {metrics?.totalAgents ?? 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Reservasi Bulan Ini
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {metrics?.thisMonthReservations ?? 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties and Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Properti Terbaru
                </CardTitle>
                <CardDescription>
                  Properti yang baru ditambahkan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentProperties.length === 0 ? (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">Belum ada properti</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {property.image ? (
                        <img
                          src={property.image}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <Home className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {property.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {property.location}
                      </div>
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        {formatRupiah(property.price)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={
                          property.status === "available"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {property.status === "available"
                          ? "Tersedia"
                          : "Di-reservasi"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reservations */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Reservasi Terbaru
                </CardTitle>
                <CardDescription>Permintaan reservasi masuk</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentReservations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">Belum ada reservasi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">
                        {reservation.customerName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {reservation.propertyName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(reservation.date).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        reservation.status === "confirmed"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {reservation.status === "confirmed"
                        ? "Dikonfirmasi"
                        : "Menunggu"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Agents and Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Agents */}
        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Agen Terbaik
            </CardTitle>
            <CardDescription>Performa agen bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-100"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : topAgents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">Belum ada agen</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topAgents.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-100"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{agent.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {agent.email}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-blue-600">
                          {agent.properties || 0} properti
                        </span>
                        <span className="text-green-600">
                          {agent.reservations || 0} reservasi
                        </span>
                      </div>
                    </div>
                    <div className="text-right"></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Log */}
        <ActivityLog activities={activities} title="Aktivitas Terbaru" />
      </div>
    </div>
  );
}
