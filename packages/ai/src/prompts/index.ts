export { PERSONALITY_PROMPT } from "./personality"
export { GUARDRAILS_PROMPT } from "./guardrails"
export { QUALIFICATION_PROMPT } from "./qualification"
export { PROPERTY_PRESENTATION_PROMPT } from "./property-presentation"
export { VISIT_SCHEDULING_PROMPT } from "./visit-scheduling"
export { HANDOFF_SUMMARY_PROMPT } from "./handoff-summary"
export { OFF_HOURS_PROMPT } from "./off-hours"

import { PERSONALITY_PROMPT } from "./personality"
import { GUARDRAILS_PROMPT } from "./guardrails"
import { QUALIFICATION_PROMPT } from "./qualification"
import { PROPERTY_PRESENTATION_PROMPT } from "./property-presentation"
import { VISIT_SCHEDULING_PROMPT } from "./visit-scheduling"

/**
 * Monta o system prompt completo da Nicole, concatenando todos os blocos.
 * Opcionalmente inclui contexto de RAG (base de conhecimento do empreendimento).
 */
export function buildSystemPrompt(propertyContext?: string): string {
  const sections = [
    PERSONALITY_PROMPT,
    GUARDRAILS_PROMPT,
    QUALIFICATION_PROMPT,
    PROPERTY_PRESENTATION_PROMPT,
    VISIT_SCHEDULING_PROMPT,
  ]

  if (propertyContext) {
    sections.push(`CONTEXTO DA BASE DE CONHECIMENTO\n\nUse as informacoes abaixo para responder perguntas especificas sobre o empreendimento. Se a resposta nao estiver aqui, siga as regras de "QUANDO NAO SOUBER".\n\n${propertyContext}`)
  }

  // FINAL REINFORCEMENT — last instruction wins, model prioritizes these
  sections.push(`LEMBRETE FINAL — REGRAS QUE VOCE DEVE SEGUIR EM TODA MENSAGEM:
1. ZERO emojis. Nenhum. Nem um. Isso e serio.
2. ZERO markdown. Nada de ** ou ## ou - ou listas. Texto puro simples.
3. Mensagens CURTAS. 2-3 frases no maximo. Como WhatsApp real.
4. UMA pergunta por mensagem, sempre no final.
5. Decorado fica na SEDE: Av. Nildo Ribeiro da Rocha, 1337, Vila Marumby. NUNCA no endereco da obra.
6. NAO pergunte dia/horario de visita sem antes confirmar que o lead quer visitar.
7. Seja natural. Varie suas respostas. Nao repita frases.
8. Conheca o lead antes de oferecer empreendimento. Pergunte oque ele busca.`)

  return sections.join("\n\n---\n\n")
}
