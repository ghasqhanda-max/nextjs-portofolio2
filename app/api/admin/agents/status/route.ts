import { NextResponse } from "next/server"
import { getServiceSupabaseClient } from "@/lib/supabase/service-client"

export async function PUT(req: Request) {
  try {
    const { agentId, status } = await req.json()
    
    console.log("Toggle agent status request:", { agentId, status })
    
    if (!agentId || !status) {
      console.log("Missing required fields:", { agentId, status })
      return NextResponse.json({ error: "agentId and status are required" }, { status: 400 })
    }

    if (!['active', 'inactive'].includes(status)) {
      console.log("Invalid status:", status)
      return NextResponse.json({ error: "status must be 'active' or 'inactive'" }, { status: 400 })
    }

    const supabase = getServiceSupabaseClient()
    
    // First check if agent exists
    const { data: existingAgent, error: checkError } = await supabase
      .from("profiles")
      .select("id, email, role, status")
      .eq("id", agentId)
      .eq("role", "agent")
      .maybeSingle()

    if (checkError) {
      console.log("Error checking agent:", checkError)
      return NextResponse.json({ error: "Error checking agent: " + checkError.message }, { status: 500 })
    }

    if (!existingAgent) {
      console.log("Agent not found:", agentId)
      return NextResponse.json({ error: "Agent not found or not an agent" }, { status: 404 })
    }

    console.log("Found agent:", existingAgent)
    
    // Update agent status in profiles table
    const { error } = await supabase
      .from("profiles")
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq("id", agentId)
      .eq("role", "agent")

    if (error) {
      console.log("Error updating agent status:", error)
      return NextResponse.json({ error: "Failed to update agent status: " + error.message }, { status: 500 })
    }

    console.log("Successfully updated agent status:", { agentId, newStatus: status })
    return NextResponse.json({ success: true, status, message: "Agent status updated successfully" })
  } catch (error: any) {
    console.log("Unexpected error:", error)
    return NextResponse.json({ error: error?.message ?? "Unknown error" }, { status: 500 })
  }
}
