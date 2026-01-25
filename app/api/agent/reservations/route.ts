import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET(req: NextRequest) {
  try {
    const agentId = req.nextUrl.searchParams.get("agentId");
    const supabase = getServiceSupabaseClient();

    // First, check if rejection_reason column exists
    const { error: columnCheckError } = await supabase
      .from("reservations")
      .select("rejection_reason")
      .limit(1);

    const hasRejectionReasonColumn =
      !columnCheckError ||
      (!columnCheckError.message.includes("does not exist") &&
        !columnCheckError.message.includes("column"));

    // Build query without rejection_reason first (safer)
    let query = supabase
      .from("reservations")
      .select(
        "id,customer_id,property_id,agent_id,reservation_time,status,notes,properties(name),profiles!customer_id(name)"
      )
      .order("reservation_time", { ascending: true });

    // Filter by agentId if provided
    if (agentId) {
      query = query.eq("agent_id", agentId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching reservations with joins:", error);
      // Fallback: fetch reservations first, then related data separately
      let baseQuery = supabase
        .from("reservations")
        .select(
          "id,customer_id,property_id,agent_id,reservation_time,status,notes"
        )
        .order("reservation_time", { ascending: true });

      if (agentId) {
        baseQuery = baseQuery.eq("agent_id", agentId);
      }

      const { data: baseData, error: baseError } = await baseQuery;
      if (baseError) {
        return NextResponse.json({ error: baseError.message }, { status: 500 });
      }

      // Fetch related data separately
      const mapped = await Promise.all(
        (baseData ?? []).map(async (row: any) => {
          const [propertyRes, profileRes] = await Promise.all([
            supabase
              .from("properties")
              .select("name")
              .eq("id", row.property_id)
              .maybeSingle(),
            supabase
              .from("profiles")
              .select("name")
              .eq("id", row.customer_id)
              .maybeSingle(),
          ]);

          // Try to get rejection_reason if column exists
          let rejectionReason = "";
          if (hasRejectionReasonColumn) {
            const { data: resvData } = await supabase
              .from("reservations")
              .select("rejection_reason")
              .eq("id", row.id)
              .maybeSingle();
            rejectionReason = resvData?.rejection_reason ?? "";
          }

          return {
            id: row.id,
            customerId: row.customer_id,
            customerName: profileRes.data?.name ?? "",
            propertyId: row.property_id,
            propertyName: propertyRes.data?.name ?? "",
            date: new Date(row.reservation_time).toLocaleDateString("id-ID"),
            time: new Date(row.reservation_time).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: row.status,
            notes: row.notes ?? "",
            rejectionReason: rejectionReason,
          };
        })
      );

      return NextResponse.json(mapped);
    }

    // If column exists, fetch rejection_reason separately for each row
    let mapped = (data ?? []).map((row: any) => ({
      id: row.id,
      customerId: row.customer_id,
      customerName: row.profiles?.name ?? "",
      propertyId: row.property_id,
      propertyName: row.properties?.name ?? "",
      date: new Date(row.reservation_time).toLocaleDateString("id-ID"),
      time: new Date(row.reservation_time).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: row.status,
      notes: row.notes ?? "",
      rejectionReason: "", // Will be populated if column exists
    }));

    // If column exists, fetch rejection_reason for all reservations
    if (hasRejectionReasonColumn && mapped.length > 0) {
      const ids = mapped.map((r) => r.id);
      const { data: rejectionData } = await supabase
        .from("reservations")
        .select("id,rejection_reason")
        .in("id", ids);

      if (rejectionData) {
        const rejectionMap = new Map(
          rejectionData.map((r: any) => [r.id, r.rejection_reason ?? ""])
        );
        mapped = mapped.map((r) => ({
          ...r,
          rejectionReason: rejectionMap.get(r.id) ?? "",
        }));
      }
    }

    return NextResponse.json(mapped);
  } catch (e: any) {
    console.error("Exception in GET reservations:", e);
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status, rejection_reason } = await req.json();
    if (!id || !status)
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );

    // If status is cancelled, rejection_reason is required
    if (status === "cancelled" && !rejection_reason) {
      return NextResponse.json(
        { error: "rejection_reason is required when rejecting a reservation" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabaseClient();

    // Get current reservation to get customer_id and current status
    const { data: reservation } = await supabase
      .from("reservations")
      .select("customer_id, property_id, reservation_time, status")
      .eq("id", id)
      .single();

    // Get property info separately (name + units)
    let propertyName = "properti";
    let unitsTotal: number | null = null;
    let unitsAvailable: number | null = null;
    if (reservation?.property_id) {
      const { data: property } = await supabase
        .from("properties")
        .select("name, units_total, units_available, status")
        .eq("id", reservation.property_id)
        .single();
      propertyName = property?.name || "properti";
      if (typeof property?.units_total === "number")
        unitsTotal = property.units_total;
      if (typeof property?.units_available === "number")
        unitsAvailable = property.units_available;
    }

    // Update reservation status and rejection_reason if provided
    const updateData: any = { status };
    if (status === "cancelled" && rejection_reason) {
      // Check if column exists before trying to update
      const { error: columnCheckError } = await supabase
        .from("reservations")
        .select("rejection_reason")
        .limit(1);

      const hasRejectionReasonColumn =
        !columnCheckError ||
        (!columnCheckError.message.includes("does not exist") &&
          !columnCheckError.message.includes("column"));

      if (hasRejectionReasonColumn) {
        updateData.rejection_reason = rejection_reason;
      } else {
        console.warn(
          "rejection_reason column does not exist. Please run ADD_REJECTION_REASON_COLUMN.sql"
        );
      }
    }
    const { error } = await supabase
      .from("reservations")
      .update(updateData)
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    // Multi-unit handling: adjust units_available when moving between statuses
    if (reservation?.property_id && unitsTotal !== null) {
      const previousStatus = reservation.status as string | null;
      let newUnitsAvailable = unitsAvailable ?? unitsTotal;

      // From non-confirmed to confirmed: consume 1 unit (if available)
      if (
        status === "confirmed" &&
        previousStatus !== "confirmed" &&
        newUnitsAvailable > 0
      ) {
        newUnitsAvailable -= 1;
      }

      // From confirmed to cancelled: release 1 unit (if not exceeding total)
      if (
        status === "cancelled" &&
        previousStatus === "confirmed" &&
        newUnitsAvailable < unitsTotal
      ) {
        newUnitsAvailable += 1;
      }

      // Clamp to valid range
      if (newUnitsAvailable < 0) newUnitsAvailable = 0;
      if (newUnitsAvailable > unitsTotal) newUnitsAvailable = unitsTotal;

      if (newUnitsAvailable !== (unitsAvailable ?? unitsTotal)) {
        const nextStatus = newUnitsAvailable > 0 ? "available" : "reserved";
        const { error: propertyError } = await supabase
          .from("properties")
          .update({
            units_available: newUnitsAvailable,
            status: nextStatus,
          })
          .eq("id", reservation.property_id);

        if (propertyError) {
          console.error("Error updating property units/status:", propertyError);
        }
      }
    }

    // Create notification if status is confirmed or cancelled
    if (
      reservation?.customer_id &&
      (status === "confirmed" || status === "cancelled")
    ) {
      const reservationDate = new Date(
        reservation.reservation_time
      ).toLocaleDateString("id-ID");
      const reservationTime = new Date(
        reservation.reservation_time
      ).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      let title = "";
      let description = "";

      if (status === "confirmed") {
        title = "Reservasi Dikonfirmasi";
        description = `Reservasi Anda untuk ${propertyName} pada ${reservationDate} pukul ${reservationTime} telah dikonfirmasi.`;
      } else if (status === "cancelled") {
        title = "Reservasi Dibatalkan";
        description = rejection_reason
          ? `Reservasi Anda untuk ${propertyName} telah dibatalkan. Alasan: ${rejection_reason}`
          : `Reservasi Anda untuk ${propertyName} telah dibatalkan.`;
      }

      await supabase.from("notifications").insert({
        user_id: reservation.customer_id,
        type:
          status === "confirmed"
            ? "reservation_confirmed"
            : "reservation_cancelled",
        title,
        description,
        related_id: id,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
