import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireRole } from "@web/lib/api-auth"

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const { supabase, appUser } = auth

  const roleError = requireRole(appUser, ["admin", "supervisor"])
  if (roleError) return roleError

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

  const { data: leads, error } = await query.limit(10000)

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
