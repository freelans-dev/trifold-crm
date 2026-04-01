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

  const { data: rule, error } = await supabase
    .from("follow_up_rules")
    .select("*")
    .eq("stage_id", id)
    .eq("org_id", appUser.org_id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: rule })
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

  // Validate alert_days < nicole_takeover_days
  const alertDays = body.alert_days
  const nicoleDays = body.nicole_takeover_days

  if (
    alertDays !== undefined &&
    nicoleDays !== undefined &&
    alertDays >= nicoleDays
  ) {
    return NextResponse.json(
      { error: "alert_days must be less than nicole_takeover_days" },
      { status: 400 }
    )
  }

  // Build update fields
  const updateFields: Record<string, unknown> = {}
  const allowedFields = [
    "alert_days",
    "nicole_takeover_days",
    "message_template",
    "is_active",
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

  // If only one of alert/nicole is being updated, validate against existing value
  const { data: existing } = await supabase
    .from("follow_up_rules")
    .select("alert_days, nicole_takeover_days")
    .eq("stage_id", id)
    .eq("org_id", appUser.org_id)
    .maybeSingle()

  if (existing) {
    const finalAlert =
      updateFields.alert_days !== undefined
        ? (updateFields.alert_days as number)
        : existing.alert_days
    const finalNicole =
      updateFields.nicole_takeover_days !== undefined
        ? (updateFields.nicole_takeover_days as number)
        : existing.nicole_takeover_days

    if (finalAlert >= finalNicole) {
      return NextResponse.json(
        { error: "alert_days must be less than nicole_takeover_days" },
        { status: 400 }
      )
    }
  }

  // Upsert: create if not exists, update if exists
  const { data: rule, error } = await supabase
    .from("follow_up_rules")
    .upsert(
      {
        org_id: appUser.org_id,
        stage_id: id,
        ...updateFields,
      },
      { onConflict: "org_id,stage_id" }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: rule })
}
