import type { SupabaseClient } from "@supabase/supabase-js"
import type Anthropic from "@anthropic-ai/sdk"
import { searchKnowledge } from "../rag/search"
import { buildContextFromRAG } from "../rag/context-builder"
import {
  identifyProperty,
  calculateQualificationScore,
  getNextQualificationStep,
  extractCollectedData,
  checkYardenGate,
  shouldHandoff,
  generateHandoffSummary,
} from "../flows"
import { isBusinessHours } from "../utils/business-hours"

interface ConversationState {
  id: string
  conversation_id: string
  current_property_id: string | null
  qualification_step: string | null
  collected_data: Record<string, unknown>
  materials_sent: unknown[]
  visit_proposed: boolean
  context: Record<string, unknown>
}

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AgentConfig {
  personality_prompt: string | null
  guardrails: string[]
  model_primary: string
  temperature: number
  max_tokens: number
  business_hours?: Record<string, { start: string; end: string }>
}

interface Property {
  id: string
  name: string
  slug: string
}

export interface ProcessMessageParams {
  supabase: SupabaseClient
  anthropic: Anthropic
  conversationId: string
  message: string
  orgId: string
}

export interface ProcessMessageResult {
  response: string
  handoff?: {
    trigger: boolean
    reason?: string
    summary?: string
  }
  qualificationScore: number
}

/**
 * Main chat processing pipeline for Nicole AI.
 *
 * Steps:
 * 1. Load conversation state from DB
 * 2. Load agent config and check business hours
 * 3. Load conversation history (last 20 messages)
 * 4. Search RAG for relevant context
 * 5. Identify property from message
 * 6. Check Yarden gate if property identified
 * 7. Build system prompt (personality + guardrails + qualification + RAG context + flow context)
 * 8. Call Claude API with messages
 * 9. Extract collected data from AI response
 * 10. Calculate qualification score and check handoff
 * 11. Save assistant response to messages table
 * 12. Update conversation state with new collected data
 * 13. Return response with metadata
 */
export async function processMessage(
  params: ProcessMessageParams
): Promise<string> {
  const result = await processMessageWithMetadata(params)
  return result.response
}

export async function processMessageWithMetadata(
  params: ProcessMessageParams
): Promise<ProcessMessageResult> {
  const { supabase, anthropic, conversationId, message, orgId } = params

  // 1. Load conversation state
  const state = await loadConversationState(supabase, conversationId)
  const collectedData: Record<string, unknown> = state?.collected_data ?? {}

  // 2. Load agent config and check business hours
  const agentConfig = await loadAgentConfig(supabase, orgId)

  if (agentConfig.business_hours) {
    const withinHours = isBusinessHours({
      business_hours: agentConfig.business_hours,
    })
    if (!withinHours) {
      const offHoursResponse =
        "Oi! Obrigada pelo contato. No momento estou fora do horario de atendimento. " +
        "Vou guardar sua mensagem e retorno assim que possivel. Ate breve!"

      await saveMessages(supabase, conversationId, message, offHoursResponse)
      await updateConversationTimestamp(supabase, conversationId)

      return {
        response: offHoursResponse,
        qualificationScore: calculateQualificationScore(collectedData),
      }
    }
  }

  // 3. Load conversation history (last 20 messages)
  const history = await loadConversationHistory(supabase, conversationId)

  // 4. Search RAG for relevant context
  const ragResults = await searchKnowledge(
    supabase,
    message,
    orgId,
    state?.current_property_id ?? undefined
  )
  const ragContext = buildContextFromRAG(ragResults)

  // 5. Identify property from message
  const properties = await loadProperties(supabase, orgId)
  const identifiedPropertyId = identifyProperty(
    message,
    collectedData,
    properties
  )

  // 6. Check Yarden gate if property identified
  let yardenGateContext = ""
  if (identifiedPropertyId) {
    const property = properties.find((p) => p.id === identifiedPropertyId)
    if (property) {
      const gateResult = checkYardenGate(property.slug, collectedData)
      if (gateResult.blocked) {
        yardenGateContext = `\n\n=== YARDEN GATE ===\n${gateResult.reason}\nSugestao: ${gateResult.suggestion}\n=== END YARDEN GATE ===`
      }
    }
  }

  // 7. Build system prompt with flow context
  const qualificationStep = getNextQualificationStep(collectedData)
  const qualificationScore = calculateQualificationScore(collectedData)
  const systemPrompt =
    buildSystemPrompt(agentConfig, ragContext, state) +
    buildFlowContext(qualificationStep, qualificationScore, identifiedPropertyId) +
    yardenGateContext

  // 8. Build messages array and call Claude API
  const messages: Anthropic.MessageParam[] = [
    ...history.map(
      (msg): Anthropic.MessageParam => ({
        role: msg.role,
        content: msg.content,
      })
    ),
    { role: "user", content: message },
  ]

  const response = await anthropic.messages.create({
    model: agentConfig.model_primary,
    max_tokens: agentConfig.max_tokens,
    temperature: agentConfig.temperature,
    system: systemPrompt,
    messages,
  })

  const assistantMessage =
    response.content[0].type === "text" ? response.content[0].text : ""

  // 9. Extract collected data from AI response
  const updatedData = extractCollectedData(assistantMessage, collectedData)

  // Also extract from user message
  const finalData = extractCollectedData(message, updatedData)

  // 10. Calculate updated score and check handoff
  const updatedScore = calculateQualificationScore(finalData)
  const updatedStep = getNextQualificationStep(finalData)

  const handoffResult = shouldHandoff({
    qualificationScore: updatedScore,
    message,
    conversationState: {
      ...finalData,
      visit_proposed: state?.visit_proposed ?? false,
    },
  })

  let handoffSummary: string | undefined
  if (handoffResult.trigger) {
    const allMessages = [
      ...history,
      { role: "user" as const, content: message },
      { role: "assistant" as const, content: assistantMessage },
    ]
    handoffSummary = generateHandoffSummary(finalData, allMessages)
  }

  // 11. Save the user message and assistant response to the messages table
  await saveMessages(supabase, conversationId, message, assistantMessage)

  // 12. Update conversation state with new collected data
  await updateConversationState(supabase, conversationId, {
    collected_data: finalData,
    qualification_step: updatedStep,
    current_property_id: identifiedPropertyId ?? state?.current_property_id ?? null,
  })

  // 13. Return response with metadata
  return {
    response: assistantMessage,
    handoff: handoffResult.trigger
      ? {
          trigger: true,
          reason: handoffResult.reason,
          summary: handoffSummary,
        }
      : undefined,
    qualificationScore: updatedScore,
  }
}

async function loadConversationState(
  supabase: SupabaseClient,
  conversationId: string
): Promise<ConversationState | null> {
  const { data, error } = await supabase
    .from("conversation_state")
    .select("*")
    .eq("conversation_id", conversationId)
    .single()

  if (error || !data) {
    return null
  }

  return data as ConversationState
}

async function loadConversationHistory(
  supabase: SupabaseClient,
  conversationId: string,
  limit: number = 20
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .in("role", ["user", "assistant"])
    .order("created_at", { ascending: true })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data as Message[]
}

async function loadAgentConfig(
  supabase: SupabaseClient,
  orgId: string
): Promise<AgentConfig> {
  const { data, error } = await supabase
    .from("agent_config")
    .select(
      "personality_prompt, guardrails, model_primary, temperature, max_tokens, business_hours"
    )
    .eq("org_id", orgId)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return {
      personality_prompt: null,
      guardrails: [],
      model_primary: "claude-sonnet-4-5-20250514",
      temperature: 0.7,
      max_tokens: 1024,
    }
  }

  return {
    personality_prompt: data.personality_prompt,
    guardrails: Array.isArray(data.guardrails) ? data.guardrails : [],
    model_primary: data.model_primary ?? "claude-sonnet-4-5-20250514",
    temperature: data.temperature ?? 0.7,
    max_tokens: data.max_tokens ?? 1024,
    business_hours: data.business_hours as
      | Record<string, { start: string; end: string }>
      | undefined,
  }
}

async function loadProperties(
  supabase: SupabaseClient,
  orgId: string
): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("id, name, slug")
    .eq("org_id", orgId)

  if (error || !data) {
    return []
  }

  return data as Property[]
}

function buildSystemPrompt(
  config: AgentConfig,
  ragContext: string,
  state: ConversationState | null
): string {
  const parts: string[] = []

  // Personality
  if (config.personality_prompt) {
    parts.push(config.personality_prompt)
  } else {
    parts.push(
      "You are Nicole, a friendly and professional real estate AI assistant. " +
        "You help potential buyers learn about properties, answer their questions, " +
        "and guide them through the qualification process. " +
        "Always be helpful, warm, and knowledgeable."
    )
  }

  // Guardrails
  if (config.guardrails.length > 0) {
    parts.push("")
    parts.push("=== GUARDRAILS ===")
    parts.push(
      "You MUST follow these rules at all times. Never deviate from them:"
    )
    config.guardrails.forEach((rule) => {
      parts.push(`- ${rule}`)
    })
    parts.push("=== END GUARDRAILS ===")
  }

  // Qualification context
  if (state) {
    parts.push("")
    parts.push("=== CONVERSATION CONTEXT ===")
    if (state.qualification_step) {
      parts.push(`Current qualification step: ${state.qualification_step}`)
    }
    if (
      state.collected_data &&
      Object.keys(state.collected_data).length > 0
    ) {
      parts.push(
        `Data collected so far: ${JSON.stringify(state.collected_data)}`
      )
    }
    if (state.visit_proposed) {
      parts.push("A visit has already been proposed to this lead.")
    }
    parts.push("=== END CONVERSATION CONTEXT ===")
  }

  // RAG context
  if (ragContext) {
    parts.push("")
    parts.push(ragContext)
  }

  return parts.join("\n")
}

function buildFlowContext(
  qualificationStep: string,
  qualificationScore: number,
  identifiedPropertyId: string | null
): string {
  const parts: string[] = []

  parts.push("")
  parts.push("=== FLOW CONTEXT ===")
  parts.push(`Qualification score: ${qualificationScore}/100`)
  parts.push(`Next qualification step: ${qualificationStep}`)

  if (identifiedPropertyId) {
    parts.push(`Identified property ID: ${identifiedPropertyId}`)
  }

  if (qualificationScore >= 70) {
    parts.push(
      "NOTA: Lead com alta qualificacao. Priorize agendar visita ou transferir para corretor."
    )
  }

  parts.push("=== END FLOW CONTEXT ===")

  return parts.join("\n")
}

async function saveMessages(
  supabase: SupabaseClient,
  conversationId: string,
  userMessage: string,
  assistantMessage: string
): Promise<void> {
  const { error } = await supabase.from("messages").insert([
    {
      conversation_id: conversationId,
      role: "user",
      content: userMessage,
    },
    {
      conversation_id: conversationId,
      role: "assistant",
      content: assistantMessage,
    },
  ])

  if (error) {
    console.error("Error saving messages:", error)
  }
}

async function updateConversationTimestamp(
  supabase: SupabaseClient,
  conversationId: string
): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId)

  if (error) {
    console.error("Error updating conversation timestamp:", error)
  }
}

async function updateConversationState(
  supabase: SupabaseClient,
  conversationId: string,
  updates: {
    collected_data: Record<string, unknown>
    qualification_step: string
    current_property_id: string | null
  }
): Promise<void> {
  const { error } = await supabase
    .from("conversation_state")
    .upsert(
      {
        conversation_id: conversationId,
        collected_data: updates.collected_data,
        qualification_step: updates.qualification_step,
        current_property_id: updates.current_property_id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "conversation_id" }
    )

  if (error) {
    console.error("Error updating conversation state:", error)
  }
}
