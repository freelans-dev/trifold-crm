import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET

// If Telegram is not configured, return 404
export async function POST(request: NextRequest) {
  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Validate webhook secret (always required when configured)
  const secret = request.headers.get("x-telegram-bot-api-secret-token")
  if (!TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 })
  }
  if (secret !== TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const message = body.message
  if (!message?.text) {
    return NextResponse.json({ status: "ok" })
  }

  const chatId = String(message.chat.id)
  const text = message.text as string
  const from = `tg:${chatId}`

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Get org (use first org for staging)
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .limit(1)
      .single()

    if (!org) {
      return NextResponse.json({ status: "ok" })
    }

    const orgId = org.id

    // Find or create lead
    let { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("phone", from)
      .eq("org_id", orgId)
      .single()

    if (!lead) {
      const { data: defaultStage } = await supabase
        .from("kanban_stages")
        .select("id")
        .eq("org_id", orgId)
        .eq("is_default", true)
        .single()

      const userName = [
        message.from?.first_name,
        message.from?.last_name,
      ]
        .filter(Boolean)
        .join(" ") || null

      const { data: newLead } = await supabase
        .from("leads")
        .insert({
          org_id: orgId,
          phone: from,
          name: userName,
          channel: "telegram",
          source: "telegram",
          stage_id: defaultStage?.id,
        })
        .select("id")
        .single()

      lead = newLead
    }

    if (!lead) {
      return NextResponse.json({ status: "ok" })
    }

    // Find or create conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id, is_ai_active")
      .eq("lead_id", lead.id)
      .eq("status", "active")
      .single()

    if (!conversation) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({
          org_id: orgId,
          lead_id: lead.id,
          channel: "telegram",
          is_ai_active: true,
        })
        .select("id, is_ai_active")
        .single()

      conversation = newConv
    }

    if (!conversation) {
      return NextResponse.json({ status: "ok" })
    }

    // Save incoming message
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      role: "user",
      content: text,
      metadata: { telegram_message_id: message.message_id },
    })

    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation.id)

    // Process with Nicole AI
    if (conversation.is_ai_active) {
      try {
        const { processMessage, createAnthropicClient } = await import("@trifold/ai")

        const anthropic = createAnthropicClient()

        const response = await processMessage({
          supabase,
          anthropic,
          conversationId: conversation.id,
          message: text,
          orgId,
        })

        // Send via Telegram (with extended timeout for DNS resolution)
        const sendResult = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: response,
            }),
            signal: AbortSignal.timeout(30000),
          }
        )
        if (!sendResult.ok) {
          console.error("Telegram send error:", await sendResult.text())
        }
      } catch (aiError) {
        console.error("AI processing error:", aiError)
        // Send fallback message
        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "Oi! Tive um probleminha tecnico. Pode repetir sua mensagem?",
            }),
            signal: AbortSignal.timeout(30000),
          }
        ).catch(() => {})
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ status: "ok" })
  }
}
