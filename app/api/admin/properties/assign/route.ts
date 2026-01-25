import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function PUT(req: NextRequest) {
	try {
		const { propertyId, agentId } = await req.json();
		if (!propertyId || !agentId) {
			return NextResponse.json({ error: "propertyId and agentId are required" }, { status: 400 });
		}
		const supabase = getServiceSupabaseClient();

		// Update property assignment
		const { error } = await supabase
			.from("properties")
			.update({ agent_id: agentId })
			.eq("id", propertyId);
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });

		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
