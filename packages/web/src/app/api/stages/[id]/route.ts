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
  const allowedFields = ["name", "slug", "type", "position", "color", "is_default"]

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

  const { data: stage, error } = await supabase
    .from("kanban_stages")
    .update(updateFields)
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .select()
    .single()

  if (error || !stage) {
    return NextResponse.json({ error: "Stage not found" }, { status: 404 })
  }

  return NextResponse.json({ data: stage })
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

  // Soft delete
  const { data: stage, error } = await supabase
    .from("kanban_stages")
    .update({ is_active: false })
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .select()
    .single()

  if (error || !stage) {
    return NextResponse.json({ error: "Stage not found" }, { status: 404 })
  }

  return NextResponse.json({ data: { message: "Stage deleted" } })
}
