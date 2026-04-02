import { createAdminClient } from "@web/lib/supabase/admin"

type EventLevel = "error" | "warn" | "info"
type EventCategory = "bot" | "ai" | "webhook" | "auth" | "cron" | "system"

interface LogEventParams {
  level: EventLevel
  category: EventCategory
  event_type: string
  message: string
  metadata?: Record<string, unknown>
  source?: string
  request_id?: string
  org_id?: string
}

/**
 * Log a system event to the system_events table.
 * Fire-and-forget — never blocks the request, never crashes the system.
 */
export function logEvent(params: LogEventParams): void {
  // Always log to console for Vercel logs
  const prefix = `[${params.level.toUpperCase()}] [${params.category}] [${params.event_type}]`
  if (params.level === "error") {
    console.error(prefix, params.message, params.metadata ?? "")
  } else if (params.level === "warn") {
    console.warn(prefix, params.message, params.metadata ?? "")
  } else {
    console.log(prefix, params.message, params.metadata ?? "")
  }

  // Fire-and-forget: write to Supabase without blocking
  try {
    const supabase = createAdminClient()
    Promise.resolve(
      supabase
        .from("system_events")
        .insert({
          org_id: params.org_id ?? null,
          level: params.level,
          category: params.category,
          event_type: params.event_type,
          message: params.message,
          metadata: params.metadata ?? {},
          source: params.source ?? null,
          request_id: params.request_id ?? null,
        })
    )
      .then((result) => {
        if (result.error) {
          console.error("[LOGGER_FALLBACK] Failed to write system_event:", result.error.message)
        }
      })
      .catch((err) => {
        console.error("[LOGGER_FALLBACK] Supabase insert crashed:", err)
      })
  } catch (err) {
    console.error("[LOGGER_FALLBACK] Logger initialization failed:", err)
  }
}
