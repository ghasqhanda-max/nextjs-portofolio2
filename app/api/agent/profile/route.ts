import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

// Table: agent_profiles
// Columns: email (pk or unique), name, phone, bio, specialization, languages, updated_at

export async function GET(req: NextRequest) {
	try {
		const email = req.nextUrl.searchParams.get("email");
		if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

		const supabase = getServiceSupabaseClient();
		const { data, error } = await supabase
			.from("agent_profiles")
			.select("email,name,phone,bio,specialization,languages")
			.eq("email", email)
			.maybeSingle();
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json(data ?? null);
	} catch (e: any) {
		if (String(e?.message || "").includes("SUPABASE_SERVICE_ROLE_KEY")) {
			return NextResponse.json({ error: "service role key missing" }, { status: 501 });
		}
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

export async function PUT(req: NextRequest) {
	try {
		const body = await req.json();
		const { email, name, phone, bio, specialization, languages } = body || {};
		if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

		const supabase = getServiceSupabaseClient();
		const { error } = await supabase.from("agent_profiles").upsert(
			[
				{
					email,
					name: name ?? null,
					phone: phone ?? null,
					bio: bio ?? null,
					specialization: specialization ?? null,
					languages: languages ?? null,
					updated_at: new Date().toISOString(),
				},
			],
			{ onConflict: "email" }
		);
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json({ ok: true });
	} catch (e: any) {
		if (String(e?.message || "").includes("SUPABASE_SERVICE_ROLE_KEY")) {
			return NextResponse.json({ error: "service role key missing" }, { status: 501 });
		}
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
