import { NextRequest, NextResponse } from "next/server"
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

  const { data: stages, error } = await supabase
    .from("kanban_stages")
    .select("id, name, slug, type, position, color, is_default, is_active, created_at")
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .order("position")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: stages })
}

export async function POST(request: NextRequest) {
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

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    )
  }

  if (!body.type) {
    return NextResponse.json(
      { error: "type is required" },
      { status: 400 }
    )
  }

  const slug =
    body.slug?.trim() ||
    body.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

  // Get next position
  const { data: lastStage } = await supabase
    .from("kanban_stages")
    .select("position")
    .eq("org_id", appUser.org_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextPosition = (lastStage?.position ?? -1) + 1

  const { data: stage, error } = await supabase
    .from("kanban_stages")
    .insert({
      org_id: appUser.org_id,
      name: body.name.trim(),
      slug,
      type: body.type,
      position: body.position ?? nextPosition,
      color: body.color?.trim() || null,
      is_default: body.is_default ?? false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: stage }, { status: 201 })
}
