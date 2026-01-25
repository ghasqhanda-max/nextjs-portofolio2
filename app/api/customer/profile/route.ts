import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET(req: NextRequest) {
  try {
    const customerId = req.nextUrl.searchParams.get("customerId");
    
    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    // Get customer profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email, created_at")
      .eq("id", customerId)
      .eq("role", "customer")
      .single();

    if (profileError) {
      console.error("Error fetching customer profile:", profileError);
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (!profile) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Get additional customer details from auth.users if needed
    const { data: authUser, error: authError } = await supabase
      .from("auth.users")
      .select("phone, raw_user_meta_data")
      .eq("id", customerId)
      .single();

    // Combine profile data with additional info
    const customerProfile = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: authUser?.phone || authUser?.raw_user_meta_data?.phone || null,
      address: authUser?.raw_user_meta_data?.address || null,
      created_at: profile.created_at
    };

    return NextResponse.json(customerProfile);

  } catch (e: any) {
    console.error("Customer profile API error:", e);
    return NextResponse.json({ 
      error: e?.message ?? "Unknown error" 
    }, { status: 500 });
  }
}
