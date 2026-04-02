import { NextResponse } from "next/server"
import { createAdminClient } from "@web/lib/supabase/admin"

interface HealthCheck {
  status: "ok" | "fail"
  latency_ms?: number
  message?: string
}

export async function GET() {
  const checks: Record<string, HealthCheck> = {}

  // Check Supabase connectivity
  const sbStart = Date.now()
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("organizations").select("id").limit(1).single()
    checks.supabase = error
      ? { status: "fail", message: error.message, latency_ms: Date.now() - sbStart }
      : { status: "ok", latency_ms: Date.now() - sbStart }
  } catch (err) {
    checks.supabase = { status: "fail", message: String(err), latency_ms: Date.now() - sbStart }
  }

  // Check env vars presence (never expose values)
  const requiredVars = ["ANTHROPIC_API_KEY", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
  const optionalVars = ["OPENAI_API_KEY", "TELEGRAM_BOT_TOKEN", "ELEVENLABS_API_KEY"]

  const missingRequired = requiredVars.filter((v) => !process.env[v])
  const missingOptional = optionalVars.filter((v) => !process.env[v])

  checks.env_required = missingRequired.length === 0
    ? { status: "ok" }
    : { status: "fail", message: `Missing: ${missingRequired.join(", ")}` }

  checks.env_optional = missingOptional.length === 0
    ? { status: "ok" }
    : { status: "ok", message: `Not configured: ${missingOptional.join(", ")}` }

  // Determine overall status
  const hasFailure = Object.values(checks).some((c) => c.status === "fail")
  const hasMissingOptional = missingOptional.length > 0
  const overallStatus = hasFailure ? "unhealthy" : hasMissingOptional ? "degraded" : "healthy"

  return NextResponse.json(
    {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: hasFailure ? 503 : 200 }
  )
}
