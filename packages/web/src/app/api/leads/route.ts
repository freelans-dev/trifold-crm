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

  const url = new URL(request.url)
  const search = url.searchParams.get("search")
  const stageId = url.searchParams.get("stage_id")
  const propertyId = url.searchParams.get("property_id")

  let query = supabase
    .from("leads")
    .select(
      "id, name, phone, email, stage_id, qualification_score, interest_level, property_interest_id, assigned_broker_id, source, created_at, updated_at"
    )
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  if (stageId) {
    query = query.eq("stage_id", stageId)
  }

  if (propertyId) {
    query = query.eq("property_interest_id", propertyId)
  }

  const { data: leads, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: leads })
}

export async function POST(request: Request) {
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

  const body = await request.json()

  // Validation
  if (!body.phone?.trim()) {
    return NextResponse.json(
      { error: "phone is required" },
      { status: 400 }
    )
  }

  // Check uniqueness by phone + org_id
  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("phone", body.phone.trim())
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: "Lead with this phone already exists" },
      { status: 409 }
    )
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name: body.name?.trim() || null,
      phone: body.phone.trim(),
      email: body.email?.trim() || null,
      channel: body.channel || "whatsapp",
      stage_id: body.stage_id || null,
      property_interest_id: body.property_interest_id || null,
      has_down_payment: body.has_down_payment ?? null,
      preferred_bedrooms: body.preferred_bedrooms ?? null,
      preferred_floor: body.preferred_floor?.trim() || null,
      preferred_view: body.preferred_view?.trim() || null,
      preferred_garage_count: body.preferred_garage_count ?? null,
      interest_level: body.interest_level || null,
      source: body.source || null,
      assigned_broker_id: body.assigned_broker_id || null,
      org_id: appUser.org_id,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: lead }, { status: 201 })
}
