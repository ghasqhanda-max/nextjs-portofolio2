import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET(req: NextRequest) {
	try {
		const agentId = req.nextUrl.searchParams.get("agentId");
		if (!agentId) return NextResponse.json({ error: "agentId is required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();

		// Gather customers from reservations (primary source for status)
		const { data: resvs, error: resErr } = await supabase
			.from("reservations")
			.select("customer_id,agent_id,property_id,reservation_time,profiles:customer_id(name,email,phone),properties(name),status")
			.eq("agent_id", agentId);
		if (resErr) return NextResponse.json({ error: resErr.message }, { status: 500 });

		// Gather customers from conversations (secondary source)
		const { data: convs, error: convErr } = await supabase
			.from("conversations")
			.select("id,customer_id,agent_id,property_id,last_message_time,profiles:customer_id(name,email,phone),properties(name)")
			.eq("agent_id", agentId);
		if (convErr) return NextResponse.json({ error: convErr.message }, { status: 500 });

		const map = new Map<string, any>();
		
		// Process reservations first (they have the authoritative status)
		for (const r of resvs ?? []) {
			const key = r.customer_id as string;
			const existing = map.get(key);
			const activity = r.reservation_time;
			// Always use reservation data if it exists, as it has the real status
			if (!existing || new Date(activity) > new Date(existing.lastActivity || 0)) {
				map.set(key, {
					id: key,
					name: r.profiles?.name ?? "",
					email: r.profiles?.email ?? "",
					phone: r.profiles?.phone ?? "",
					propertyInterest: r.properties?.name ?? "",
					status: r.status || "pending", // Use actual reservation status
					joinDate: new Date(activity).toISOString().slice(0, 10),
					lastActivity: activity,
				});
			}
		}
		
		// Process conversations only for customers not in reservations
		for (const c of convs ?? []) {
			const key = c.customer_id as string;
			const existing = map.get(key);
			// Only add conversation data if no reservation exists for this customer
			if (!existing) {
				map.set(key, {
					id: key,
					name: c.profiles?.name ?? "",
					email: c.profiles?.email ?? "",
					phone: c.profiles?.phone ?? "",
					propertyInterest: c.properties?.name ?? "",
					status: "pending", // Default status for conversation-only customers
					joinDate: new Date(c.last_message_time || Date.now()).toISOString().slice(0, 10),
					lastActivity: c.last_message_time,
				});
			}
		}

		const customers = Array.from(map.values()).sort(
			(a, b) => new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime(),
		);
		return NextResponse.json(customers);
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
