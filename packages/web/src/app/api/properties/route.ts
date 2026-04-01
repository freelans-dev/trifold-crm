import { NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

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

  const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .eq("org_id", appUser.org_id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: properties })
}

export async function POST(request: Request) {
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

  // Validation
  const errors: string[] = []
  if (!body.name?.trim()) errors.push("name is required")
  if (!body.city?.trim()) errors.push("city is required")
  if (!body.state?.trim()) errors.push("state is required")
  else if (body.state.trim().length !== 2)
    errors.push("state must be exactly 2 characters")

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 })
  }

  const slug = body.slug?.trim() || slugify(body.name.trim())

  const { data: property, error } = await supabase
    .from("properties")
    .insert({
      name: body.name.trim(),
      slug,
      city: body.city.trim(),
      state: body.state.trim().toUpperCase(),
      address: body.address?.trim() || null,
      zip_code: body.zip_code?.trim() || null,
      org_id: appUser.org_id,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: property }, { status: 201 })
}
