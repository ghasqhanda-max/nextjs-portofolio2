import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();

    // Get agents without status field since it doesn't exist
    const { data, error } = await supabase
      .from("profiles")
      .select("id,name,email,role,created_at")
      .eq("role", "agent")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add default status to all agents since we removed the status column
    const agentsWithStatus =
      data?.map((agent) => ({
        ...agent,
        status: "active", // All agents are considered active since we removed the status feature
      })) || [];

    console.log("Returning agents:", agentsWithStatus);
    return NextResponse.json(agentsWithStatus);
  } catch (e: any) {
    console.error("Error in agents API:", e);
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabaseClient();

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create auth user (confirmed)
    const { data: createdUser, error: createErr } = await (
      supabase.auth as any
    ).admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) {
      console.error("Failed to create auth user:", createErr);
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    const userId = createdUser.user?.id;
    if (!userId) {
      console.error("No user ID returned from auth creation");
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    console.log("Created auth user with ID:", userId);

    // Insert profile as agent (without status column)
    const { error: profErr } = await supabase.from("profiles").insert([
      {
        id: userId,
        role: "agent",
        name: name,
        email,
        phone: phone ?? null,
        created_at: new Date().toISOString(),
      },
    ]);

    if (profErr) {
      console.error("Failed to create profile:", profErr);
      // Try to clean up the auth user if profile creation fails
      try {
        await (supabase.auth as any).admin.deleteUser(userId);
      } catch (cleanupErr) {
        console.error("Failed to cleanup auth user:", cleanupErr);
      }
      return NextResponse.json({ error: profErr.message }, { status: 400 });
    }

    console.log("Successfully created agent profile for:", email);
    return NextResponse.json({
      ok: true,
      id: userId,
      message: "Agent created successfully",
    });
  } catch (e: any) {
    console.error("Error in agent creation:", e);
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

    // Check if agent has properties
    const { data: properties, error: propError } = await supabase
      .from("properties")
      .select("id")
      .eq("agent_id", id);

    if (propError) {
      console.error("Error checking properties:", propError);
      return NextResponse.json({ error: propError.message }, { status: 500 });
    }

    if (properties && properties.length > 0) {
      return NextResponse.json(
        {
          error: `Agent memiliki ${properties.length} properti. Harap hapus atau pindahkan properti terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    // Check if agent has reservations
    const { data: reservations, error: resvError } = await supabase
      .from("reservations")
      .select("id")
      .eq("agent_id", id);

    if (resvError) {
      console.error("Error checking reservations:", resvError);
      // Continue even if there's an error checking reservations
    }

    if (reservations && reservations.length > 0) {
      return NextResponse.json(
        {
          error: `Agent memiliki ${reservations.length} reservasi. Tidak dapat menghapus agen dengan reservasi aktif.`,
        },
        { status: 400 }
      );
    }

    // Delete profile
    const { error: profileErr } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id)
      .eq("role", "agent");

    if (profileErr) {
      console.error("Error deleting agent profile:", profileErr);
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // Delete auth user
    try {
      if ((supabase.auth as any)?.admin?.deleteUser) {
        await (supabase.auth as any).admin.deleteUser(id);
      }
    } catch (authErr) {
      console.error("Error deleting agent auth user:", authErr);
      // Continue even if auth deletion fails (profile is already deleted)
    }

    return NextResponse.json({
      ok: true,
      message: "Agent deleted successfully",
    });
  } catch (e: any) {
    console.error("Error in agent deletion:", e);
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
