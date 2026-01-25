import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET(req: NextRequest) {
	try {
		const customerId = req.nextUrl.searchParams.get("customerId");
		if (!customerId) return NextResponse.json({ error: "customerId is required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();

		const [{ data: resvs }, { data: convs }] = await Promise.all([
			supabase.from("reservations").select("id,status").eq("customer_id", customerId),
			supabase.from("conversations").select("id").eq("customer_id", customerId),
		]);

		// Saved properties - kita hitung dari conversations (jika ada chat berarti ada interest)
		const savedCount = (convs ?? []).length;

		// Active reservations (pending + confirmed)
		const activeResvs = (resvs ?? []).filter((r: any) => ["pending", "confirmed"].includes(r.status)).length;

		// Unread messages - hitung dari chat_messages yang bukan dari customer
		const { data: unread } = await supabase
			.from("chat_messages")
			.select("id")
			.in(
				"conversation_id",
				(convs ?? []).map((c: any) => c.id),
			)
			.neq("sender_id", customerId);
		const unreadCount = (unread ?? []).length;

		// Properties viewed - gunakan jumlah conversations sebagai proxy
		const viewedCount = (convs ?? []).length;

		return NextResponse.json({
			savedProperties: savedCount,
			activeReservations: activeResvs,
			unreadMessages: unreadCount,
			propertiesViewed: viewedCount,
		});
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

