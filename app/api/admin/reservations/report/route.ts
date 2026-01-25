import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

// API untuk mendapatkan data reservasi yang cancelled dan confirmed untuk report
export async function GET(req: NextRequest) {
	try {
		const supabase = getServiceSupabaseClient();

		// Check if rejection_reason column exists
		const { error: columnCheckError } = await supabase
			.from("reservations")
			.select("rejection_reason")
			.limit(1);
		
		const hasRejectionReasonColumn = !columnCheckError || 
			!columnCheckError.message.includes("does not exist") && 
			!columnCheckError.message.includes("column");

		// Build query - get only cancelled and confirmed reservations
		// Sort by created_at (waktu pengajuan reservasi) - yang paling baru di atas
		let query = supabase
			.from("reservations")
			.select("id,customer_id,property_id,agent_id,reservation_time,created_at,status,notes,properties(name),profiles!customer_id(name)")
			.in("status", ["cancelled", "confirmed"])
			.order("created_at", { ascending: false }); // Paling baru mengajukan reservasi di atas

		if (hasRejectionReasonColumn) {
			query = supabase
				.from("reservations")
				.select("id,customer_id,property_id,agent_id,reservation_time,created_at,status,notes,rejection_reason,properties(name),profiles!customer_id(name)")
				.in("status", ["cancelled", "confirmed"])
				.order("created_at", { ascending: false }); // Paling baru mengajukan reservasi di atas
		}

		const { data, error } = await query;
		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// Map data untuk report
		const mapped = (data ?? []).map((row: any) => ({
			id: row.id,
			customerId: row.customer_id,
			customerName: row.profiles?.name ?? "Tidak diketahui",
			propertyId: row.property_id,
			propertyName: row.properties?.name ?? "Tidak diketahui",
			reservationTime: row.reservation_time,
			createdAt: row.created_at, // Waktu pengajuan reservasi
			date: new Date(row.reservation_time).toLocaleDateString("id-ID", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
			time: new Date(row.reservation_time).toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
			}),
			submittedDate: row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}) : "",
			submittedTime: row.created_at ? new Date(row.created_at).toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
			}) : "",
			status: row.status,
			notes: row.notes ?? "",
			rejectionReason: row.rejection_reason ?? "",
		}));

		return NextResponse.json(mapped);
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

