import type Anthropic from "@anthropic-ai/sdk"

/**
 * Updates the lead's running summary/memory after each interaction.
 * Uses Haiku (fast, cheap) to analyze the latest messages and update
 * the summary with new personal info, preferences, and context.
 *
 * This gives Nicole "memory" without loading full chat history every time.
 */
export async function updateLeadMemory(params: {
  anthropic: Anthropic
  currentSummary: string | null
  userMessage: string
  assistantMessage: string
  collectedData: Record<string, unknown>
}): Promise<string> {
  const { anthropic, currentSummary, userMessage, assistantMessage, collectedData } = params

  const prompt = `Voce e um assistente que atualiza o resumo/memoria de um lead imobiliario.

RESUMO ATUAL DO LEAD:
${currentSummary || "Nenhum resumo ainda. Este e o primeiro contato."}

DADOS COLETADOS ATE AGORA:
${JSON.stringify(collectedData, null, 2)}

ULTIMA INTERACAO:
Lead disse: "${userMessage}"
Nicole respondeu: "${assistantMessage}"

TAREFA:
Atualize o resumo do lead incorporando QUALQUER informacao nova da ultima interacao.
Mantenha todas as informacoes anteriores e acrescente as novas.

Inclua especialmente:
- Nome e como prefere ser chamado
- Informacoes pessoais mencionadas (familia, trabalho, bairro onde mora, etc)
- Preferencias sobre o imovel (quartos, andar, vista, garagem)
- Empreendimento de interesse e motivo
- Objecoes ou preocupacoes levantadas
- Tom emocional do lead (animado, hesitante, com pressa, curioso)
- Perguntas que fez e o que mais importa pra ele
- Qualquer detalhe pessoal que ajude a personalizar o atendimento futuro

Formato: texto corrido em paragrafos curtos, sem markdown, sem listas.
Maximo 200 palavras. Seja objetivo e util.
Se nao houver informacao nova relevante, retorne o resumo atual sem mudancas.`

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    })

    return response.content[0].type === "text"
      ? response.content[0].text
      : currentSummary ?? ""
  } catch (error) {
    console.error("Error updating lead memory:", error)
    return currentSummary ?? ""
  }
}
