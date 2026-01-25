import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET(req: NextRequest) {
  try {
    const agentId = req.nextUrl.searchParams.get("agentId");
    
    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    // Get properties managed by this agent
    const { data: properties, error } = await supabase
      .from("properties")
      .select(`
        id,
        name,
        title,
        type,
        location,
        price,
        created_at,
        agent_id
      `)
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching agent properties:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(properties || []);

  } catch (e: any) {
    console.error("Agent properties API error:", e);
    return NextResponse.json({ 
      error: e?.message ?? "Unknown error" 
    }, { status: 500 });
  }
}
