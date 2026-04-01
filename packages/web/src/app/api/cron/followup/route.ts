import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Follow-up cron engine.
 * POST /api/cron/followup
 *
 * For each active follow_up_rule:
 * - Find leads in that stage where last message is older than alert_days / nicole_takeover_days
 * - If broker hasn't sent a message since last lead/Nicole message:
 *   - alert_days exceeded → create follow_up_log entry type='alert_broker'
 *   - nicole_takeover_days exceeded → render template and create log type='nicole_sent'
 * - Respect: max 1 followup per lead per 48h, business hours only
 */
export async function POST(request: NextRequest) {
  // Validate cron secret
  const authHeader = request.headers.get("authorization")
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const now = new Date()
  const currentHour = now.getUTCHours() - 3 // BRT offset
  const normalizedHour = currentHour < 0 ? currentHour + 24 : currentHour

  // Business hours: 8h-20h BRT
  if (normalizedHour < 8 || normalizedHour >= 20) {
    return NextResponse.json({
      processed: 0,
      alerts_created: 0,
      messages_sent: 0,
      skipped_reason: "outside_business_hours",
    })
  }

  let alertsCreated = 0
  let messagesSent = 0
  let processed = 0

  // Fetch all active follow-up rules with stage info
  const { data: rules, error: rulesError } = await supabase
    .from("follow_up_rules")
    .select("*, stage:kanban_stages(id, name, slug)")
    .eq("is_active", true)

  if (rulesError || !rules) {
    return NextResponse.json(
      { error: rulesError?.message ?? "No rules found" },
      { status: 500 }
    )
  }

  for (const rule of rules) {
    const stageArr = rule.stage as unknown as Array<{ id: string; name: string; slug: string }> | null
    const stage = Array.isArray(stageArr) ? stageArr[0] : stageArr

    if (!stage) continue

    // Find leads in this stage
    const { data: leads } = await supabase
      .from("leads")
      .select(
        `id, name, phone, org_id, property_interest_id,
         properties:property_interest_id(name)`
      )
      .eq("org_id", rule.org_id)
      .eq("stage_id", rule.stage_id)
      .eq("is_active", true)

    if (!leads || leads.length === 0) continue

    for (const lead of leads) {
      processed++

      // Check 48h cooldown: no followup log for this lead in the last 48h
      const cooldownDate = new Date(now.getTime() - 48 * 60 * 60 * 1000)
      const { data: recentLogs } = await supabase
        .from("follow_up_log")
        .select("id")
        .eq("lead_id", lead.id)
        .gte("created_at", cooldownDate.toISOString())
        .limit(1)

      if (recentLogs && recentLogs.length > 0) continue

      // Get the latest conversation for this lead
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .eq("lead_id", lead.id)
        .order("last_message_at", { ascending: false })
        .limit(1)

      if (!conversations || conversations.length === 0) continue

      const conversationId = conversations[0].id

      // Get the last message from the conversation
      const { data: lastMessages } = await supabase
        .from("messages")
        .select("role, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (!lastMessages || lastMessages.length === 0) continue

      const lastMessage = lastMessages[0]
      const lastMessageDate = new Date(lastMessage.created_at)
      const daysSinceLastMessage =
        (now.getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60 * 24)

      // Check if broker has sent a message since the last lead/nicole message
      const lastNonBrokerIdx = lastMessages.findIndex(
        (m) => m.role === "user" || m.role === "assistant"
      )
      const brokerSentSince = lastMessages
        .slice(0, lastNonBrokerIdx >= 0 ? lastNonBrokerIdx : lastMessages.length)
        .some((m) => m.role === "broker")

      if (brokerSentSince) continue

      // Resolve property name for template
      const propertyArr = lead.properties as unknown as Array<{ name: string }> | null
      const propertyName = Array.isArray(propertyArr)
        ? propertyArr[0]?.name ?? "seu imovel"
        : (propertyArr as { name: string } | null)?.name ?? "seu imovel"

      // Check nicole_takeover_days first (more severe)
      if (daysSinceLastMessage >= rule.nicole_takeover_days) {
        // Render template
        const message = (rule.message_template || "")
          .replace(/\{nome\}/g, lead.name || "")
          .replace(/\{empreendimento\}/g, propertyName)

        // Create follow_up_log entry
        await supabase.from("follow_up_log").insert({
          org_id: rule.org_id,
          lead_id: lead.id,
          rule_id: rule.id,
          type: "nicole_sent",
          status: "sent",
          scheduled_at: now.toISOString(),
          sent_at: now.toISOString(),
          message,
        })

        // Send the message via Nicole's pipeline
        // Insert message into the conversation as assistant
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          role: "assistant",
          content: message,
          metadata: { source: "followup_cron", rule_id: rule.id },
        })

        // Update conversation timestamp
        await supabase
          .from("conversations")
          .update({ last_message_at: now.toISOString() })
          .eq("id", conversationId)

        // Create activity log
        await supabase.from("activities").insert({
          org_id: rule.org_id,
          lead_id: lead.id,
          type: "followup_nicole_sent",
          description: `Nicole enviou follow-up automatico na etapa "${stage.name}"`,
          metadata: { rule_id: rule.id, stage_id: rule.stage_id },
        })

        messagesSent++
      } else if (daysSinceLastMessage >= rule.alert_days) {
        // Create alert for broker
        await supabase.from("follow_up_log").insert({
          org_id: rule.org_id,
          lead_id: lead.id,
          rule_id: rule.id,
          type: "alert_broker",
          status: "pending",
          scheduled_at: now.toISOString(),
        })

        // Create activity log
        await supabase.from("activities").insert({
          org_id: rule.org_id,
          lead_id: lead.id,
          type: "followup_alert_broker",
          description: `Alerta de follow-up: lead sem contato ha ${Math.floor(daysSinceLastMessage)} dia(s) na etapa "${stage.name}"`,
          metadata: { rule_id: rule.id, stage_id: rule.stage_id },
        })

        alertsCreated++
      }
    }
  }

  return NextResponse.json({
    processed,
    alerts_created: alertsCreated,
    messages_sent: messagesSent,
  })
}
