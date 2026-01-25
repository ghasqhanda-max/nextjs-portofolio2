import { NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET() {
	try {
		const supabase = getServiceSupabaseClient();
		const { data, error } = await supabase
			.from("properties")
			.select("id,name,location,price,beds,baths,sqft,image,description,status,agent_id,created_at,units_total,units_available")
			.order("created_at", { ascending: false });
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });

		// map untuk memastikan kompatibilitas ke depan
		const mapped = (data ?? []).map((p: any) => ({
			...p,
			units_total: typeof p.units_total === "number" ? p.units_total : null,
			units_available:
				typeof p.units_available === "number"
					? p.units_available
					: typeof p.units_total === "number"
						? p.units_total
						: null,
		}));

		return NextResponse.json(mapped);
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
