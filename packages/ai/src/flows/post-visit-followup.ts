/**
 * Post-visit follow-up flow.
 * Generates personalized follow-up messages after a property visit,
 * based on the broker's feedback about the lead's interest level.
 */

import Anthropic from "@anthropic-ai/sdk"

interface PostVisitParams {
  anthropic: Anthropic
  leadName: string
  propertyName: string
  visitFeedback?: string
  aiSummary?: string
}

/**
 * Generates a post-visit follow-up message using Claude Haiku.
 *
 * Behavior:
 * - "hot" feedback  -> propose next steps (revisit, documentation, proposal)
 * - "cold" feedback -> light contact, no pressure
 * - no feedback     -> general follow-up
 */
export async function generatePostVisitMessage(params: PostVisitParams): Promise<string> {
  const { anthropic, leadName, propertyName, visitFeedback, aiSummary } = params

  const firstName = leadName.split(" ")[0] || leadName

  let intent: string
  if (visitFeedback?.toLowerCase().includes("hot")) {
    intent =
      "O lead demonstrou ALTO interesse. Proponha proximos passos concretos: " +
      "segunda visita, envio de documentacao, conversa sobre condicoes comerciais. " +
      "Seja direto e proativo, mostrando que esta disponivel para ajudar."
  } else if (visitFeedback?.toLowerCase().includes("cold")) {
    intent =
      "O lead demonstrou BAIXO interesse. Envie uma mensagem leve e sem pressao. " +
      "Agradeca pela visita, coloque-se a disposicao caso mude de ideia, " +
      "e encerre de forma educada. Nao insista."
  } else {
    intent =
      "Nao ha feedback especifico sobre o interesse do lead. " +
      "Envie um follow-up geral agradecendo pela visita, " +
      "pergunte se ficou alguma duvida e coloque-se a disposicao."
  }

  const systemPrompt = [
    "Voce e a Nicole, assistente virtual de uma imobiliaria.",
    "Escreva uma mensagem curta de follow-up pos-visita para o lead.",
    "Use linguagem natural e profissional em portugues brasileiro.",
    "Nao use emojis. Texto simples e direto.",
    "Maximo 3 frases. Nao use saudacao formal como 'Prezado'.",
    "Use o primeiro nome do lead para personalizar.",
  ].join(" ")

  const userPrompt = [
    `Nome do lead: ${firstName}`,
    `Empreendimento visitado: ${propertyName}`,
    `Instrucao: ${intent}`,
    aiSummary ? `Contexto adicional do lead: ${aiSummary}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-latest",
    max_tokens: 256,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  })

  const textBlock = response.content.find((b) => b.type === "text")
  return textBlock?.text?.trim() ?? `Ola ${firstName}, obrigada pela visita ao ${propertyName}. Ficou alguma duvida? Estou a disposicao.`
}
