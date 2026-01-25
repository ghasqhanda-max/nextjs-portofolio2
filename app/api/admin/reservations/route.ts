import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

// Admin: get ALL reservations (pending, confirmed, completed, cancelled)
// Optionally can be filtered later via query params if needed.
export async function GET(req: NextRequest) {
	try {
		const supabase = getServiceSupabaseClient();

		const { data, error } = await supabase
			.from("reservations")
			.select(
				[
					"id",
					"customer_id",
					"property_id",
					"agent_id",
					"reservation_time",
					"status",
					"notes",
					"properties!inner(name)",
					"profiles!customer_id(name)",
				].join(","),
			)
			.order("reservation_time", { ascending: true });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// Bentuk data agar cocok dengan kebutuhan UI admin
		const mapped = (data ?? []).map((row: any) => ({
			id: row.id as string,
			customerId: row.customer_id as string,
			customerName: row.profiles?.name ?? "",
			propertyId: row.property_id as string,
			propertyName: row.properties?.name ?? "",
			// Kirim reservation_time mentah + info date/time terformat jika suatu saat dibutuhkan
			reservation_time: row.reservation_time as string,
			date: new Date(row.reservation_time).toLocaleDateString("id-ID"),
			time: new Date(row.reservation_time).toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
			}),
			status: row.status as string,
			notes: (row.notes ?? "") as string,
		}));

		return NextResponse.json(mapped);
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

// Admin: update status reservasi (confirmed / completed / cancelled, dll)
export async function PUT(req: NextRequest) {
	try {
		const { id, status } = await req.json();
		if (!id || !status) {
			return NextResponse.json({ error: "id and status are required" }, { status: 400 });
		}

		const supabase = getServiceSupabaseClient();

		// Ambil data reservasi saat ini untuk kebutuhan notifikasi & update properti
		const { data: reservation, error: fetchError } = await supabase
			.from("reservations")
			.select("customer_id, property_id, reservation_time, status")
			.eq("id", id)
			.single();

		if (fetchError) {
			return NextResponse.json({ error: fetchError.message }, { status: 500 });
		}

		// Ambil info properti (name + units) untuk update stok unit
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
			if (typeof property?.units_total === "number") unitsTotal = property.units_total;
			if (typeof property?.units_available === "number") unitsAvailable = property.units_available;
		}

		// Update status reservasi
		const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// Jika menggunakan multi-unit, sesuaikan units_available ketika status berubah
		if (reservation?.property_id && unitsTotal !== null) {
			const previousStatus = reservation.status as string | null;
			let newUnitsAvailable = unitsAvailable ?? unitsTotal;

			// Dari non-confirmed ke confirmed: pakai 1 unit (jika masih ada)
			if (status === "confirmed" && previousStatus !== "confirmed" && newUnitsAvailable > 0) {
				newUnitsAvailable -= 1;
			}

			// Dari confirmed ke cancelled: kembalikan 1 unit (asal tidak lebih dari total)
			if (status === "cancelled" && previousStatus === "confirmed" && newUnitsAvailable < unitsTotal) {
				newUnitsAvailable += 1;
			}

			// Clamp supaya tetap dalam range valid
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

		// Kirim notifikasi ke customer jika status penting berubah
		if (reservation?.customer_id && (status === "confirmed" || status === "cancelled")) {
			const reservationDate = new Date(reservation.reservation_time).toLocaleDateString("id-ID");
			const reservationTime = new Date(reservation.reservation_time).toLocaleTimeString("id-ID", {
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
				description = `Reservasi Anda untuk ${propertyName} telah dibatalkan.`;
			}

			await supabase.from("notifications").insert({
				user_id: reservation.customer_id,
				type: status === "confirmed" ? "reservation_confirmed" : "reservation_cancelled",
				title,
				description,
				related_id: id,
			});
		}

		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

// Admin: hapus reservasi
export async function DELETE(req: NextRequest) {
	try {
		const { id } = await req.json();
		if (!id) {
			return NextResponse.json({ error: "id is required" }, { status: 400 });
		}

		const supabase = getServiceSupabaseClient();

		const { error } = await supabase.from("reservations").delete().eq("id", id);
		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}


