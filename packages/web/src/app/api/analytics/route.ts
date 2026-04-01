import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: appUser } = await supabase
    .from("users")
    .select("role, org_id")
    .eq("auth_id", user.id)
    .single()
  if (!appUser) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Only admin/supervisor can access analytics
  if (!["admin", "supervisor"].includes(appUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get("period") ?? "month" // day, week, month
  const now = new Date()
  let since: Date

  switch (period) {
    case "day":
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case "week":
      since = new Date(now)
      since.setDate(since.getDate() - since.getDay() + 1)
      since.setHours(0, 0, 0, 0)
      break
    default:
      since = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const sinceISO = since.toISOString()

  const [
    { count: totalLeads },
    { count: newLeads },
    { data: leadsByStage },
    { data: leadsByProperty },
    { data: leadsBySource },
    { data: brokerPerformance },
    { data: lostLeads },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("created_at", sinceISO),
    supabase
      .from("kanban_stages")
      .select("id, name, slug, color, position, leads(id)")
      .eq("is_active", true)
      .order("position"),
    supabase
      .from("properties")
      .select("id, name, leads:leads(id)")
      .eq("is_active", true),
    supabase
      .from("leads")
      .select("source")
      .eq("is_active", true)
      .gte("created_at", sinceISO),
    supabase
      .from("users")
      .select("id, name, leads:leads(id, qualification_score)")
      .eq("role", "broker")
      .eq("is_active", true),
    supabase
      .from("leads")
      .select("lost_reason")
      .eq("is_active", true)
      .not("lost_reason", "is", null),
  ])

  // Process funnel
  const funnel = (leadsByStage ?? []).map((s) => ({
    name: s.name,
    slug: s.slug,
    color: s.color,
    count: Array.isArray(s.leads) ? s.leads.length : 0,
  }))

  // Process leads by property
  const byProperty = (leadsByProperty ?? []).map((p) => ({
    name: p.name,
    count: Array.isArray(p.leads) ? p.leads.length : 0,
  }))

  // Process leads by source
  const sourceCounts: Record<string, number> = {}
  for (const lead of leadsBySource ?? []) {
    const src = lead.source ?? "other"
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1
  }

  // Process broker performance
  const brokers = (brokerPerformance ?? []).map((b) => {
    const leads = Array.isArray(b.leads) ? b.leads : []
    const avgScore =
      leads.length > 0
        ? Math.round(
            leads.reduce(
              (sum: number, l: { qualification_score: number | null }) =>
                sum + (l.qualification_score ?? 0),
              0
            ) / leads.length
          )
        : 0
    return { name: b.name, totalLeads: leads.length, avgScore }
  })

  // Process lost reasons
  const lostReasons: Record<string, number> = {}
  for (const lead of lostLeads ?? []) {
    const reason = lead.lost_reason ?? "Nao informado"
    lostReasons[reason] = (lostReasons[reason] ?? 0) + 1
  }

  return NextResponse.json({
    data: {
      totalLeads: totalLeads ?? 0,
      newLeads: newLeads ?? 0,
      funnel,
      byProperty,
      bySource: sourceCounts,
      brokerPerformance: brokers,
      lostReasons,
      period,
    },
  })
}
