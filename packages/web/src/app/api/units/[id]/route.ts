import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"

const VALID_TRANSITIONS: Record<string, string[]> = {
  available: ["reserved", "sold"],
  reserved: ["available", "sold"],
  sold: [],
}

function isValidTransition(
  from: string,
  to: string,
  role: string
): { valid: boolean; reason?: string } {
  // Admin can reset any status to available
  if (role === "admin" && to === "available") {
    return { valid: true }
  }

  const allowed = VALID_TRANSITIONS[from]
  if (!allowed) {
    return { valid: false, reason: `Unknown current status: ${from}` }
  }

  if (!allowed.includes(to)) {
    return {
      valid: false,
      reason: `Cannot transition from '${from}' to '${to}'`,
    }
  }

  return { valid: true }
}

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

  const { data: unit, error } = await supabase
    .from("units")
    .select("*, typologies(*), properties!inner(id, name, org_id)")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (error || !unit) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 })
  }

  // Verify org ownership via property
  if (unit.properties.org_id !== appUser.org_id) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 })
  }

  // Clean up response: remove org_id from nested property
  const { properties, typologies, ...unitData } = unit
  const { org_id: _, ...propertyData } = properties

  return NextResponse.json({
    data: {
      ...unitData,
      property: propertyData,
      typology: typologies ?? null,
    },
  })
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

  // Verify unit exists and belongs to user's org
  const { data: existing } = await supabase
    .from("units")
    .select("*, properties!inner(org_id)")
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!existing || existing.properties.org_id !== appUser.org_id) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 })
  }

  const body = await request.json()

  // Validate status transition if status is being changed
  if (body.status !== undefined) {
    if (!["available", "reserved", "sold"].includes(body.status)) {
      return NextResponse.json(
        { error: "status must be one of: available, reserved, sold" },
        { status: 400 }
      )
    }

    if (body.status !== existing.status) {
      const transition = isValidTransition(
        existing.status,
        body.status,
        appUser.role
      )
      if (!transition.valid) {
        return NextResponse.json(
          { error: transition.reason },
          { status: 400 }
        )
      }
    }
  }

  // Build update payload with only provided fields
  const updateFields: Record<string, unknown> = {}
  if (body.identifier !== undefined)
    updateFields.identifier = body.identifier.trim()
  if (body.floor !== undefined) updateFields.floor = body.floor
  if (body.status !== undefined) updateFields.status = body.status
  if (body.area !== undefined) updateFields.area = body.area
  if (body.price !== undefined) updateFields.price = body.price
  if (body.typology_id !== undefined)
    updateFields.typology_id = body.typology_id

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    )
  }

  const { data: unit, error } = await supabase
    .from("units")
    .update(updateFields)
    .eq("id", id)
    .eq("is_active", true)
    .select()
    .single()

  if (error || !unit) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 })
  }

  return NextResponse.json({ data: unit })
}
