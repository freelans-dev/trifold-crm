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

  const { data: typology, error } = await supabase
    .from("typologies")
    .select("*, properties!inner(org_id)")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error || !typology) {
    return NextResponse.json({ error: "Typology not found" }, { status: 404 })
  }

  // Verify org ownership via property
  if (typology.properties.org_id !== appUser.org_id) {
    return NextResponse.json({ error: "Typology not found" }, { status: 404 })
  }

  // Remove nested properties from response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { properties: _props, ...typologyData } = typology
  return NextResponse.json({ data: typologyData })
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

  // Verify typology exists and belongs to user's org
  const { data: existing } = await supabase
    .from("typologies")
    .select("*, properties!inner(org_id)")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!existing || existing.properties.org_id !== appUser.org_id) {
    return NextResponse.json({ error: "Typology not found" }, { status: 404 })
  }

  const body = await request.json()

  // Build update payload with only provided fields
  const updateFields: Record<string, unknown> = {}
  if (body.name !== undefined) updateFields.name = body.name.trim()
  if (body.description !== undefined)
    updateFields.description = body.description?.trim() || null
  if (body.bedrooms !== undefined) updateFields.bedrooms = body.bedrooms
  if (body.bathrooms !== undefined) updateFields.bathrooms = body.bathrooms
  if (body.area !== undefined) updateFields.area = body.area
  if (body.base_price !== undefined) updateFields.base_price = body.base_price

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    )
  }

  const { data: typology, error } = await supabase
    .from("typologies")
    .update(updateFields)
    .eq("id", id)
    .eq("is_active", true)
    .select()
    .single()

  if (error || !typology) {
    return NextResponse.json({ error: "Typology not found" }, { status: 404 })
  }

  return NextResponse.json({ data: typology })
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

  if (!["admin", "supervisor"].includes(appUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Verify typology exists and belongs to user's org
  const { data: existing } = await supabase
    .from("typologies")
    .select("*, properties!inner(org_id)")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!existing || existing.properties.org_id !== appUser.org_id) {
    return NextResponse.json({ error: "Typology not found" }, { status: 404 })
  }

  // Soft delete: set is_active=false
  const { error: deleteError } = await supabase
    .from("typologies")
    .update({ is_active: false })
    .eq("id", id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Unlink units from this typology
  const { error: unlinkError } = await supabase
    .from("units")
    .update({ typology_id: null })
    .eq("typology_id", id)

  if (unlinkError) {
    return NextResponse.json({ error: unlinkError.message }, { status: 500 })
  }

  return NextResponse.json({ data: { message: "Typology deleted" } })
}
