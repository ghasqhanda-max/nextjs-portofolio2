import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function POST(req: NextRequest) {
  try {
    const { email, name, role = "agent" } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ success: true, message: "Profile already exists" });
    }

    // Get user from auth by email - try different approach
    let authUser = null;
    try {
      const { data: authUsers, error: authError } = await (supabase.auth as any).admin.listUsers();
      if (authError) {
        console.error("Error listing users:", authError);
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }

      authUser = authUsers.users.find((user: any) => user.email === email);
      if (!authUser) {
        return NextResponse.json({ error: `User ${email} not found in authentication system` }, { status: 404 });
      }
      
      console.log("Found auth user:", authUser.id, "for email:", email);
    } catch (error) {
      console.error("Error getting auth user:", error);
      return NextResponse.json({ error: "Failed to get user from authentication system" }, { status: 500 });
    }

    // Create profile for existing auth user
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authUser.id,
        email: email,
        name: name || email.split('@')[0], // Use email prefix as default name
        role: role,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Profile created for ${email}`,
      userId: authUser.id 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
