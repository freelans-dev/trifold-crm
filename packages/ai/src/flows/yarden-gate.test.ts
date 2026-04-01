import { describe, it, expect } from "vitest"
import { checkYardenGate } from "./yarden-gate"

describe("checkYardenGate", () => {
  it("blocks Yarden when has_down_payment is false", () => {
    const result = checkYardenGate("yarden", { has_down_payment: false })
    expect(result.blocked).toBe(true)
    expect(result.reason).toBeDefined()
    expect(result.suggestion).toBeDefined()
    expect(result.suggestion).toContain("Vind")
  })

  it("does NOT block when has_down_payment is true", () => {
    const result = checkYardenGate("yarden", { has_down_payment: true })
    expect(result.blocked).toBe(false)
    expect(result.reason).toBeUndefined()
    expect(result.suggestion).toBeUndefined()
  })

  it("does NOT block for Vind regardless of down payment", () => {
    const noPayment = checkYardenGate("vind", { has_down_payment: false })
    expect(noPayment.blocked).toBe(false)

    const withPayment = checkYardenGate("vind", { has_down_payment: true })
    expect(withPayment.blocked).toBe(false)
  })

  it("does NOT block when has_down_payment is undefined", () => {
    const result = checkYardenGate("yarden", {})
    expect(result.blocked).toBe(false)
  })

  it("does NOT block when has_down_payment is null", () => {
    const result = checkYardenGate("yarden", { has_down_payment: null })
    expect(result.blocked).toBe(false)
  })

  it("is case-insensitive for property slug", () => {
    const result = checkYardenGate("YARDEN", { has_down_payment: false })
    expect(result.blocked).toBe(true)
  })

  it("returns suggestion mentioning flexible conditions", () => {
    const result = checkYardenGate("yarden", { has_down_payment: false })
    expect(result.suggestion).toContain("flexibilidade")
  })

  it("does NOT block for other properties", () => {
    const result = checkYardenGate("other-property", { has_down_payment: false })
    expect(result.blocked).toBe(false)
  })
})
