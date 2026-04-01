import { describe, it, expect } from "vitest"
import { detectAppointmentIntent } from "./detect-appointment"

describe("detectAppointmentIntent", () => {
  it("detects 'quero agendar uma visita'", () => {
    const result = detectAppointmentIntent("quero agendar uma visita", {})
    expect(result.detected).toBe(true)
  })

  it("detects 'posso visitar amanha'", () => {
    const result = detectAppointmentIntent("posso visitar amanha", {})
    expect(result.detected).toBe(true)
  })

  it("does NOT detect 'bom dia'", () => {
    const result = detectAppointmentIntent("bom dia", {})
    expect(result.detected).toBe(false)
  })

  it("extracts date from 'visita dia 15/04'", () => {
    const result = detectAppointmentIntent("visita dia 15/04", {})
    expect(result.detected).toBe(true)
    expect(result.date).toMatch(/\d{4}-04-15/)
  })

  it("extracts full date from 'visita em 20/05/2026'", () => {
    const result = detectAppointmentIntent("visita em 20/05/2026", {})
    expect(result.detected).toBe(true)
    expect(result.date).toBe("2026-05-20")
  })

  it("extracts date with 2-digit year from '10/06/26'", () => {
    const result = detectAppointmentIntent("agendar 10/06/26", {})
    expect(result.detected).toBe(true)
    expect(result.date).toBe("2026-06-10")
  })

  it("detects 'conhecer o decorado'", () => {
    const result = detectAppointmentIntent("quero conhecer o decorado", {})
    expect(result.detected).toBe(true)
  })

  it("detects day keywords like 'sabado'", () => {
    const result = detectAppointmentIntent("posso ir sabado", {})
    expect(result.detected).toBe(true)
    expect(result.date).toBeDefined()
  })

  it("detects 'semana que vem'", () => {
    const result = detectAppointmentIntent("posso semana que vem", {})
    expect(result.detected).toBe(true)
  })

  it("detects when visit_availability is true in collectedData", () => {
    const result = detectAppointmentIntent("ok", { visit_availability: true })
    expect(result.detected).toBe(true)
  })

  it("does NOT detect without any appointment signals", () => {
    const result = detectAppointmentIntent("Quero 3 quartos", {})
    expect(result.detected).toBe(false)
  })

  it("extracts time from '14h30'", () => {
    const result = detectAppointmentIntent("visita 15/04 14h30", {})
    expect(result.detected).toBe(true)
    expect(result.time).toBe("14:30")
  })

  it("extracts time from 'às 10 horas'", () => {
    const result = detectAppointmentIntent("visita às 10 horas", {})
    expect(result.detected).toBe(true)
    expect(result.time).toBe("10:00")
  })

  it("includes raw message in result when detected", () => {
    const result = detectAppointmentIntent("quero agendar visita", {})
    expect(result.detected).toBe(true)
    expect(result.raw).toBe("quero agendar visita")
  })

  it("does NOT include raw when not detected", () => {
    const result = detectAppointmentIntent("bom dia", {})
    expect(result.raw).toBeUndefined()
  })
})
