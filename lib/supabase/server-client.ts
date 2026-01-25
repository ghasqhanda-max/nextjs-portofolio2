import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getServerSupabaseClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!url || !anonKey) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
	}

	// Bind to Next.js cookies for SSR helpers (auth persistence)
	const cookieStore = cookies();

	return createServerClient(url, anonKey, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value;
			},
			set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: "lax" | "strict" | "none" }) {
				cookieStore.set(name, value, options);
			},
			remove(name: string, options: { path?: string; domain?: string }) {
				cookieStore.set(name, "", { ...options, maxAge: 0 });
			},
		},
	});
}
