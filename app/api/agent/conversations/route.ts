import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const agentId = url.searchParams.get("agentId");
    const conversationId = url.searchParams.get("conversationId");
    const supabase = getServiceSupabaseClient();

    // Get messages for specific conversation
    if (conversationId) {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(
          "id,conversation_id,sender_id,sender_role,message,created_at,profiles:sender_id(name)"
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });
      const mapped = (data ?? []).map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        senderName: m.profiles?.name ?? "",
        senderRole: m.sender_role,
        message: m.message,
        timestamp: new Date(m.created_at).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: true,
      }));
      return NextResponse.json(mapped);
    }

    // Get list of conversations for an agent
    if (!agentId)
      return NextResponse.json(
        { error: "agentId is required" },
        { status: 400 }
      );
    const { data, error } = await supabase
      .from("conversations")
      .select(
        "id,customer_id,agent_id,property_id,status,last_message,last_message_time,properties(name),profiles:customer_id(name)"
      )
      .eq("agent_id", agentId)
      .order("last_message_time", { ascending: false });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    const mapped = (data ?? []).map((c: any) => ({
      id: c.id,
      customerId: c.customer_id,
      customerName: c.profiles?.name ?? "",
      agentId: c.agent_id,
      propertyId: c.property_id,
      propertyName: c.properties?.name ?? "",
      status: c.status,
      lastMessage: c.last_message ?? "",
      lastMessageTime: c.last_message_time
        ? new Date(c.last_message_time).toLocaleString("id-ID")
        : "",
      unreadCount: 0,
    }));
    return NextResponse.json(mapped);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

// Update conversation (e.g. end/close chat)
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getServiceSupabaseClient();
    const body = await req.json();
    const { conversationId, status } = body as {
      conversationId?: string;
      status?: string;
    };

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    // For now we only allow known statuses, especially "completed" to end chat
    const allowedStatuses = ["active", "pending", "completed"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid or missing status" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("conversations")
      .update({ status })
      .eq("id", conversationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
