import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

// Usage examples:
// GET /api/agents/validate?agentId=<uuid>&propertyId=<uuid>
// GET /api/agents/validate?agentId=<uuid>&propertyName=Sunset%20Villa
export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const agentId = url.searchParams.get("agentId");
		const propertyId = url.searchParams.get("propertyId");
		const propertyName = url.searchParams.get("propertyName");
		if (!agentId || (!propertyId && !propertyName)) {
			return NextResponse.json({ error: "agentId and (propertyId or propertyName) are required" }, { status: 400 });
		}
		const supabase = getServiceSupabaseClient();

		let query = supabase
			.from("properties")
			.select("id,name,agent_id,agent:agent_id(name,email)")
			.eq("agent_id", agentId)
			.limit(1);

		if (propertyId) {
			query = query.eq("id", propertyId);
		} else if (propertyName) {
			query = query.ilike("name", propertyName);
		}

		const { data, error } = await query.maybeSingle();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });

		if (!data) {
			return NextResponse.json({ assigned: false });
		}
		return NextResponse.json({ assigned: true, propertyId: data.id, propertyName: data.name, agent: data.agent });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
