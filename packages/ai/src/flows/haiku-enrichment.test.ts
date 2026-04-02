import { describe, it, expect } from "vitest"
import { parseEnrichmentResponse, mapExtractedDataToLeadFields } from "./haiku-enrichment"

describe("parseEnrichmentResponse", () => {
  it("parses valid JSON response", () => {
    const input = JSON.stringify({
      summary: "Lead interessado no Yarden, 3 quartos, andar alto.",
      extracted_data: { property_interest: "yarden", bedrooms: 3, floor: "alto" },
    })
    const result = parseEnrichmentResponse(input)
    expect(result).not.toBeNull()
    expect(result!.summary).toBe("Lead interessado no Yarden, 3 quartos, andar alto.")
    expect(result!.extracted_data.property_interest).toBe("yarden")
    expect(result!.extracted_data.bedrooms).toBe(3)
  })

  it("strips markdown code blocks", () => {
    const input = "```json\n" + JSON.stringify({
      summary: "Resumo",
      extracted_data: { name: "João" },
    }) + "\n```"
    const result = parseEnrichmentResponse(input)
    expect(result).not.toBeNull()
    expect(result!.extracted_data.name).toBe("João")
  })

  it("returns null for invalid JSON", () => {
    expect(parseEnrichmentResponse("not json")).toBeNull()
  })

  it("returns null when summary is missing", () => {
    expect(parseEnrichmentResponse(JSON.stringify({ extracted_data: {} }))).toBeNull()
  })

  it("returns null when extracted_data is missing", () => {
    expect(parseEnrichmentResponse(JSON.stringify({ summary: "test" }))).toBeNull()
  })

  it("handles empty extracted_data", () => {
    const input = JSON.stringify({ summary: "Resumo basico", extracted_data: {} })
    const result = parseEnrichmentResponse(input)
    expect(result).not.toBeNull()
    expect(Object.keys(result!.extracted_data)).toHaveLength(0)
  })
})

describe("mapExtractedDataToLeadFields", () => {
  it("maps basic fields correctly", () => {
    const extracted = { name: "Maria", bedrooms: 2, floor: "alto" }
    const result = mapExtractedDataToLeadFields(extracted, {})
    expect(result.name).toBe("Maria")
    expect(result.preferred_bedrooms).toBe(2)
    expect(result.preferred_floor).toBe("alto")
  })

  it("maps has_down_payment boolean", () => {
    const result = mapExtractedDataToLeadFields({ has_down_payment: false }, {})
    expect(result.has_down_payment).toBe(false)
  })

  it("validates source against enum", () => {
    const result = mapExtractedDataToLeadFields({ source: "meta_ads" }, {})
    expect(result.source).toBe("meta_ads")
  })

  it("rejects invalid source values", () => {
    const result = mapExtractedDataToLeadFields({ source: "instagram" }, {})
    expect(result.source).toBeUndefined()
  })

  it("calculates qualification score from merged data", () => {
    const existing = { name: "João", property_interest: "vind" }
    const extracted = { bedrooms: 3, floor: "alto" }
    const result = mapExtractedDataToLeadFields(extracted, existing)
    // name(10) + property_interest(15) + bedrooms(10) + floor(10) = 45
    expect(result.qualification_score).toBe(45)
    expect(result.interest_level).toBe("warm")
    expect(result.qualification_status).toBe("in_progress")
  })

  it("sets hot interest_level for score >= 70", () => {
    const existing = {
      name: "Ana", property_interest: "yarden", bedrooms: 2,
      floor: "alto", view: "frente", has_down_payment: true, visit_availability: "sabado",
    }
    const result = mapExtractedDataToLeadFields({}, existing)
    expect(result.qualification_score).toBeGreaterThanOrEqual(70)
    expect(result.interest_level).toBe("hot")
  })

  it("does not include fields with wrong types", () => {
    const result = mapExtractedDataToLeadFields({ bedrooms: "tres" as unknown }, {})
    expect(result.preferred_bedrooms).toBeUndefined()
  })

  it("maps email correctly", () => {
    const result = mapExtractedDataToLeadFields({ email: "test@example.com" }, {})
    expect(result.email).toBe("test@example.com")
  })

  it("maps garages and view", () => {
    const result = mapExtractedDataToLeadFields({ garages: 2, view: "fundos" }, {})
    expect(result.preferred_garage_count).toBe(2)
    expect(result.preferred_view).toBe("fundos")
  })
})
