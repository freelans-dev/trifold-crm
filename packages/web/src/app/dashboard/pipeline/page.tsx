import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import { KanbanBoard } from "@web/components/pipeline/kanban-board"

export default async function PipelinePage() {
  const user = await getServerUser()
  const supabase = await createClient()

  const [{ data: stages }, { data: leads }] = await Promise.all([
    supabase
      .from("kanban_stages")
      .select("id, name, slug, color, position")
      .eq("is_active", true)
      .order("position"),
    supabase
      .from("leads")
      .select(
        `id, name, phone, stage_id, qualification_score, interest_level,
         property_interest_id, assigned_broker_id, created_at, updated_at,
         properties:property_interest_id(name),
         users:assigned_broker_id(name)`
      )
      .eq("is_active", true)
      .order("updated_at", { ascending: false }),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500">
          {leads?.length ?? 0} leads no pipeline
        </p>
      </div>

      <KanbanBoard
        initialStages={stages ?? []}
        initialLeads={(leads ?? []).map((l: Record<string, unknown>) => ({
          ...l,
          properties: Array.isArray(l.properties) ? l.properties[0] ?? null : l.properties ?? null,
          users: Array.isArray(l.users) ? l.users[0] ?? null : l.users ?? null,
        })) as Parameters<typeof KanbanBoard>[0]["initialLeads"]}
      />
    </div>
  )
}
