import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function POST(req: NextRequest) {
	try {
		const { conversationId, senderId, senderRole, message } = await req.json();
		console.log("=== AGENT MESSAGE DEBUG ===");
		console.log("Received data:", { conversationId, senderId, senderRole, message });
		
		if (!conversationId || !senderId || !senderRole || !message) {
			return NextResponse.json({ error: "conversationId, senderId, senderRole, message are required" }, { status: 400 });
		}
		const supabase = getServiceSupabaseClient();

		// Insert message
		const { error } = await supabase.from("chat_messages").insert([
			{ conversation_id: conversationId, sender_id: senderId, sender_role: senderRole, message },
		]);
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });

		// If agent sends message, create notification for customer
		if (senderRole === "agent") {
			const { data: conversation } = await supabase
				.from("conversations")
				.select("customer_id, agent_id, property_id")
				.eq("id", conversationId)
				.single();

			if (conversation?.customer_id) {
				// Get agent name from profiles table (not agent_profiles)
				const { data: agentProfile } = await supabase
					.from("profiles")
					.select("name")
					.eq("id", senderId)
					.single();

				// Get property name if property_id exists
				let propertyName = "properti";
				if (conversation.property_id) {
					const { data: property } = await supabase
						.from("properties")
						.select("name")
						.eq("id", conversation.property_id)
						.single();
					propertyName = property?.name || "properti";
				}

				const agentName = agentProfile?.name || "Agen";

				console.log("Creating notification for customer:", conversation.customer_id);
				console.log("Agent name:", agentName);
				console.log("Message:", message);

				const { error: notifError } = await supabase.from("notifications").insert({
					user_id: conversation.customer_id,
					type: "message",
					title: `Pesan baru dari ${agentName}`,
					description: message.length > 100 ? message.substring(0, 100) + "..." : message,
					related_id: conversationId,
				});

				if (notifError) {
					console.error("Error creating notification:", notifError);
				} else {
					console.log("Notification created successfully");
				}
			}
		}

		// Update conversation last_message
		await supabase
			.from("conversations")
			.update({ last_message: message, last_message_time: new Date().toISOString() })
			.eq("id", conversationId);

		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
