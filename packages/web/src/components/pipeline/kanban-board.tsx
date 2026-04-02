"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { KanbanColumn } from "./kanban-column"
import { LeadCard } from "./lead-card"
import { LeadDetailDrawer } from "@web/components/leads/lead-detail-drawer"
import { createClient } from "@web/lib/supabase/client"

interface Stage {
  id: string
  name: string
  slug: string
  color: string
  position: number
}

interface Lead {
  id: string
  name: string | null
  phone: string
  stage_id: string | null
  qualification_score: number | null
  interest_level: string | null
  property_interest_id: string | null
  assigned_broker_id: string | null
  created_at: string
  updated_at: string
  ai_summary?: string | null
  properties?: { name: string } | null
  users?: { name: string } | null
}

interface KanbanBoardProps {
  initialStages: Stage[]
  initialLeads: Lead[]
}

export function KanbanBoard({ initialStages, initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const activeLead = activeId
    ? leads.find((l) => l.id === activeId)
    : null

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event

      if (!over) return

      const leadId = active.id as string
      const newStageId = over.id as string

      // Check if dropped on a column (stage)
      const targetStage = initialStages.find((s) => s.id === newStageId)
      if (!targetStage) return

      const lead = leads.find((l) => l.id === leadId)
      if (!lead || lead.stage_id === newStageId) return

      // Optimistic update
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, stage_id: newStageId } : l
        )
      )

      // Persist to database
      const supabase = createClient()
      const { error } = await supabase
        .from("leads")
        .update({ stage_id: newStageId })
        .eq("id", leadId)

      if (error) {
        // Revert on error
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId ? { ...l, stage_id: lead.stage_id } : l
          )
        )
      } else {
        // Log activity
        await supabase.from("activities").insert({
          org_id: lead.assigned_broker_id ? undefined : undefined,
          lead_id: leadId,
          type: "stage_change",
          description: `Lead movido para ${targetStage.name}`,
          metadata: {
            from_stage_id: lead.stage_id,
            to_stage_id: newStageId,
          },
        })
      }
    },
    [leads, initialStages]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {initialStages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={leads.filter((l) => l.stage_id === stage.id)}
            onSelectLead={setSelectedLeadId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead && (
          <LeadCard
            lead={activeLead}
            propertyName={activeLead.properties?.name}
            brokerName={activeLead.users?.name}
          />
        )}
      </DragOverlay>

      <LeadDetailDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </DndContext>
  )
}
