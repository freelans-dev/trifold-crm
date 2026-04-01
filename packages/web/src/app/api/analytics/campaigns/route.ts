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

  // Build query for leads with utm_campaign
  let query = supabase
    .from("leads")
    .select("id, utm_campaign, stage:kanban_stages(slug)")
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .not("utm_campaign", "is", null)

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

  // Group by utm_campaign
  const campaignMap: Record<
    string,
    { total: number; qualified: number; converted: number }
  > = {}

  for (const lead of leads ?? []) {
    const campaign = lead.utm_campaign as string
    if (!campaignMap[campaign]) {
      campaignMap[campaign] = { total: 0, qualified: 0, converted: 0 }
    }
    campaignMap[campaign].total += 1

    // Extract stage slug from relation
    const stageArr = lead.stage as unknown as Array<{ slug: string }> | null
    const stageSlug = stageArr?.[0]?.slug ?? null

    // Count qualified (any stage beyond initial)
    if (
      stageSlug &&
      !["novo", "new", "nao_qualificado"].includes(stageSlug)
    ) {
      campaignMap[campaign].qualified += 1
    }

    // Count converted (stage = fechou)
    if (stageSlug === "fechou") {
      campaignMap[campaign].converted += 1
    }
  }

  const campaigns = Object.entries(campaignMap)
    .map(([name, data]) => ({
      campaign: name,
      total: data.total,
      qualified: data.qualified,
      converted: data.converted,
    }))
    .sort((a, b) => b.total - a.total)

  return NextResponse.json({ data: campaigns })
}
