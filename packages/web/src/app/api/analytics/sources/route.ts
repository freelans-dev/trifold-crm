import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("role, org_id")
    .eq("auth_id", user.id)
    .single()

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (!["admin", "supervisor"].includes(appUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  let query = supabase
    .from("leads")
    .select("source")
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)

  if (from) {
    query = query.gte("created_at", from)
  }
  if (to) {
    query = query.lte("created_at", to)
  }

  const { data: leads, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by source
  const sourceCounts: Record<string, number> = {}
  for (const lead of leads ?? []) {
    const src = lead.source ?? "other"
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1
  }

  const sources = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({ data: sources })
}
