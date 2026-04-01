import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Internal API for post-visit feedback.
 * Uses service role key for direct access.
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  return createClient(url, key)
}

/**
 * POST /api/appointments/[id]/feedback
 * Records visit feedback, updates appointment status, and creates activity log.
 *
 * Body: {
 *   feedback: string,
 *   interest_after: "cold" | "warm" | "hot",
 *   next_steps: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServiceClient()
    const body = await request.json()

    // Validate required fields
    if (!body.feedback) {
      return NextResponse.json(
        { error: "feedback is required" },
        { status: 400 }
      )
    }

    if (!body.interest_after || !["cold", "warm", "hot"].includes(body.interest_after)) {
      return NextResponse.json(
        { error: "interest_after must be one of: cold, warm, hot" },
        { status: 400 }
      )
    }

    // Verify appointment exists
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("id, lead_id, org_id, status")
      .eq("id", id)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      )
    }

    // Create visit feedback entry
    const { data: feedback, error: feedbackError } = await supabase
      .from("visit_feedback")
      .insert({
        appointment_id: id,
        lead_id: appointment.lead_id,
        org_id: appointment.org_id,
        feedback: body.feedback.trim(),
        interest_after: body.interest_after,
        next_steps: body.next_steps?.trim() || null,
      })
      .select()
      .single()

    if (feedbackError) {
      return NextResponse.json(
        { error: feedbackError.message },
        { status: 500 }
      )
    }

    // Update appointment status to completed
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: "completed" })
      .eq("id", id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Create activity log
    await supabase.from("activities").insert({
      org_id: appointment.org_id,
      lead_id: appointment.lead_id,
      type: "visit_completed",
      description: `Visita concluída. Interesse: ${body.interest_after}`,
      metadata: {
        appointment_id: id,
        feedback_id: feedback.id,
        interest_after: body.interest_after,
        next_steps: body.next_steps?.trim() || null,
      },
    })

    return NextResponse.json({ data: feedback }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
