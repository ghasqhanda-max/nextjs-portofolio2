import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";

export async function GET() {
	try {
		const supabase = getServerSupabaseClient();
		const { data, error } = await supabase.auth.getSession();
		if (error) {
			return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
		}
		return NextResponse.json({ ok: true, hasSession: Boolean(data.session) });
	} catch (e: any) {
		return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
