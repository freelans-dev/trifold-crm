import { redirect } from "next/navigation"
import { createClient } from "@web/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single()

  redirect(appUser?.role === "broker" ? "/broker" : "/dashboard")
}
