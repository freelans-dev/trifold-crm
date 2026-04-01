import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"

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

  if (appUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()

  const updateFields: Record<string, unknown> = {}
  const allowedFields = ["creci", "type", "is_available", "max_leads"]

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

  const { data: broker, error } = await supabase
    .from("brokers")
    .update(updateFields)
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .select(
      `
      id, creci, type, is_available, max_leads, created_at,
      user:users!user_id(id, name, email, avatar_url)
    `
    )
    .single()

  if (error || !broker) {
    return NextResponse.json({ error: "Broker not found" }, { status: 404 })
  }

  return NextResponse.json({ data: broker })
}
