import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { MediaBlock } from "@trifold/ai"
import { getTelegramFileUrl, downloadFileAsBase64 } from "@trifold/bot"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/jpg",
])

async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(30000),
    }
  ).catch(() => {})
}

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
  if (!message) {
    return NextResponse.json({ status: "ok" })
  }

  const chatId = String(message.chat.id)
  const from = `tg:${chatId}`

  // Determine message content and media
  let text: string = message.text ?? ""
  let mediaBlock: MediaBlock | undefined
  let mediaMetadata: { media_type?: string; media_url?: string } = {}

  // Handle voice messages — ask user to type instead
  if (message.voice) {
    text = text || "[Mensagem de voz recebida]"
    mediaMetadata = { media_type: "voice" }
  }

  // Handle photo messages
  if (message.photo && Array.isArray(message.photo) && message.photo.length > 0) {
    const largestPhoto = message.photo[message.photo.length - 1]
    const fileId = largestPhoto.file_id as string

    const fileUrl = await getTelegramFileUrl(TELEGRAM_BOT_TOKEN, fileId)
    if (fileUrl) {
      const fileData = await downloadFileAsBase64(fileUrl)
      if (fileData) {
        mediaBlock = {
          type: "image",
          base64: fileData.base64,
          mimeType: fileData.mimeType,
        }
        mediaMetadata = { media_type: "image", media_url: fileUrl }
      }
    }
    text = text || message.caption || "O que voce acha desta imagem?"
  }

  // Handle document messages
  if (message.document) {
    const doc = message.document
    const fileId = doc.file_id as string
    const mimeType = (doc.mime_type as string) || "application/octet-stream"

    const fileUrl = await getTelegramFileUrl(TELEGRAM_BOT_TOKEN, fileId)
    if (fileUrl) {
      const fileData = await downloadFileAsBase64(fileUrl)
      if (fileData) {
        if (IMAGE_MIME_TYPES.has(mimeType)) {
          mediaBlock = {
            type: "image",
            base64: fileData.base64,
            mimeType: fileData.mimeType,
          }
          mediaMetadata = { media_type: "image", media_url: fileUrl }
        } else if (mimeType === "application/pdf") {
          mediaBlock = {
            type: "document",
            base64: fileData.base64,
            mimeType: fileData.mimeType,
          }
          mediaMetadata = { media_type: "document", media_url: fileUrl }
        } else {
          mediaMetadata = { media_type: "document", media_url: fileUrl }
        }
      }
    }
    text = text || message.caption || "Recebi um documento."
  }

  // If no text and no media content, skip
  if (!text && !mediaBlock) {
    return NextResponse.json({ status: "ok" })
  }

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
      metadata: {
        telegram_message_id: message.message_id,
        ...mediaMetadata,
      },
    })

    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation.id)

    // Handle voice messages — reply asking lead to type
    if (message.voice) {
      await sendTelegramMessage(
        chatId,
        "Oi! Recebi sua mensagem de voz, mas no momento nao consigo ouvir audios. " +
          "Pode digitar sua mensagem, por favor? Assim consigo te ajudar melhor! 😊"
      )
      return NextResponse.json({ status: "ok" })
    }

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
          mediaBlock,
        })

        // Split response into paragraphs and send each as separate message
        const paragraphs = response
          .split(/\n\n+/)
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 0)

        for (const paragraph of paragraphs) {
          const sendResult = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: paragraph,
              }),
              signal: AbortSignal.timeout(30000),
            }
          )
          if (!sendResult.ok) {
            console.error("Telegram send error:", await sendResult.text())
          }
          // Small delay between messages for natural feel
          if (paragraphs.length > 1) {
            await new Promise((r) => setTimeout(r, 800))
          }
        }
      } catch (aiError) {
        console.error("AI processing error:", aiError)
        // Send fallback message
        await sendTelegramMessage(
          chatId,
          "Oi! Tive um probleminha tecnico. Pode repetir sua mensagem?"
        )
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ status: "ok" })
  }
}
