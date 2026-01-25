import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function POST(req: NextRequest) {
  try {
    const { email, name, userId } = await req.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "email and userId are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabaseClient();

    // Cek apakah profile sudah ada
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        message: "Profile already exists",
      });
    }

    // Buat profile customer
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      email,
      name: name || email,
      role: "customer",
      created_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Customer profile created",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
