import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — Webhook verification (Meta sends this to verify the endpoint)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  const verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

// POST — Incoming message from WhatsApp
export async function POST(request: NextRequest) {
  // HMAC signature verification (Meta sends X-Hub-Signature-256)
  const appSecret = process.env.META_APP_SECRET
  const rawBody = await request.text()

  if (appSecret) {
    const signature = request.headers.get("x-hub-signature-256")
    const expectedSignature =
      "sha256=" +
      crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }
  }

  const body = JSON.parse(rawBody)

  // Parse the incoming message
  const entry = body.entry?.[0]
  const changes = entry?.changes?.[0]
  const value = changes?.value
  const messages = value?.messages

  if (!messages?.[0]) {
    // Status update or other non-message event
    return NextResponse.json({ status: "ok" })
  }

  const msg = messages[0]
  if (msg.type !== "text") {
    return NextResponse.json({ status: "ok" })
  }

  const from = msg.from as string
  const text = msg.text?.body as string
  const messageId = msg.id as string

  const supabase = getSupabaseAdmin()

  try {
    // Get org + whatsapp config
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("org_id, phone_number_id, access_token, coexistence_enabled")
      .eq("status", "active")
      .single()

    if (!config) {
      console.error("No active WhatsApp config found")
      return NextResponse.json({ status: "ok" })
    }

    const orgId = config.org_id

    // Find or create lead
    let { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("phone", from)
      .eq("org_id", orgId)
      .single()

    if (!lead) {
      // Get default stage (first one)
      const { data: defaultStage } = await supabase
        .from("kanban_stages")
        .select("id")
        .eq("org_id", orgId)
        .eq("is_default", true)
        .single()

      const { data: newLead } = await supabase
        .from("leads")
        .insert({
          org_id: orgId,
          phone: from,
          channel: "whatsapp",
          source: "whatsapp_organic",
          stage_id: defaultStage?.id,
        })
        .select("id")
        .single()

      lead = newLead
    }

    if (!lead) {
      console.error("Failed to find or create lead")
      return NextResponse.json({ status: "ok" })
    }

    // Check for Click-to-WhatsApp Ads referral data
    const referral = value?.messages?.[0]?.referral
    if (referral) {
      const referralMetadata: Record<string, unknown> = {
        source_url: referral.source_url ?? null,
        headline: referral.headline ?? null,
        body: referral.body ?? null,
        ctwa_clid: referral.ctwa_clid ?? null,
        media_type: referral.media_type ?? null,
        image_url: referral.image_url ?? null,
        video_url: referral.video_url ?? null,
        thumbnail_url: referral.thumbnail_url ?? null,
      }

      // Update lead with CTWA source and referral data
      await supabase
        .from("leads")
        .update({
          source: "whatsapp_click_to_ad",
          utm_source: "meta_ads",
          utm_medium: "whatsapp_ctwa",
          utm_campaign: referral.headline ?? null,
          metadata: referralMetadata,
        })
        .eq("id", lead.id)
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
          channel: "whatsapp",
          is_ai_active: true,
        })
        .select("id, is_ai_active")
        .single()

      conversation = newConv
    }

    if (!conversation) {
      console.error("Failed to find or create conversation")
      return NextResponse.json({ status: "ok" })
    }

    // Save incoming message
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      role: "user",
      content: text,
      metadata: { whatsapp_message_id: messageId },
    })

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation.id)

    // If AI is active, process with Nicole
    if (conversation.is_ai_active) {
      // Dynamic import to avoid loading AI module on every request
      const { processMessage, createAnthropicClient } = await import("@trifold/ai")

      const anthropic = createAnthropicClient()

      const response = await processMessage({
        supabase,
        anthropic,
        conversationId: conversation.id,
        message: text,
        orgId,
      })

      // Send response via WhatsApp
      const whatsappUrl = `https://graph.facebook.com/v21.0/${config.phone_number_id}/messages`
      await fetch(whatsappUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: response },
        }),
      })
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ status: "ok" })
  }
}
