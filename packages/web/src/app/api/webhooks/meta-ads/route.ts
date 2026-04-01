import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const DEFAULT_STAGE_ID = "00000000-0000-0000-0001-000000000001"

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

// POST — Incoming lead from Meta Lead Form webhook
export async function POST(request: NextRequest) {
  const appSecret = process.env.META_APP_SECRET
  const rawBody = await request.text()

  // HMAC signature verification
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

  const entry = body.entry?.[0]
  const changes = entry?.changes?.[0]
  const value = changes?.value

  if (!value?.leadgen_id) {
    // Not a lead form submission
    return NextResponse.json({ status: "ok" })
  }

  const supabase = getSupabaseAdmin()

  try {
    // Extract lead data from field_data array
    const fieldData: Array<{ name: string; values: string[] }> =
      value.field_data ?? []

    const getField = (name: string): string | null => {
      const field = fieldData.find(
        (f) =>
          f.name.toLowerCase() === name.toLowerCase() ||
          f.name.toLowerCase().includes(name.toLowerCase())
      )
      return field?.values?.[0] ?? null
    }

    const name = getField("full_name") ?? getField("name")
    const email = getField("email")
    const phone = getField("phone_number") ?? getField("phone")

    if (!phone && !email) {
      console.error("Meta Ads webhook: no phone or email in lead data")
      return NextResponse.json({ status: "ok" })
    }

    // Get the org from whatsapp_config (same Meta app)
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("org_id")
      .eq("status", "active")
      .single()

    if (!config) {
      console.error("No active WhatsApp config found for Meta Ads webhook")
      return NextResponse.json({ status: "ok" })
    }

    const orgId = config.org_id

    // Check if lead already exists (by phone)
    let leadId: string | null = null

    if (phone) {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .eq("phone", phone)
        .eq("org_id", orgId)
        .single()

      if (existingLead) {
        leadId = existingLead.id
      }
    }

    // Extract campaign/UTM data
    const utmCampaign = value.campaign_name ?? value.ad_group_name ?? null
    const utmSource = "meta_ads"
    const utmMedium = value.platform ?? "facebook"
    const utmContent = value.ad_name ?? null

    if (!leadId) {
      // Create new lead
      const { data: newLead } = await supabase
        .from("leads")
        .insert({
          org_id: orgId,
          name: name ?? null,
          email: email ?? null,
          phone: phone ?? null,
          channel: "meta_ads",
          source: "meta_ads",
          stage_id: DEFAULT_STAGE_ID,
          utm_campaign: utmCampaign,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_content: utmContent,
          metadata: {
            leadgen_id: value.leadgen_id,
            form_id: value.form_id,
            ad_id: value.ad_id,
            ad_group_id: value.adgroup_id,
            campaign_id: value.campaign_id,
            page_id: entry?.id,
            field_data: fieldData,
          },
        })
        .select("id")
        .single()

      leadId = newLead?.id ?? null
    } else {
      // Update existing lead with UTM data if missing
      await supabase
        .from("leads")
        .update({
          utm_campaign: utmCampaign,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_content: utmContent,
        })
        .eq("id", leadId)
    }

    if (!leadId) {
      console.error("Failed to find or create lead from Meta Ads webhook")
      return NextResponse.json({ status: "ok" })
    }

    // Create activity log
    await supabase.from("activities").insert({
      org_id: orgId,
      lead_id: leadId,
      type: "lead_created",
      description: "Lead criado via Meta Ads Lead Form",
      metadata: {
        source: "meta_ads",
        leadgen_id: value.leadgen_id,
        form_id: value.form_id,
        campaign_name: utmCampaign,
      },
    })

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Meta Ads webhook error:", error)
    return NextResponse.json({ status: "ok" })
  }
}
