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

  if (!["admin", "supervisor"].includes(appUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: logs, error } = await supabase
    .from("follow_up_log")
    .select(
      `
      id, type, status, scheduled_at, sent_at, message, created_at,
      lead:leads!lead_id(id, name, phone, stage_id),
      rule:follow_up_rules!rule_id(
        id, alert_days, nicole_takeover_days,
        stage:kanban_stages!stage_id(id, name, color)
      )
    `
    )
    .eq("org_id", appUser.org_id)
    .in("status", ["pending", "sent"])
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: logs })
}
