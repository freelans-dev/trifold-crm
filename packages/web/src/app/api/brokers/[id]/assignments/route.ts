import { NextRequest, NextResponse } from "next/server"
import { requireAuth, requireRole } from "@web/lib/api-auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brokerId } = await params

  const auth = await requireAuth()
  if (auth.error) return auth.error
  const { supabase } = auth

  const { data } = await supabase
    .from("broker_assignments")
    .select("broker_id, property_id, is_primary")
    .eq("broker_id", brokerId)

  return NextResponse.json({ data: data ?? [] })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brokerId } = await params

  const auth = await requireAuth()
  if (auth.error) return auth.error
  const { supabase, appUser } = auth

  const forbidden = requireRole(appUser, ["admin"])
  if (forbidden) return forbidden

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

  const auth = await requireAuth()
  if (auth.error) return auth.error
  const { supabase, appUser } = auth

  const forbidden = requireRole(appUser, ["admin"])
  if (forbidden) return forbidden

  const body = await request.json()
  const { property_id } = body

  await supabase
    .from("broker_assignments")
    .delete()
    .eq("broker_id", brokerId)
    .eq("property_id", property_id)

  return NextResponse.json({ data: { ok: true } })
}
