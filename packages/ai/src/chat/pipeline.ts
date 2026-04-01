import type { SupabaseClient } from "@supabase/supabase-js"

type ImageMimeType = "image/jpeg" | "image/png" | "image/gif" | "image/webp"

function normalizeImageMimeType(mime: string): ImageMimeType {
  const map: Record<string, ImageMimeType> = {
    "image/jpg": "image/jpeg",
    "image/jpeg": "image/jpeg",
    "image/png": "image/png",
    "image/gif": "image/gif",
    "image/webp": "image/webp",
  }
  return map[mime.toLowerCase()] ?? "image/jpeg"
}
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
  updateLeadMemory,
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

export interface MediaBlock {
  type: "image" | "document"
  base64: string
  mimeType: string
}

export interface ProcessMessageParams {
  supabase: SupabaseClient
  anthropic: Anthropic
  conversationId: string
  message: string
  orgId: string
  mediaBlock?: MediaBlock
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

  // 6.3 Get conversation info (needed for lead memory and sync)
  const { data: conversation } = await supabase
    .from("conversations")
    .select("lead_id, org_id")
    .eq("id", conversationId)
    .single()

  // 6.5 Get current lead summary for memory context
  let currentSummary: string | null = null
  if (conversation?.lead_id) {
    const { data: leadData } = await supabase
      .from("leads")
      .select("ai_summary")
      .eq("id", conversation.lead_id)
      .single()
    currentSummary = leadData?.ai_summary ?? null
  }

  // 7. Build system prompt with flow context + datetime + memory
  const qualificationStep = getNextQualificationStep(collectedData)
  const qualificationScore = calculateQualificationScore(collectedData)

  // Current datetime in Maringá timezone
  const now = new Date()
  const maringaDate = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", year: "numeric", month: "long", day: "numeric" })
  const maringaTime = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })
  const dateTimeContext = `\nDATA E HORA ATUAL: ${maringaDate}, ${maringaTime} (horario de Maringa-PR)\n`

  // Lead memory context
  const memoryContext = currentSummary
    ? `\nMEMORIA DO LEAD (informacoes de conversas anteriores):\n${currentSummary}\n\nUse essas informacoes para personalizar o atendimento. Chame pelo nome, referencie o que ja conversaram.\n`
    : ""

  const systemPrompt =
    buildSystemPrompt(agentConfig, ragContext, state) +
    dateTimeContext +
    memoryContext +
    buildFlowContext(qualificationStep, qualificationScore, identifiedPropertyId) +
    yardenGateContext

  // 8. Build messages array and call Claude API
  const userContent: Anthropic.ContentBlockParam[] = []

  if (params.mediaBlock) {
    if (params.mediaBlock.type === "image") {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: normalizeImageMimeType(params.mediaBlock.mimeType),
          data: params.mediaBlock.base64,
        },
      })
    } else if (params.mediaBlock.type === "document") {
      userContent.push({
        type: "document",
        source: {
          type: "base64",
          media_type: params.mediaBlock.mimeType as "application/pdf",
          data: params.mediaBlock.base64,
        },
      })
    }
  }

  userContent.push({ type: "text", text: message })

  const messages: Anthropic.MessageParam[] = [
    ...history.map(
      (msg): Anthropic.MessageParam => ({
        role: msg.role,
        content: msg.content,
      })
    ),
    { role: "user", content: userContent },
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

  // 9. Extract collected data from user message FIRST (name comes from user, not AI)
  const updatedData = extractCollectedData(message, collectedData)

  // Then extract non-name data from AI response (property mentions, etc — but NOT name)
  const aiExtracted = extractCollectedData(assistantMessage, updatedData)
  // Preserve the name from user message only (AI response might say "Nicole" which is the bot name)
  const finalData: Record<string, unknown> = { ...aiExtracted, name: updatedData.name ?? collectedData.name }

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

  if (conversation?.lead_id) {
    const leadId = conversation.lead_id

    // [3.3 AC9] Sync property_interest_id to lead
    if (identifiedPropertyId) {
      await supabase
        .from("leads")
        .update({ property_interest_id: identifiedPropertyId })
        .eq("id", leadId)
    }

    // [3.3 AC9] Sync property_interest from collected_data
    if (!identifiedPropertyId && finalData.property_interest) {
      const interest = (finalData.property_interest as string).toLowerCase()
      const matchedProperty = properties.find((p) =>
        p.slug.includes(interest) || p.name.toLowerCase().includes(interest)
      )
      if (matchedProperty) {
        await supabase
          .from("leads")
          .update({ property_interest_id: matchedProperty.id })
          .eq("id", leadId)
      }
    }

    // [3.4 AC4] Sync collected_data → lead fields
    // Map state field names to lead column names
    const leadUpdates: Record<string, unknown> = {}
    if (finalData.name && (finalData.name as string).toLowerCase() !== "nicole") {
      leadUpdates.name = finalData.name
    }
    if (finalData.bedrooms) leadUpdates.preferred_bedrooms = finalData.bedrooms
    if (finalData.floor) leadUpdates.preferred_floor = finalData.floor
    if (finalData.preferred_floor) leadUpdates.preferred_floor = finalData.preferred_floor
    if (finalData.view) leadUpdates.preferred_view = finalData.view
    if (finalData.preferred_view) leadUpdates.preferred_view = finalData.preferred_view
    if (finalData.garages) leadUpdates.preferred_garage_count = finalData.garages
    if (finalData.garage_count) leadUpdates.preferred_garage_count = finalData.garage_count
    if (finalData.has_down_payment !== undefined) leadUpdates.has_down_payment = finalData.has_down_payment
    leadUpdates.qualification_score = updatedScore
    leadUpdates.qualification_status = updatedScore >= 70 ? "qualified" : updatedScore > 0 ? "in_progress" : "not_started"

    if (Object.keys(leadUpdates).length > 0) {
      await supabase.from("leads").update(leadUpdates).eq("id", leadId)
    }

    // [3.4 AC11] Kanban auto-update based on qualification
    const STAGE_IDS = {
      novo: "00000000-0000-0000-0001-000000000001",
      em_qualificacao: "00000000-0000-0000-0001-000000000002",
      qualificado: "00000000-0000-0000-0001-000000000003",
      visita_agendada: "00000000-0000-0000-0001-000000000004",
    }

    const { data: currentLead } = await supabase
      .from("leads")
      .select("stage_id")
      .eq("id", leadId)
      .single()

    if (currentLead?.stage_id === STAGE_IDS.novo && updatedScore > 0) {
      await supabase
        .from("leads")
        .update({ stage_id: STAGE_IDS.em_qualificacao })
        .eq("id", leadId)
    } else if (currentLead?.stage_id === STAGE_IDS.em_qualificacao && updatedScore >= 70) {
      await supabase
        .from("leads")
        .update({ stage_id: STAGE_IDS.qualificado })
        .eq("id", leadId)
    }

    // [3.10 AC7/AC9/AC10] Handoff automations
    if (handoffResult.trigger && conversation.org_id) {
      // AC10: Move to appropriate stage
      const handoffStageId = finalData.visit_availability
        ? STAGE_IDS.visita_agendada
        : STAGE_IDS.qualificado
      await supabase
        .from("leads")
        .update({ stage_id: handoffStageId, ai_summary: handoffSummary })
        .eq("id", leadId)

      // AC7: Auto-assign broker from property
      if (identifiedPropertyId) {
        const { data: assignment } = await supabase
          .from("broker_assignments")
          .select("broker_id, brokers(user_id)")
          .eq("property_id", identifiedPropertyId)
          .eq("is_primary", true)
          .single()

        if (assignment?.broker_id) {
          const brokers = assignment.brokers as unknown as { user_id: string } | { user_id: string }[]
          const brokerId = Array.isArray(brokers) ? brokers[0]?.user_id : brokers?.user_id
          if (brokerId) {
            await supabase
              .from("leads")
              .update({ assigned_broker_id: brokerId })
              .eq("id", leadId)
          }
        }
      }

      // AC9: Register activity log
      await supabase.from("activities").insert({
        org_id: conversation.org_id,
        lead_id: leadId,
        type: "handoff",
        description: `Handoff: ${handoffResult.reason}`,
        metadata: {
          reason: handoffResult.reason,
          qualification_score: updatedScore,
        },
      })

      // Mark conversation as handed off
      await supabase
        .from("conversations")
        .update({ is_ai_active: false, handoff_at: new Date().toISOString(), handoff_reason: handoffResult.reason })
        .eq("id", conversationId)
    }
  }

  // 11. Save the user message and assistant response to the messages table
  await saveMessages(supabase, conversationId, message, assistantMessage)

  // 12. Update conversation state with new collected data
  await updateConversationState(supabase, conversationId, {
    collected_data: finalData,
    qualification_step: updatedStep,
    current_property_id: identifiedPropertyId ?? state?.current_property_id ?? null,
  })

  // 12.5 Update lead memory (run in background but don't swallow errors)
  if (conversation?.lead_id) {
    const leadId = conversation.lead_id
    updateLeadMemory({
      anthropic,
      currentSummary,
      userMessage: message,
      assistantMessage,
      collectedData: finalData,
    }).then(async (newSummary) => {
      if (newSummary) {
        const { error } = await supabase
          .from("leads")
          .update({ ai_summary: newSummary })
          .eq("id", leadId)
        if (error) console.error("Error saving lead memory:", error.message)
      }
    }).catch((err) => console.error("Lead memory update failed:", err))
  }

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
      model_primary: "claude-sonnet-4-6",
      temperature: 0.7,
      max_tokens: 1024,
    }
  }

  return {
    personality_prompt: data.personality_prompt,
    guardrails: Array.isArray(data.guardrails) ? data.guardrails : [],
    model_primary: data.model_primary ?? "claude-sonnet-4-6",
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
  _userMessage: string,
  assistantMessage: string
): Promise<void> {
  // Only save assistant response — user message is already saved by the webhook handler
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "assistant",
    content: assistantMessage,
  })

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
