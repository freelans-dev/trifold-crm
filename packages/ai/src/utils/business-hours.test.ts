import { describe, it, expect, vi, afterEach } from "vitest"
import { isBusinessHours } from "./business-hours"

const WEEKDAY_CONFIG = {
  business_hours: {
    monday: { start: "08:00", end: "18:00" },
    tuesday: { start: "08:00", end: "18:00" },
    wednesday: { start: "08:00", end: "18:00" },
    thursday: { start: "08:00", end: "18:00" },
    friday: { start: "08:00", end: "18:00" },
  },
}

/**
 * Helper to mock Date to a specific UTC time.
 * Sao Paulo is UTC-3, so we adjust accordingly.
 * For SP 10:00 (within hours), we set UTC 13:00.
 * For SP 00:00 (midnight), we set UTC 03:00.
 */
function mockDate(isoString: string) {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(isoString))
}

afterEach(() => {
  vi.useRealTimers()
})

describe("isBusinessHours", () => {
  it("returns true during business hours (Mon 10:00 SP)", () => {
    // Monday 2026-04-06 at 10:00 SP = 13:00 UTC
    mockDate("2026-04-06T13:00:00Z")
    expect(isBusinessHours(WEEKDAY_CONFIG)).toBe(true)
  })

  it("returns true at exactly start time (Mon 08:00 SP)", () => {
    // Monday 2026-04-06 at 08:00 SP = 11:00 UTC
    mockDate("2026-04-06T11:00:00Z")
    expect(isBusinessHours(WEEKDAY_CONFIG)).toBe(true)
  })

  it("returns false at exactly end time (Mon 18:00 SP)", () => {
    // Monday 2026-04-06 at 18:00 SP = 21:00 UTC
    mockDate("2026-04-06T21:00:00Z")
    expect(isBusinessHours(WEEKDAY_CONFIG)).toBe(false)
  })

  it("returns false on Sunday", () => {
    // Sunday 2026-04-05 at 10:00 SP = 13:00 UTC
    mockDate("2026-04-05T13:00:00Z")
    expect(isBusinessHours(WEEKDAY_CONFIG)).toBe(false)
  })

  it("returns false on Saturday", () => {
    // Saturday 2026-04-04 at 10:00 SP = 13:00 UTC
    mockDate("2026-04-04T13:00:00Z")
    expect(isBusinessHours(WEEKDAY_CONFIG)).toBe(false)
  })

  it("returns false at midnight (Mon 00:00 SP)", () => {
    // Monday 2026-04-06 at 00:00 SP = 03:00 UTC
    mockDate("2026-04-06T03:00:00Z")
    expect(isBusinessHours(WEEKDAY_CONFIG)).toBe(false)
  })

  it("returns false early morning before opening (Mon 07:00 SP)", () => {
    // Monday 2026-04-06 at 07:00 SP = 10:00 UTC
    mockDate("2026-04-06T10:00:00Z")
    expect(isBusinessHours(WEEKDAY_CONFIG)).toBe(false)
  })

  it("returns false late evening (Mon 20:00 SP)", () => {
    // Monday 2026-04-06 at 20:00 SP = 23:00 UTC
    mockDate("2026-04-06T23:00:00Z")
    expect(isBusinessHours(WEEKDAY_CONFIG)).toBe(false)
  })

  it("handles empty config (no business hours defined)", () => {
    mockDate("2026-04-06T13:00:00Z") // Monday 10:00 SP
    expect(isBusinessHours({ business_hours: {} })).toBe(false)
  })

  it("returns true on Friday within hours", () => {
    // Friday 2026-04-10 at 12:00 SP = 15:00 UTC
    mockDate("2026-04-10T15:00:00Z")
    expect(isBusinessHours(WEEKDAY_CONFIG)).toBe(true)
  })
})
