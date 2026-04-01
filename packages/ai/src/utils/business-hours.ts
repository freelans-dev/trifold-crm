/**
 * Business hours utility.
 * Checks whether the current time falls within configured business hours
 * using the America/Sao_Paulo timezone.
 */

interface BusinessHoursConfig {
  business_hours: Record<string, unknown>
}

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const

/**
 * Checks if the current time is within business hours.
 *
 * @param config - Configuration object containing business hours per day of week
 * @returns true if currently within business hours, false otherwise
 *
 * @example
 * ```ts
 * isBusinessHours({
 *   business_hours: {
 *     monday: { start: "09:00", end: "18:00" },
 *     tuesday: { start: "09:00", end: "18:00" },
 *     // ...
 *   }
 * })
 * ```
 */
export function isBusinessHours(config: BusinessHoursConfig): boolean {
  // If always_on is true (or config is just { always_on: true }), always return true
  const bh = config.business_hours as Record<string, unknown>
  if (bh?.always_on === true) return true

  // Support both { hours: { monday: ... } } and flat { monday: ... } formats
  const hoursConfig = (bh?.hours ?? bh ?? {}) as Record<string, { start: string; end: string }>

  const now = new Date()

  // Get current time in Sao Paulo timezone
  const spFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const parts = spFormatter.formatToParts(now)
  const weekday = parts.find((p) => p.type === "weekday")?.value?.toLowerCase()
  const hour = parts.find((p) => p.type === "hour")?.value
  const minute = parts.find((p) => p.type === "minute")?.value

  if (!weekday || !hour || !minute) {
    return false
  }

  // Map formatted weekday to our key format
  const dayKey = DAY_NAMES.find((d) => weekday.startsWith(d))
  if (!dayKey) {
    return false
  }

  const dayConfig = hoursConfig[dayKey]
  if (!dayConfig) {
    // No config for this day means not a business day
    return false
  }

  const currentMinutes = parseInt(hour, 10) * 60 + parseInt(minute, 10)
  const startMinutes = parseTime(dayConfig.start)
  const endMinutes = parseTime(dayConfig.end)

  return currentMinutes >= startMinutes && currentMinutes < endMinutes
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}
