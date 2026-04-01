import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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

  const { data: lead, error } = await supabase
    .from("leads")
    .select(
      `
      *,
      stage:kanban_stages(id, name, slug, type, color),
      property_interest:properties!property_interest_id(id, name, slug),
      broker:users!assigned_broker_id(id, name, email, avatar_url)
    `
    )
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .single()

  if (error || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  return NextResponse.json({ data: lead })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("id, role, org_id")
    .eq("auth_id", user.id)
    .single()

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Check permission: admin/supervisor or assigned broker
  if (!["admin", "supervisor"].includes(appUser.role)) {
    const { data: lead } = await supabase
      .from("leads")
      .select("assigned_broker_id")
      .eq("id", id)
      .eq("org_id", appUser.org_id)
      .eq("is_active", true)
      .single()

    if (!lead || lead.assigned_broker_id !== appUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const body = await request.json()

  // Build update payload with only provided fields
  const updateFields: Record<string, unknown> = {}
  const allowedFields = [
    "name",
    "phone",
    "email",
    "channel",
    "stage_id",
    "property_interest_id",
    "has_down_payment",
    "preferred_bedrooms",
    "preferred_floor",
    "preferred_view",
    "preferred_garage_count",
    "qualification_status",
    "qualification_score",
    "interest_level",
    "source",
    "assigned_broker_id",
    "ai_summary",
    "visit_scheduled_at",
    "lost_reason",
  ]

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateFields[field] =
        typeof body[field] === "string"
          ? body[field].trim() || null
          : body[field]
    }
  }

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    )
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .update(updateFields)
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .select()
    .single()

  if (error || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  return NextResponse.json({ data: lead })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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

  if (appUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .update({ is_active: false })
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .select()
    .single()

  if (error || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  return NextResponse.json({ data: { message: "Lead deleted" } })
}
