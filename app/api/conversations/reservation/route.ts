import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET(req: NextRequest) {
	try {
		const conversationId = req.nextUrl.searchParams.get("conversationId");
		if (!conversationId) return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();

		// Get conversation to infer customer and property
		const { data: conv, error: convErr } = await supabase
			.from("conversations")
			.select("id,customer_id,property_id,properties(name)")
			.eq("id", conversationId)
			.maybeSingle();
		if (convErr) return NextResponse.json({ error: convErr.message }, { status: 500 });
		if (!conv) return NextResponse.json(null);

		const { data: resv, error: resErr } = await supabase
			.from("reservations")
			.select("id,reservation_time,status,notes")
			.eq("customer_id", conv.customer_id)
			.eq("property_id", conv.property_id)
			.order("reservation_time", { ascending: false })
			.limit(1)
			.maybeSingle();
		if (resErr) return NextResponse.json({ error: resErr.message }, { status: 500 });

		if (!resv) return NextResponse.json(null);

		return NextResponse.json({
			id: resv.id,
			propertyName: Array.isArray(conv.properties) && conv.properties.length > 0 ? conv.properties[0].name : "",
			status: resv.status,
			reservationTime: resv.reservation_time,
			notes: resv.notes ?? "",
		});
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
