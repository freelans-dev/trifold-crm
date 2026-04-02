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
    .select("id, role, org_id")
    .eq("auth_id", user.id)
    .single()

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const url = new URL(request.url)
  const brokerId = url.searchParams.get("broker_id")
  const dateFrom = url.searchParams.get("date_from")
  const dateTo = url.searchParams.get("date_to")
  const status = url.searchParams.get("status")
  const propertyId = url.searchParams.get("property_id")
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"))
  const limit = Math.min(Math.max(1, parseInt(url.searchParams.get("limit") || "50")), 100)
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from("appointments")
    .select(
      `
      id, scheduled_at, duration_minutes, location, status, notes, created_by, created_at, updated_at,
      lead:leads!lead_id(id, name, phone),
      broker:users!broker_id(id, name, email),
      property:properties!property_id(id, name)
    `,
      { count: "exact" }
    )
    .eq("org_id", appUser.org_id)
    .order("scheduled_at", { ascending: true })
    .range(from, to)

  if (brokerId) {
    query = query.eq("broker_id", brokerId)
  }

  if (dateFrom) {
    query = query.gte("scheduled_at", dateFrom)
  }

  if (dateTo) {
    query = query.lte("scheduled_at", dateTo)
  }

  if (status) {
    query = query.eq("status", status)
  }

  if (propertyId) {
    query = query.eq("property_id", propertyId)
  }

  const { data: appointments, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: appointments, count, page, limit })
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
    .select("id, role, org_id")
    .eq("auth_id", user.id)
    .single()

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const body = await request.json()

  // Validation
  if (!body.lead_id) {
    return NextResponse.json(
      { error: "lead_id is required" },
      { status: 400 }
    )
  }

  if (!body.scheduled_at) {
    return NextResponse.json(
      { error: "scheduled_at is required" },
      { status: 400 }
    )
  }

  const scheduledAt = new Date(body.scheduled_at)
  if (scheduledAt <= new Date()) {
    return NextResponse.json(
      { error: "scheduled_at must be in the future" },
      { status: 400 }
    )
  }

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      org_id: appUser.org_id,
      lead_id: body.lead_id,
      broker_id: body.broker_id || null,
      property_id: body.property_id || null,
      scheduled_at: body.scheduled_at,
      duration_minutes: body.duration_minutes || 30,
      location: body.location?.trim() || "Stand Trifold",
      status: body.status || "scheduled",
      notes: body.notes?.trim() || null,
      created_by: body.created_by || "admin",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create activity log
  await supabase.from("activities").insert({
    org_id: appUser.org_id,
    lead_id: body.lead_id,
    user_id: appUser.id,
    type: "appointment_created",
    description: `Agendamento criado para ${scheduledAt.toLocaleString("pt-BR")}`,
    metadata: { appointment_id: appointment.id },
  })

  return NextResponse.json({ data: appointment }, { status: 201 })
}
