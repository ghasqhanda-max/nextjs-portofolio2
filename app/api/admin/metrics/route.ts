import { NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET() {
	try {
		const supabase = getServiceSupabaseClient();

		const [{ data: props }, { data: agents }, { data: resvs }] = await Promise.all([
			supabase.from("properties").select("id"),
			supabase.from("profiles").select("id").eq("role", "agent"),
			supabase
				.from("reservations")
				.select("id,status,created_at")
				.gte("created_at", new Date(new Date().setDate(1)).toISOString()),
		]);

		const totalProperties = (props ?? []).length;
		const totalAgents = (agents ?? []).length;
		const thisMonthReservations = (resvs ?? []).length;
		const confirmedCount = (resvs ?? []).filter((r: any) => r.status === "confirmed").length;
		const conversionRate = thisMonthReservations > 0 ? Math.round((confirmedCount / thisMonthReservations) * 100) : 0;

		return NextResponse.json({
			totalProperties,
			totalAgents,
			thisMonthReservations,
			conversionRate,
		});
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

