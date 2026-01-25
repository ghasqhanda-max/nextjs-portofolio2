import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function GET(req: NextRequest) {
	try {
		const email = req.nextUrl.searchParams.get("email");
		if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();
		const { data, error } = await supabase
			.from("profiles")
			.select("id,role,name,email")
			.eq("email", email)
			.maybeSingle();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json(data ?? null);
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
