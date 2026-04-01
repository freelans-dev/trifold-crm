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
    `IDIOMA: Responda EXCLUSIVAMENTE em português brasileiro com acentuação correta. Use é, á, ã, õ, ç, ú, í, ê, ô em todas as palavras que exigem. Exemplo: "você", "não", "também", "está", "será", "imóvel", "próximo". NUNCA escreva sem acentos. Isso é obrigatório e inegociável.`,
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
  sections.push(`LEMBRETE FINAL — REGRAS ABSOLUTAS:
1. Responda SEMPRE em português brasileiro correto COM acentos (é, ã, ç, ú).
2. ZERO emojis. ZERO markdown. Texto puro simples.
3. Mensagens CURTAS. 2-3 frases no máximo.
4. UMA pergunta por mensagem, no final.
5. Decorado fica na SEDE: Av. Nildo Ribeiro da Rocha, 1337, Vila Marumby. NUNCA no endereço da obra.
6. NÃO pergunte dia/horário de visita sem antes confirmar que o lead quer visitar.
7. NUNCA repita uma pergunta que o lead já respondeu. Se ele já disse o dia, o horário, o nome, o interesse — NÃO pergunte de novo. Isso irrita o lead.
8. Se a visita já está agendada (ver CONVERSATION CONTEXT acima), NÃO pergunte quando ele quer ir. Responda normalmente sobre outros assuntos.
9. Leia o contexto da conversa ANTES de responder. Se o lead já informou algo, use essa informação.
10. Seja natural e coloquial. Varie suas respostas.`)

  return sections.join("\n\n---\n\n")
}
