import { NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"

export async function GET() {
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

  const orgId = appUser.org_id
  const now = new Date()

  // Start of today (UTC)
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString()

  // Start of this week (Monday)
  const dayOfWeek = now.getUTCDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - mondayOffset
    )
  ).toISOString()

  // Start of this month
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString()

  try {
    // Run all queries in parallel
    const [
      leadsTodayResult,
      qualifiedLeadsWeekResult,
      scheduledVisitsWeekResult,
      totalLeadsMonthResult,
      qualifiedLeadsMonthResult,
      pipelineCountsResult,
      leadsByPropertyResult,
    ] = await Promise.all([
      // Leads created today
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .gte("created_at", todayStart),

      // Qualified leads this week
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("stage", "qualified")
        .gte("qualified_at", weekStart),

      // Scheduled visits this week
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("stage", "visit_scheduled")
        .gte("visit_scheduled_at", weekStart),

      // Total leads this month (for qualification rate)
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .gte("created_at", monthStart),

      // Qualified leads this month (for qualification rate)
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("stage", "qualified")
        .gte("qualified_at", monthStart),

      // Pipeline counts by stage
      supabase
        .from("leads")
        .select("stage")
        .eq("org_id", orgId)
        .eq("is_active", true),

      // Leads by property
      supabase
        .from("leads")
        .select("property_id, properties(name)")
        .eq("org_id", orgId)
        .eq("is_active", true),
    ])

    // Calculate qualification rate
    const totalLeadsMonth = totalLeadsMonthResult.count ?? 0
    const qualifiedLeadsMonth = qualifiedLeadsMonthResult.count ?? 0
    const qualificationRate =
      totalLeadsMonth > 0
        ? Math.round((qualifiedLeadsMonth / totalLeadsMonth) * 100)
        : 0

    // Aggregate pipeline counts by stage
    const pipelineCounts: Record<string, number> = {}
    if (pipelineCountsResult.data) {
      for (const lead of pipelineCountsResult.data) {
        pipelineCounts[lead.stage] = (pipelineCounts[lead.stage] || 0) + 1
      }
    }

    // Aggregate leads by property
    const leadsByProperty: Record<string, { name: string; count: number }> = {}
    if (leadsByPropertyResult.data) {
      for (const lead of leadsByPropertyResult.data) {
        const propertyId = lead.property_id
        if (!propertyId) continue

        if (!leadsByProperty[propertyId]) {
          const propertyData = lead.properties as unknown as { name: string } | null
          leadsByProperty[propertyId] = {
            name: propertyData?.name ?? "Unknown",
            count: 0,
          }
        }
        leadsByProperty[propertyId].count += 1
      }
    }

    const metrics = {
      leads_today: leadsTodayResult.count ?? 0,
      qualified_leads_week: qualifiedLeadsWeekResult.count ?? 0,
      scheduled_visits_week: scheduledVisitsWeekResult.count ?? 0,
      qualification_rate_month: qualificationRate,
      pipeline_counts: pipelineCounts,
      leads_by_property: Object.values(leadsByProperty),
    }

    return NextResponse.json({ data: metrics })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch metrics"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
