import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

export async function POST(req: NextRequest) {
	try {
		const { email, password, name, phone } = await req.json();
		if (!email || !password) return NextResponse.json({ error: "email and password are required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();

		// Create auth user (confirmed)
		const { data: createdUser, error: createErr } = await (supabase.auth as any).admin.createUser({
			email,
			password,
			email_confirm: true,
		});
		if (createErr) return NextResponse.json({ error: createErr.message }, { status: 400 });
		const userId = createdUser.user?.id;
		if (!userId) return NextResponse.json({ error: "failed to create user" }, { status: 500 });

		// Insert profile as customer
		const { error: profErr } = await supabase.from("profiles").insert([
			{ id: userId, role: "customer", name: name ?? null, email, phone: phone ?? null },
		]);
		if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
