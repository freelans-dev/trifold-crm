import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: appUser } = await supabase
    .from("users")
    .select("role, org_id")
    .eq("auth_id", user.id)
    .single()

  if (!appUser || appUser.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem criar usuarios" }, { status: 403 })
  }

  const body = await request.json()
  const { name, email, password, role } = body

  if (!name?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json({ error: "Nome, email, senha e perfil sao obrigatorios" }, { status: 400 })
  }

  if (!["admin", "supervisor", "broker"].includes(role)) {
    return NextResponse.json({ error: "Perfil invalido" }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Senha deve ter no minimo 6 caracteres" }, { status: 400 })
  }

  // Create auth user with admin client
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  })

  if (authError) {
    if (authError.message.includes("already been registered")) {
      return NextResponse.json({ error: "Este email ja esta cadastrado" }, { status: 409 })
    }
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // Create user in users table
  const { error: userError } = await adminSupabase.from("users").insert({
    org_id: appUser.org_id,
    auth_id: authData.user.id,
    name: name.trim(),
    email: email.trim(),
    role,
  })

  if (userError) {
    // Rollback auth user
    await adminSupabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  // If role is broker, also create broker record
  if (role === "broker") {
    await adminSupabase.from("brokers").insert({
      org_id: appUser.org_id,
      user_id: authData.user.id,
      type: "internal",
    }).then(() => {}) // non-blocking, broker record is optional
  }

  return NextResponse.json({ data: { id: authData.user.id, email, role } })
}
