import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET(req: NextRequest) {
	try {
		const customerId = req.nextUrl.searchParams.get("customerId");
		if (!customerId) return NextResponse.json({ error: "customerId is required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();

		const { data, error } = await supabase
			.from("notifications")
			.select("*")
			.eq("user_id", customerId)
			.order("created_at", { ascending: false })
			.limit(50);

		if (error) throw error;

		const formatted = (data ?? []).map((notif) => ({
			id: notif.id,
			type: notif.type,
			title: notif.title,
			description: notif.description,
			relatedId: notif.related_id,
			isRead: notif.is_read,
			timestamp: new Date(notif.created_at).toLocaleString("id-ID"),
			createdAt: notif.created_at,
		}));

		return NextResponse.json({ notifications: formatted });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

export async function PUT(req: NextRequest) {
	try {
		const { id, isRead } = await req.json();
		if (!id) return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();

		const { data, error } = await supabase
			.from("notifications")
			.update({ is_read: isRead ?? true })
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return NextResponse.json(data);
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");
		if (!id) return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();

		const { error } = await supabase.from("notifications").delete().eq("id", id);
		if (error) throw error;
		return NextResponse.json({ success: true });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

