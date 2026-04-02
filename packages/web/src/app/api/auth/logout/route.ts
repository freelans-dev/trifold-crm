import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@web/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const origin = request.headers.get("origin") || request.nextUrl.origin
  return NextResponse.redirect(new URL("/login", origin))
}
