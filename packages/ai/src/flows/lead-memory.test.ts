import { describe, it, expect, vi } from "vitest"
import { updateLeadMemory } from "./lead-memory"

function createMockAnthropic(responseText: string) {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: responseText }],
      }),
    },
  } as unknown as Parameters<typeof updateLeadMemory>[0]["anthropic"]
}

describe("updateLeadMemory", () => {
  it("calls Haiku with max_tokens 600 (AC4)", async () => {
    const mockAnthropic = createMockAnthropic("Resumo atualizado.")

    await updateLeadMemory({
      anthropic: mockAnthropic,
      currentSummary: null,
      userMessage: "Oi, sou a Fernanda",
      assistantMessage: "Oi Fernanda! Tudo bem?",
      collectedData: { name: "Fernanda" },
    })

    const createCall = (mockAnthropic.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(createCall.max_tokens).toBe(600)
  })

  it("includes anti-truncation instruction in prompt (AC5)", async () => {
    const mockAnthropic = createMockAnthropic("Resumo.")

    await updateLeadMemory({
      anthropic: mockAnthropic,
      currentSummary: "Resumo anterior.",
      userMessage: "Quero 3 quartos",
      assistantMessage: "Temos opcoes de 3 quartos!",
      collectedData: { name: "Fernanda", bedrooms: 3 },
    })

    const createCall = (mockAnthropic.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    const prompt = createCall.messages[0].content
    expect(prompt).toContain("NUNCA corte o resumo no meio de uma frase")
  })

  it("returns new summary on success (AC7)", async () => {
    const mockAnthropic = createMockAnthropic("Fernanda busca 3 quartos no Vind.")

    const result = await updateLeadMemory({
      anthropic: mockAnthropic,
      currentSummary: "Fernanda interessada.",
      userMessage: "Quero 3 quartos",
      assistantMessage: "Temos opcoes!",
      collectedData: { name: "Fernanda", bedrooms: 3 },
    })

    expect(result).toBe("Fernanda busca 3 quartos no Vind.")
  })

  it("returns currentSummary on API error", async () => {
    const mockAnthropic = {
      messages: {
        create: vi.fn().mockRejectedValue(new Error("API timeout")),
      },
    } as unknown as Parameters<typeof updateLeadMemory>[0]["anthropic"]

    const result = await updateLeadMemory({
      anthropic: mockAnthropic,
      currentSummary: "Resumo existente.",
      userMessage: "Oi",
      assistantMessage: "Ola!",
      collectedData: {},
    })

    expect(result).toBe("Resumo existente.")
  })

  it("passes currentSummary correctly to Haiku prompt (AC2/AC7)", async () => {
    const mockAnthropic = createMockAnthropic("Novo resumo.")

    await updateLeadMemory({
      anthropic: mockAnthropic,
      currentSummary: "Base correta do resumo.",
      userMessage: "Oi",
      assistantMessage: "Ola!",
      collectedData: {},
    })

    const createCall = (mockAnthropic.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    const prompt = createCall.messages[0].content
    expect(prompt).toContain("Base correta do resumo.")
  })

  it("uses first-contact message when currentSummary is null", async () => {
    const mockAnthropic = createMockAnthropic("Primeiro contato.")

    await updateLeadMemory({
      anthropic: mockAnthropic,
      currentSummary: null,
      userMessage: "Oi",
      assistantMessage: "Bem-vinda!",
      collectedData: {},
    })

    const createCall = (mockAnthropic.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    const prompt = createCall.messages[0].content
    expect(prompt).toContain("Nenhum resumo ainda. Este e o primeiro contato.")
  })
})
