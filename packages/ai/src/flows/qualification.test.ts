import { describe, it, expect } from "vitest"
import {
  calculateQualificationScore,
  getNextQualificationStep,
  extractCollectedData,
} from "./qualification"

describe("calculateQualificationScore", () => {
  it("returns 0 for empty data", () => {
    expect(calculateQualificationScore({})).toBe(0)
  })

  it("returns 0 for null/undefined/empty string values", () => {
    expect(
      calculateQualificationScore({
        name: null,
        property_interest: undefined,
        bedrooms: "",
      })
    ).toBe(0)
  })

  it("returns correct partial score for a few fields", () => {
    // name=10 + property_interest=15 = 25
    expect(
      calculateQualificationScore({
        name: "Joao",
        property_interest: "vind",
      })
    ).toBe(25)
  })

  it("returns correct score for half the fields", () => {
    // name=10 + bedrooms=10 + has_down_payment=15 + visit_availability=20 = 55
    expect(
      calculateQualificationScore({
        name: "Maria",
        bedrooms: 3,
        has_down_payment: true,
        visit_availability: true,
      })
    ).toBe(55)
  })

  it("returns 100 for all fields filled", () => {
    expect(
      calculateQualificationScore({
        name: "Carlos",
        property_interest: "yarden",
        bedrooms: 2,
        floor: "alto",
        view: "frente",
        garages: 1,
        has_down_payment: true,
        source: "instagram",
        visit_availability: true,
      })
    ).toBe(100)
  })

  it("caps at 100 even with extra fields", () => {
    expect(
      calculateQualificationScore({
        name: "Carlos",
        property_interest: "yarden",
        bedrooms: 2,
        floor: "alto",
        view: "frente",
        garages: 1,
        has_down_payment: true,
        source: "instagram",
        visit_availability: true,
        extra_field: "something",
      })
    ).toBe(100)
  })

  it("counts has_down_payment=false as present (non-null, non-undefined, non-empty)", () => {
    // has_down_payment=false is a valid value (not undefined/null/"")
    expect(calculateQualificationScore({ has_down_payment: false })).toBe(15)
  })

  it("counts numeric zero as present", () => {
    // 0 is not undefined/null/""
    expect(calculateQualificationScore({ bedrooms: 0 })).toBe(10)
  })
})

describe("getNextQualificationStep", () => {
  it("returns 'name' as first step when data is empty", () => {
    expect(getNextQualificationStep({})).toBe("name")
  })

  it("returns 'property_interest' after name is collected", () => {
    expect(getNextQualificationStep({ name: "Ana" })).toBe("property_interest")
  })

  it("skips to first missing step", () => {
    expect(
      getNextQualificationStep({
        name: "Ana",
        property_interest: "vind",
        bedrooms: 2,
      })
    ).toBe("floor")
  })

  it("returns 'complete' when all steps are filled", () => {
    expect(
      getNextQualificationStep({
        name: "Carlos",
        property_interest: "yarden",
        bedrooms: 2,
        floor: "alto",
        view: "frente",
        garages: 1,
        has_down_payment: true,
        source: "instagram",
        visit_availability: true,
      })
    ).toBe("complete")
  })

  it("treats null as missing", () => {
    expect(getNextQualificationStep({ name: null })).toBe("name")
  })

  it("treats empty string as missing", () => {
    expect(getNextQualificationStep({ name: "" })).toBe("name")
  })

  it("follows correct step order", () => {
    const steps = [
      "name",
      "property_interest",
      "bedrooms",
      "floor",
      "view",
      "garages",
      "has_down_payment",
      "source",
      "visit_availability",
    ]
    const data: Record<string, unknown> = {}
    for (const step of steps) {
      expect(getNextQualificationStep(data)).toBe(step)
      data[step] = "filled"
    }
    expect(getNextQualificationStep(data)).toBe("complete")
  })
})

describe("extractCollectedData", () => {
  it("extracts name from 'Prazer, Maria' pattern", () => {
    const result = extractCollectedData("Prazer, Maria Silva!", {})
    expect(result.name).toBe("Maria Silva")
  })

  it("extracts name from 'Olá, João' pattern", () => {
    const result = extractCollectedData("Olá, João!", {})
    expect(result.name).toBe("João")
  })

  it("extracts name from 'Certo, Carlos' pattern", () => {
    const result = extractCollectedData("Certo, Carlos", {})
    expect(result.name).toBe("Carlos")
  })

  it("does not overwrite existing name", () => {
    const result = extractCollectedData("Prazer, Maria!", { name: "Ana" })
    expect(result.name).toBe("Ana")
  })

  it("extracts property interest 'vind'", () => {
    const result = extractCollectedData("Gostaria de saber mais sobre o Vind", {})
    expect(result.property_interest).toBe("vind")
  })

  it("extracts property interest 'yarden'", () => {
    const result = extractCollectedData("Quero conhecer o Yarden", {})
    expect(result.property_interest).toBe("yarden")
  })

  it("extracts bedrooms from '3 quartos'", () => {
    const result = extractCollectedData("Busco 3 quartos", {})
    expect(result.bedrooms).toBe(3)
  })

  it("extracts bedrooms from '2 suítes'", () => {
    const result = extractCollectedData("Preciso de 2 suítes", {})
    expect(result.bedrooms).toBe(2)
  })

  it("extracts floor preference 'alto'", () => {
    const result = extractCollectedData("Prefiro andar alto", {})
    expect(result.floor).toBe("alto")
  })

  it("extracts floor preference 'baixo'", () => {
    const result = extractCollectedData("Prefiro andar baixo", {})
    expect(result.floor).toBe("baixo")
  })

  it("extracts view 'frente'", () => {
    const result = extractCollectedData("Quero vista frontal", {})
    expect(result.view).toBe("frente")
  })

  it("extracts view 'fundos'", () => {
    const result = extractCollectedData("Vista de fundos", {})
    expect(result.view).toBe("fundos")
  })

  it("extracts garage count", () => {
    const result = extractCollectedData("Preciso de 2 vagas", {})
    expect(result.garages).toBe(2)
  })

  it("extracts has_down_payment=true", () => {
    const result = extractCollectedData("Tenho entrada disponível", {})
    expect(result.has_down_payment).toBe(true)
  })

  it("extracts has_down_payment=false", () => {
    const result = extractCollectedData("Estou sem entrada no momento", {})
    expect(result.has_down_payment).toBe(false)
  })

  it("extracts source 'instagram'", () => {
    const result = extractCollectedData("Vi pelo instagram", {})
    expect(result.source).toBe("instagram")
  })

  it("extracts source 'indicacao'", () => {
    const result = extractCollectedData("Recebi uma indicação de amigo", {})
    expect(result.source).toBe("indicacao")
  })

  it("extracts visit availability", () => {
    const result = extractCollectedData("Quero visitar o apartamento", {})
    expect(result.visit_availability).toBe(true)
  })

  it("preserves existing data and merges new extractions", () => {
    const current = { name: "Ana", bedrooms: 2 }
    const result = extractCollectedData("Prefiro andar alto com vista frontal", current)
    expect(result.name).toBe("Ana")
    expect(result.bedrooms).toBe(2)
    expect(result.floor).toBe("alto")
    expect(result.view).toBe("frente")
  })

  it("returns unchanged data when nothing matches", () => {
    const current = { name: "Ana" }
    const result = extractCollectedData("Bom dia!", current)
    expect(result).toEqual({ name: "Ana" })
  })
})
