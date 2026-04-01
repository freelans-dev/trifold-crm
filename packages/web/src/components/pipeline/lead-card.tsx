"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface LeadCardProps {
  lead: {
    id: string
    name: string | null
    phone: string
    qualification_score: number | null
    interest_level: string | null
    property_interest_id: string | null
    assigned_broker_id: string | null
    created_at: string
    updated_at: string
  }
  propertyName?: string
  brokerName?: string
}

export function LeadCard({ lead, propertyName, brokerName }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const scoreColor =
    (lead.qualification_score ?? 0) >= 70
      ? "bg-green-100 text-green-700"
      : (lead.qualification_score ?? 0) >= 40
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-500"

  const timeAgo = getTimeAgo(lead.updated_at)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-md border bg-white p-3 shadow-sm hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-900">
          {lead.name || lead.phone}
        </p>
        {lead.qualification_score != null && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${scoreColor}`}
          >
            {lead.qualification_score}
          </span>
        )}
      </div>
      {propertyName && (
        <p className="mt-1 text-xs text-gray-500">{propertyName}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        {brokerName ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[10px] font-medium text-orange-700">
            {brokerName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
        ) : (
          <span className="text-[10px] text-red-400">Sem corretor</span>
        )}
        <span className="text-[10px] text-gray-400">{timeAgo}</span>
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}
