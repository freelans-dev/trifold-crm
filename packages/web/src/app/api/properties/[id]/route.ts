import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params

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

  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .single()

  if (error || !property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  return NextResponse.json({ data: property })
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params

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

  const body = await request.json()

  // Validate state if provided
  if (body.state !== undefined) {
    if (!body.state?.trim() || body.state.trim().length !== 2) {
      return NextResponse.json(
        { error: "state must be exactly 2 characters" },
        { status: 400 }
      )
    }
  }

  // Build update payload with only provided fields
  const updateFields: Record<string, unknown> = {}
  if (body.name !== undefined) updateFields.name = body.name.trim()
  if (body.slug !== undefined) updateFields.slug = body.slug.trim()
  if (body.city !== undefined) updateFields.city = body.city.trim()
  if (body.state !== undefined)
    updateFields.state = body.state.trim().toUpperCase()
  if (body.address !== undefined) updateFields.address = body.address?.trim() || null
  if (body.zip_code !== undefined)
    updateFields.zip_code = body.zip_code?.trim() || null

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    )
  }

  const { data: property, error } = await supabase
    .from("properties")
    .update(updateFields)
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .select()
    .single()

  if (error || !property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  return NextResponse.json({ data: property })
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params

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

  const { data: property, error } = await supabase
    .from("properties")
    .update({ is_active: false })
    .eq("id", id)
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .select()
    .single()

  if (error || !property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  return NextResponse.json({ data: { message: "Property deleted" } })
}
