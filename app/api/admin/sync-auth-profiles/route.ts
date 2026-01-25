import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceSupabaseClient();
    
    // Get all users from auth
    const { data: authUsers, error: authError } = await (supabase.auth as any).admin.listUsers();
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Get all existing profiles
    const { data: existingProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email");
    
    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || []);
    const missingProfiles = [];

    // Find users in auth but not in profiles
    for (const user of authUsers.users) {
      if (!existingProfileIds.has(user.id)) {
        // Determine role based on email pattern or default to customer
        let role = "customer";
        if (user.email?.includes("agent")) {
          role = "agent";
        } else if (user.email?.includes("admin")) {
          role = "admin";
        }

        missingProfiles.push({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || "User",
          role: role,
          created_at: new Date().toISOString()
        });
      }
    }

    if (missingProfiles.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "All auth users already have profiles",
        synced: 0
      });
    }

    // Insert missing profiles
    const { error: insertError } = await supabase
      .from("profiles")
      .insert(missingProfiles);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${missingProfiles.length} profiles`,
      synced: missingProfiles.length,
      profiles: missingProfiles.map(p => ({ email: p.email, role: p.role }))
    });

  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
