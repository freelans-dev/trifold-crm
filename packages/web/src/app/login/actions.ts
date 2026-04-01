"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@web/lib/supabase/server"

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email e senha sao obrigatorios" }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Email ou senha incorretos" }
  }

  // Get user role to redirect correctly
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Erro ao autenticar" }
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single()

  revalidatePath("/", "layout")

  const destination =
    appUser?.role === "broker" ? "/broker" : "/dashboard"
  redirect(destination)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
