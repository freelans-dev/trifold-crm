import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brokerId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: appUser } = await supabase
    .from("users")
    .select("role, org_id")
    .eq("auth_id", user.id)
    .single()

  if (!appUser || appUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { property_id } = body

  if (!property_id) {
    return NextResponse.json({ error: "property_id obrigatório" }, { status: 400 })
  }

  const { error } = await supabase.from("broker_assignments").upsert(
    { broker_id: brokerId, property_id, is_primary: true },
    { onConflict: "broker_id,property_id" }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: { ok: true } })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brokerId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: appUser } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single()

  if (!appUser || appUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { property_id } = body

  await supabase
    .from("broker_assignments")
    .delete()
    .eq("broker_id", brokerId)
    .eq("property_id", property_id)

  return NextResponse.json({ data: { ok: true } })
}
