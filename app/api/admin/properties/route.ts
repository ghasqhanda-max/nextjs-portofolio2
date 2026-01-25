import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service-client";

function toExpectedAgentEmail(name?: string, fallback?: string) {
	const base = (name || fallback || "agent").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
	const parts = base.split(" ").filter(Boolean);
	const last = parts[parts.length - 1] || base || "agent";
	return `${last}agent@nam3land.com`;
}

export async function GET(req: NextRequest) {
	try {
		const supabase = getServiceSupabaseClient();
		const agentId = req.nextUrl.searchParams.get("agentId");
		
		let query = supabase
			.from("properties")
			.select(
				"id,name,location,price,beds,baths,sqft,image,description,status,agent_id,created_at,units_total,units_available,agent:agent_id(name,email)"
			)
			.order("created_at", { ascending: false });
		
		// Filter by agentId if provided
		if (agentId) {
			query = query.eq("agent_id", agentId);
		}
		
		const { data, error } = await query;
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });

		const mapped = (data ?? []).map((p: any) => ({
			id: p.id,
			name: p.name,
			location: p.location ?? "",
			price: Number(p.price ?? 0),
			beds: Number(p.beds ?? 0),
			baths: Number(p.baths ?? 0),
			sqft: Number(p.sqft ?? 0),
			image: p.image ?? "",
			description: p.description ?? "",
			status: p.status,
			unitsTotal: typeof p.units_total === "number" ? p.units_total : undefined,
			unitsAvailable:
				typeof p.units_available === "number"
					? p.units_available
					: typeof p.units_total === "number"
						? p.units_total
						: undefined,
			agent: p.agent?.name ?? p.agent?.email ?? "",
			agentId: p.agent_id ?? "",
			createdAt: new Date(p.created_at).toISOString().split("T")[0],
		}));
		return NextResponse.json(mapped);
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const {
			name,
			location,
			price,
			beds,
			baths,
			sqft,
			image,
			description,
			status,
			agentId,
			autoCreateAgent,
			agentDisplayName,
			agentPassword,
			expectedAgentEmail,
			unitsTotal,
			unitsAvailable,
		} = body || {};
		if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();

		let finalAgentId = agentId ?? null;
		if (autoCreateAgent) {
			const email = (expectedAgentEmail as string) || toExpectedAgentEmail(name);
			// look up user by profiles
			const { data: existing } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
			if (existing?.id) {
				finalAgentId = existing.id;
			} else {
				// create auth user
				const password = agentPassword || Math.random().toString(36).slice(2, 10) + "A1!";
				const { data: created, error: createErr } = await (supabase.auth as any).admin.createUser({
					email,
					password,
					email_confirm: true,
				});
				if (createErr) return NextResponse.json({ error: createErr.message }, { status: 400 });
				finalAgentId = created.user?.id ?? null;
				if (finalAgentId) {
					await supabase.from("profiles").insert([{ id: finalAgentId, role: "agent", name: agentDisplayName || "CS Agent", email }]);
				}
			}
		}

		const { data, error } = await supabase
			.from("properties")
			.insert([
				{
					name,
					location: location ?? null,
					price: price ?? null,
					beds: beds ?? null,
					baths: baths ?? null,
					sqft: sqft ?? null,
					image: image ?? null,
					description: description ?? null,
					status: status ?? "available",
					agent_id: finalAgentId,
					// multi-unit support (optional columns in DB)
					units_total: typeof unitsTotal === "number" ? unitsTotal : null,
					units_available:
						typeof unitsAvailable === "number"
							? unitsAvailable
							: typeof unitsTotal === "number"
								? unitsTotal
								: null,
				},
			])
			.select("id")
			.single();
		if (error) {
			console.error("Error inserting property (admin POST):", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// Create notifications for all customers when new property is added
		if (data?.id) {
			const { data: customers } = await supabase.from("profiles").select("id").eq("role", "customer");
			if (customers && customers.length > 0) {
				await supabase.from("notifications").insert(
					customers.map((c) => ({
						user_id: c.id,
						type: "property_new",
						title: "Properti Baru Tersedia",
						description: `${name} telah ditambahkan. Lihat properti ini sekarang!`,
						related_id: data.id,
					}))
				);
			}
		}

		return NextResponse.json({ ok: true, id: data?.id });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

export async function PUT(req: NextRequest) {
	try {
		const body = await req.json();
		const {
			id,
			name,
			location,
			price,
			beds,
			baths,
			sqft,
			image,
			description,
			status,
			agentId,
			autoCreateAgent,
			agentDisplayName,
			agentPassword,
			expectedAgentEmail,
			unitsTotal,
			unitsAvailable,
		} = body || {};
		if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();

		let finalAgentId = agentId ?? undefined;
		if (autoCreateAgent) {
			const email = (expectedAgentEmail as string) || toExpectedAgentEmail(name);
			const { data: existing } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
			if (existing?.id) {
				finalAgentId = existing.id;
			} else {
				const password = agentPassword || Math.random().toString(36).slice(2, 10) + "A1!";
				const { data: created, error: createErr } = await (supabase.auth as any).admin.createUser({ email, password, email_confirm: true });
				if (createErr) return NextResponse.json({ error: createErr.message }, { status: 400 });
				finalAgentId = created.user?.id ?? undefined;
				if (finalAgentId) {
					await supabase.from("profiles").insert([{ id: finalAgentId, role: "agent", name: agentDisplayName || "CS Agent", email }]);
				}
			}
		}

		const { error } = await supabase
			.from("properties")
			.update({
				name: name ?? undefined,
				location: location ?? undefined,
				price: price ?? undefined,
				beds: beds ?? undefined,
				baths: baths ?? undefined,
				sqft: sqft ?? undefined,
				image: image ?? undefined,
				description: description ?? undefined,
				status: status ?? undefined,
				agent_id: finalAgentId,
				// multi-unit support
				units_total: typeof unitsTotal === "number" ? unitsTotal : undefined,
				units_available: typeof unitsAvailable === "number" ? unitsAvailable : undefined,
			})
			.eq("id", id);
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const id = url.searchParams.get("id");
		if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
		const supabase = getServiceSupabaseClient();

		// Ambil agent_id sebelum properti dihapus
		const { data: prop, error: fetchErr } = await supabase
			.from("properties")
			.select("agent_id")
			.eq("id", id)
			.maybeSingle();
		if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

		const agentId = prop?.agent_id as string | undefined;

		// Hapus properti
		const { error } = await supabase.from("properties").delete().eq("id", id);
		if (error) return NextResponse.json({ error: error.message }, { status: 500 });

		// Jika properti punya agent, cek apakah masih ada properti lain untuk agent tsb.
		if (agentId) {
			const { count, error: countError } = await supabase
				.from("properties")
				.select("id", { count: "exact", head: true })
				.eq("agent_id", agentId);

			if (!countError && (count ?? 0) === 0) {
				// Tidak ada properti lain: hapus profile & akun auth agen.
				const { error: profileErr } = await supabase.from("profiles").delete().eq("id", agentId);
				if (profileErr) {
					console.error("Error deleting agent profile after property delete:", profileErr);
				}

				try {
					if ((supabase.auth as any)?.admin?.deleteUser) {
						await (supabase.auth as any).admin.deleteUser(agentId);
					}
				} catch (authErr) {
					console.error("Error deleting agent auth user after property delete:", authErr);
				}
			}
		}

		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
	}
}
