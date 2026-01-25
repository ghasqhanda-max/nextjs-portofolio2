import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET(req: NextRequest) {
	try {
		const agentId = req.nextUrl.searchParams.get("agentId");
		if (!agentId) return NextResponse.json({ error: "agentId is required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();

		const [{ data: convs }, { data: resvPending }, { data: customers }] = await Promise.all([
			supabase.from("conversations").select("id").eq("agent_id", agentId),
			supabase.from("reservations").select("id").eq("agent_id", agentId).eq("status", "pending"),
			supabase.from("conversations").select("customer_id").eq("agent_id", agentId),
		]);

		const assignedCustomers = new Set((customers ?? []).map((r: any) => r.customer_id)).size;
		return NextResponse.json({
			activeChats: (convs ?? []).length,
			assignedCustomers,
			pendingReservations: (resvPending ?? []).length,
			avgResponseMinutes: null,
		});
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
