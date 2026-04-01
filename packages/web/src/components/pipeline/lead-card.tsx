"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Link from "next/link"
import { MANDATORY_FIELDS } from "@trifold/shared"

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
    ai_summary?: string | null
  }
  propertyName?: string
  brokerName?: string
}

const PROPERTY_BADGE: Record<string, { label: string; className: string }> = {
  vind: { label: "Vind", className: "bg-green-100 text-green-700" },
  yarden: { label: "Yarden", className: "bg-blue-100 text-blue-700" },
  both: { label: "Ambos", className: "bg-purple-100 text-purple-700" },
  unknown: { label: "Indefinido", className: "bg-gray-100 text-gray-500" },
}

function getMandatoryFieldsFilled(lead: LeadCardProps["lead"]): number {
  let filled = 0
  for (const field of MANDATORY_FIELDS) {
    const value = (lead as Record<string, unknown>)[field.key]
    if (value !== null && value !== undefined && value !== "") {
      filled++
    }
  }
  return filled
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

  const filledCount = getMandatoryFieldsFilled(lead)
  const totalMandatory = MANDATORY_FIELDS.length
  const fillPercent = Math.round((filledCount / totalMandatory) * 100)

  const interestKey = propertyName?.toLowerCase() ?? "unknown"
  const badge = PROPERTY_BADGE[interestKey] ?? PROPERTY_BADGE.unknown

  const summaryPreview = lead.ai_summary
    ? lead.ai_summary.length > 50
      ? lead.ai_summary.slice(0, 50) + "..."
      : lead.ai_summary
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-md border bg-white p-3 shadow-sm hover:shadow-md active:cursor-grabbing"
    >
      <Link href={`/dashboard/leads/${lead.id}`} className="block">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-gray-900">
            {lead.name || lead.phone}
          </p>
          <div className="flex items-center gap-1">
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
            {lead.qualification_score != null && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${scoreColor}`}
              >
                {lead.qualification_score}
              </span>
            )}
          </div>
        </div>

        {/* Mandatory fields progress */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-gray-200">
            <div
              className="h-1 rounded-full bg-orange-500 transition-all"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400">
            {filledCount}/{totalMandatory}
          </span>
        </div>

        {/* AI summary preview */}
        {summaryPreview && (
          <p className="mt-1.5 text-[11px] leading-tight text-gray-500 italic">
            {summaryPreview}
          </p>
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
      </Link>
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
