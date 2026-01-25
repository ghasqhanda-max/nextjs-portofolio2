import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const customerId = url.searchParams.get("customerId");
		const conversationId = url.searchParams.get("conversationId");
		const supabase = getServiceSupabaseClient();

		if (conversationId) {
			const { data, error } = await supabase
				.from("chat_messages")
				.select("id,conversation_id,sender_id,sender_role,message,created_at,profiles:sender_id(name)")
				.eq("conversation_id", conversationId)
				.order("created_at", { ascending: true });
			if (error) return NextResponse.json({ error: error.message }, { status: 500 });
			const mapped = (data ?? []).map((m: any) => ({
				id: m.id,
				conversationId: m.conversation_id,
				senderId: m.sender_id,
				senderName: m.profiles?.name ?? "",
				senderRole: m.sender_role,
				message: m.message,
				timestamp: new Date(m.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
				isRead: true,
			}));
			return NextResponse.json(mapped);
		}

		if (!customerId) return NextResponse.json({ error: "customerId is required" }, { status: 400 });
		const { data, error } = await supabase
			.from("conversations")
			.select("id,customer_id,agent_id,property_id,status,last_message,last_message_time,properties(name),agent:agent_id(name)")
			.eq("customer_id", customerId)
			.order("last_message_time", { ascending: false });
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		const mapped = (data ?? []).map((c: any) => ({
			id: c.id,
			customerId: c.customer_id,
			agentId: c.agent_id,
			agentName: c.agent?.name ?? "",
			propertyId: c.property_id,
			propertyName: c.properties?.name ?? "",
			status: c.status,
			lastMessage: c.last_message ?? "",
			lastMessageTime: c.last_message_time ? new Date(c.last_message_time).toLocaleString("id-ID") : "",
			unreadCount: 0,
		}));
		return NextResponse.json(mapped);
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
