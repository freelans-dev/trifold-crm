import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getServerUser()

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const supabase = await createClient()
  const { searchParams } = request.nextUrl

  const level = searchParams.get("level")
  const category = searchParams.get("category")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200)

  let query = supabase
    .from("system_events")
    .select("*")
    .eq("org_id", user.orgId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (level) query = query.eq("level", level)
  if (category) query = query.eq("category", category)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Metrics: counts for last 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const { count: errorsLast24h } = await supabase
    .from("system_events")
    .select("id", { count: "exact", head: true })
    .eq("org_id", user.orgId)
    .eq("level", "error")
    .gte("created_at", oneDayAgo)

  const { count: messagesLast24h } = await supabase
    .from("system_events")
    .select("id", { count: "exact", head: true })
    .eq("org_id", user.orgId)
    .eq("category", "bot")
    .eq("level", "info")
    .gte("created_at", oneDayAgo)

  // Health status per category (last 30 min)
  const categories = ["bot", "ai", "webhook", "cron"] as const
  const health: Record<string, "green" | "yellow" | "red"> = {}

  for (const cat of categories) {
    const { count: errors30m } = await supabase
      .from("system_events")
      .select("id", { count: "exact", head: true })
      .eq("org_id", user.orgId)
      .eq("category", cat)
      .eq("level", "error")
      .gte("created_at", thirtyMinAgo)

    const { count: warns30m } = await supabase
      .from("system_events")
      .select("id", { count: "exact", head: true })
      .eq("org_id", user.orgId)
      .eq("category", cat)
      .eq("level", "warn")
      .gte("created_at", thirtyMinAgo)

    health[cat] = (errors30m ?? 0) > 3 ? "red" : (warns30m ?? 0) > 0 ? "yellow" : "green"
  }

  // Average Claude response time (from metadata.response_time_ms)
  const { data: claudeEvents } = await supabase
    .from("system_events")
    .select("metadata")
    .eq("org_id", user.orgId)
    .eq("event_type", "CLAUDE_RESPONSE")
    .gte("created_at", oneDayAgo)
    .limit(100)

  const responseTimes = (claudeEvents ?? [])
    .map((e) => (e.metadata as Record<string, unknown>)?.response_time_ms as number)
    .filter((t): t is number => typeof t === "number")

  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : null

  // RAG fallback rate
  const { count: ragTotal } = await supabase
    .from("system_events")
    .select("id", { count: "exact", head: true })
    .eq("org_id", user.orgId)
    .in("event_type", ["RAG_FALLBACK", "RAG_SUCCESS"])
    .gte("created_at", oneDayAgo)

  const { count: ragFallbacks } = await supabase
    .from("system_events")
    .select("id", { count: "exact", head: true })
    .eq("org_id", user.orgId)
    .eq("event_type", "RAG_FALLBACK")
    .gte("created_at", oneDayAgo)

  const ragFallbackRate = (ragTotal ?? 0) > 0
    ? Math.round(((ragFallbacks ?? 0) / (ragTotal ?? 1)) * 100)
    : 0

  return NextResponse.json({
    data,
    metrics: {
      errors_24h: errorsLast24h ?? 0,
      messages_24h: messagesLast24h ?? 0,
      avg_claude_response_ms: avgResponseTime,
      rag_fallback_rate: ragFallbackRate,
    },
    health,
  })
}
