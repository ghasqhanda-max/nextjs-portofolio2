import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function POST(req: NextRequest) {
  try {
    const { customerId, propertyId, reservationTime, notes } = await req.json();
    if (!customerId || !propertyId || !reservationTime) {
      return NextResponse.json(
        { error: "customerId, propertyId, reservationTime are required" },
        { status: 400 }
      );
    }
    const supabase = getServiceSupabaseClient();

    // Cek apakah sudah ada reservasi aktif (pending / confirmed) untuk
    // kombinasi customer + property ini. Jika ada, tolak pembuatan baru.
    const { data: existingActive, error: existingErr } = await supabase
      .from("reservations")
      .select("id,status")
      .eq("customer_id", customerId)
      .eq("property_id", propertyId)
      .in("status", ["pending", "confirmed"]);
    if (existingErr) {
      return NextResponse.json({ error: existingErr.message }, { status: 500 });
    }
    if ((existingActive ?? []).length > 0) {
      return NextResponse.json(
        {
          error: "Anda sudah memiliki jadwal viewing aktif untuk properti ini.",
        },
        { status: 400 }
      );
    }

    const { data: prop, error: propErr } = await supabase
      .from("properties")
      .select("id,agent_id")
      .eq("id", propertyId)
      .maybeSingle();
    if (propErr)
      return NextResponse.json({ error: propErr.message }, { status: 500 });
    if (!prop?.agent_id)
      return NextResponse.json(
        { error: "Property has no assigned agent" },
        { status: 400 }
      );
    const agentId = prop.agent_id as string;

    const { data: newReservation, error: resvErr } = await supabase
      .from("reservations")
      .insert([
        {
          customer_id: customerId,
          property_id: propertyId,
          agent_id: agentId,
          reservation_time: reservationTime,
          status: "pending",
          notes: notes ?? null,
        },
      ])
      .select("id")
      .single();
    if (resvErr)
      return NextResponse.json({ error: resvErr.message }, { status: 500 });

    // Get property name for notification
    const { data: property } = await supabase
      .from("properties")
      .select("name")
      .eq("id", propertyId)
      .single();
    const propertyName = property?.name || "properti";

    // Create notification for customer
    const reservationDate = new Date(reservationTime).toLocaleDateString(
      "id-ID"
    );
    const reservationTimeStr = new Date(reservationTime).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    await supabase.from("notifications").insert({
      user_id: customerId,
      type: "reservation_pending",
      title: "Reservasi Berhasil Dibuat",
      description: `Reservasi Anda untuk ${propertyName} pada ${reservationDate} pukul ${reservationTimeStr} telah dibuat dan menunggu konfirmasi dari agen.`,
      related_id: newReservation?.id || null,
    });

    const { data: existingConv } = await supabase
      .from("conversations")
      .select("id")
      .eq("customer_id", customerId)
      .eq("agent_id", agentId)
      .eq("property_id", propertyId)
      .limit(1)
      .maybeSingle();

    let conversationId = existingConv?.id as string | undefined;
    if (!conversationId) {
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert([
          {
            customer_id: customerId,
            agent_id: agentId,
            property_id: propertyId,
            status: "active",
            last_message_time: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();
      if (convErr)
        return NextResponse.json({ error: convErr.message }, { status: 500 });
      conversationId = conv?.id as string;
    }

    return NextResponse.json({ ok: true, conversationId });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const customerId = req.nextUrl.searchParams.get("customerId");
    if (!customerId)
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    const supabase = getServiceSupabaseClient();
    // Check if rejection_reason column exists
    const { error: columnCheckError } = await supabase
      .from("reservations")
      .select("rejection_reason")
      .limit(1);

    const hasRejectionReasonColumn =
      !columnCheckError ||
      (!columnCheckError.message.includes("does not exist") &&
        !columnCheckError.message.includes("column"));

    // Build query - include rejection_reason if column exists
    let query = supabase
      .from("reservations")
      .select(
        "id,property_id,agent_id,reservation_time,status,notes,properties(name)"
      )
      .eq("customer_id", customerId)
      .order("reservation_time", { ascending: true });

    if (hasRejectionReasonColumn) {
      query = supabase
        .from("reservations")
        .select(
          "id,property_id,agent_id,reservation_time,status,notes,rejection_reason,properties(name)"
        )
        .eq("customer_id", customerId)
        .order("reservation_time", { ascending: true });
    }

    const { data, error } = await query;
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    const mapped = (data ?? []).map((r: any) => ({
      id: r.id,
      propertyId: r.property_id,
      propertyName: r.properties?.name ?? "",
      date: new Date(r.reservation_time).toLocaleDateString("id-ID"),
      time: new Date(r.reservation_time).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: r.status,
      notes: r.notes ?? "",
      rejectionReason: r.rejection_reason ?? "",
    }));
    return NextResponse.json(mapped);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status)
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    const supabase = getServiceSupabaseClient();
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, customerId } = await req.json();
    if (!id || !customerId)
      return NextResponse.json(
        { error: "id and customerId are required" },
        { status: 400 }
      );

    const supabase = getServiceSupabaseClient();

    // First check if reservation exists and belongs to the customer
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("status, customer_id")
      .eq("id", id)
      .single();

    if (fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    if (!reservation)
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    if (reservation.customer_id !== customerId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Check if reservation is in a deletable status (not pending)
    if (reservation.status === "pending") {
      return NextResponse.json(
        { error: "Cannot delete pending reservations" },
        { status: 400 }
      );
    }

    // Delete the reservation
    const { error: deleteError } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id);

    if (deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
