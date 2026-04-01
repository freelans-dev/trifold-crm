import type { SupabaseClient } from "@supabase/supabase-js"
import type Anthropic from "@anthropic-ai/sdk"
import { searchKnowledge } from "../rag/search"
import { buildContextFromRAG } from "../rag/context-builder"

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
}

export interface ProcessMessageParams {
  supabase: SupabaseClient
  anthropic: Anthropic
  conversationId: string
  message: string
  orgId: string
}

/**
 * Main chat processing pipeline for Nicole AI.
 *
 * Steps:
 * 1. Load conversation state from DB
 * 2. Load conversation history (last 20 messages)
 * 3. Search RAG for relevant context
 * 4. Build system prompt (personality + guardrails + qualification + RAG context)
 * 5. Call Claude API with messages
 * 6. Save assistant response to messages table
 * 7. Update conversation state
 * 8. Return response text
 */
export async function processMessage(
  params: ProcessMessageParams
): Promise<string> {
  const { supabase, anthropic, conversationId, message, orgId } = params

  // 1. Load conversation state
  const state = await loadConversationState(supabase, conversationId)

  // 2. Load conversation history (last 20 messages)
  const history = await loadConversationHistory(supabase, conversationId)

  // 3. Search RAG for relevant context
  const ragResults = await searchKnowledge(
    supabase,
    message,
    orgId,
    state?.current_property_id ?? undefined
  )
  const ragContext = buildContextFromRAG(ragResults)

  // 4. Load agent config and build system prompt
  const agentConfig = await loadAgentConfig(supabase, orgId)
  const systemPrompt = buildSystemPrompt(agentConfig, ragContext, state)

  // 5. Build messages array and call Claude API
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

  // 6. Save the user message and assistant response to the messages table
  await saveMessages(supabase, conversationId, message, assistantMessage)

  // 7. Update conversation state (last_message_at)
  await updateConversationTimestamp(supabase, conversationId)

  // 8. Return response text
  return assistantMessage
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
      "personality_prompt, guardrails, model_primary, temperature, max_tokens"
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
  }
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
