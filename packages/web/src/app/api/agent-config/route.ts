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

  const { data: config, error } = await supabase
    .from("agent_config")
    .select("*")
    .eq("org_id", appUser.org_id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: config })
}

export async function PATCH(request: NextRequest) {
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
  const allowedFields = [
    "personality_prompt",
    "greeting_message",
    "out_of_hours_message",
    "model_primary",
    "temperature",
    "max_tokens",
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

  const { data: config, error } = await supabase
    .from("agent_config")
    .update(updateFields)
    .eq("org_id", appUser.org_id)
    .select()
    .single()

  if (error || !config) {
    return NextResponse.json(
      { error: "Config not found or update failed" },
      { status: 404 }
    )
  }

  return NextResponse.json({ data: config })
}
