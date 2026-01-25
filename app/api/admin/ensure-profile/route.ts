import { NextRequest, NextResponse } from "next/server"
import { getServiceSupabaseClient } from "@/lib/supabase/service-client"

export async function POST(req: NextRequest) {
  try {
    const { email, name, userId } = await req.json()
    
    if (!email || !userId) {
      return NextResponse.json({ error: "email and userId are required" }, { status: 400 })
    }

    const supabase = getServiceSupabaseClient()
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ success: true, message: "Profile already exists" })
    }

    // Create admin profile
    const { error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: email,
        name: name || "Admin",
        role: "admin",
        created_at: new Date().toISOString()
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Admin profile created" })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 })
  }
}
