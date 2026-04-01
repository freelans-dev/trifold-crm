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
    .select("id, role, org_id")
    .eq("auth_id", user.id)
    .single()

  if (!appUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { data: notes, error } = await supabase
    .from("activities")
    .select("id, type, description, metadata, created_at, user_id, users:user_id(name)")
    .eq("lead_id", id)
    .eq("org_id", appUser.org_id)
    .eq("type", "note_added")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: notes })
}

export async function POST(
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

  // Verify lead exists and belongs to org
  const { data: lead } = await supabase
    .from("leads")
    .select("id, assigned_broker_id")
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .single()

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  // Any authenticated user in the org can add notes (admin/supervisor/assigned broker)
  if (
    !["admin", "supervisor"].includes(appUser.role) &&
    lead.assigned_broker_id !== appUser.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()

  if (!body.content?.trim()) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    )
  }

  const { data: activity, error } = await supabase
    .from("activities")
    .insert({
      org_id: appUser.org_id,
      lead_id: id,
      user_id: appUser.id,
      type: "note_added",
      description: body.content.trim(),
      metadata: null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: activity }, { status: 201 })
}
