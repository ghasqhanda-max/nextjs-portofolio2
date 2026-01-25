import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

// Endpoint untuk menambahkan kolom rejection_reason ke tabel reservations
export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceSupabaseClient();

    // Check if column already exists by trying to query it
    const { error: checkError } = await supabase
      .from("reservations")
      .select("rejection_reason")
      .limit(1);

    // If no error, column exists
    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: "Column rejection_reason already exists",
      });
    }

    // If error is about column not existing, add it
    if (
      checkError.message.includes("does not exist") ||
      checkError.message.includes("column")
    ) {
      // Use RPC to execute SQL directly
      const { error: alterError } = await supabase.rpc("exec_sql", {
        sql: "ALTER TABLE reservations ADD COLUMN IF NOT EXISTS rejection_reason TEXT;",
      });

      // If RPC doesn't work, try direct SQL execution via service role
      if (alterError) {
        // Alternative: Use Supabase REST API to execute SQL
        // For now, return instructions
        return NextResponse.json(
          {
            error:
              "Cannot add column automatically. Please run this SQL in Supabase SQL Editor:",
            sql: "ALTER TABLE reservations ADD COLUMN IF NOT EXISTS rejection_reason TEXT;",
            instructions:
              "Go to Supabase Dashboard > SQL Editor > New Query, then run the SQL above",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Column rejection_reason added successfully",
      });
    }

    return NextResponse.json({ error: checkError.message }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
