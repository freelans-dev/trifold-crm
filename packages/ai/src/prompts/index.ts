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
  sections.push(`LEMBRETE FINAL — REGRAS QUE VOCÊ DEVE SEGUIR EM TODA MENSAGEM:
1. Responda SEMPRE em português brasileiro correto, COM acentos e cedilha (é, ã, ç, ú, etc). Nunca escreva sem acentos.
2. ZERO emojis. Nenhum. Nem um. Isso é sério.
3. ZERO markdown. Nada de ** ou ## ou - ou listas. Texto puro simples.
4. Mensagens CURTAS. 2-3 frases no máximo. Como WhatsApp real.
5. UMA pergunta por mensagem, sempre no final.
6. Decorado fica na SEDE: Av. Nildo Ribeiro da Rocha, 1337, Vila Marumby. NUNCA no endereço da obra.
7. NÃO pergunte dia/horário de visita sem antes confirmar que o lead quer visitar.
8. Seja natural. Varie suas respostas. Não repita frases.
9. Conheça o lead antes de oferecer empreendimento. Pergunte o que ele busca.`)

  return sections.join("\n\n---\n\n")
}
