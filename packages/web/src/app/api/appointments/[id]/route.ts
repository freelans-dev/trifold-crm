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

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select(
      `
      *,
      lead:leads!lead_id(id, name, phone, email),
      broker:users!broker_id(id, name, email, avatar_url),
      property:properties!property_id(id, name)
    `
    )
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .single()

  if (error || !appointment) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({ data: appointment })
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

  const body = await request.json()

  const updateFields: Record<string, unknown> = {}
  const allowedFields = [
    "scheduled_at",
    "duration_minutes",
    "location",
    "status",
    "notes",
    "broker_id",
    "property_id",
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

  const { data: appointment, error } = await supabase
    .from("appointments")
    .update(updateFields)
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .select()
    .single()

  if (error || !appointment) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 }
    )
  }

  // Create activity log
  await supabase.from("activities").insert({
    org_id: appUser.org_id,
    lead_id: appointment.lead_id,
    user_id: appUser.id,
    type: "appointment_updated",
    description: `Agendamento atualizado`,
    metadata: {
      appointment_id: appointment.id,
      updated_fields: Object.keys(updateFields),
    },
  })

  return NextResponse.json({ data: appointment })
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
    .select("id, role, org_id")
    .eq("auth_id", user.id)
    .single()

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Soft delete: set status to cancelled
  const { data: appointment, error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .select()
    .single()

  if (error || !appointment) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 }
    )
  }

  // Create activity log
  await supabase.from("activities").insert({
    org_id: appUser.org_id,
    lead_id: appointment.lead_id,
    user_id: appUser.id,
    type: "appointment_cancelled",
    description: `Agendamento cancelado`,
    metadata: { appointment_id: appointment.id },
  })

  return NextResponse.json({ data: { message: "Appointment cancelled" } })
}
