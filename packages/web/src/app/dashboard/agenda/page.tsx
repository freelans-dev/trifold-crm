import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"
import Link from "next/link"

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  scheduled: {
    label: "Agendado",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  confirmed: {
    label: "Confirmado",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  completed: {
    label: "Realizado",
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
  cancelled: {
    label: "Cancelado",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  no_show: {
    label: "Ausente",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
}

function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    days.push(d)
  }
  return days
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

interface Appointment {
  id: string
  scheduled_at: string
  duration_minutes: number
  location: string | null
  status: string
  notes: string | null
  lead: unknown
  broker: unknown
  property: unknown
}

interface RelatedLead {
  id: string
  name: string
  phone: string
}

interface RelatedBroker {
  id: string
  name: string
}

interface RelatedProperty {
  id: string
  name: string
}

function extractRelation<T>(raw: unknown): T | null {
  if (Array.isArray(raw)) return (raw[0] as T) ?? null
  return (raw as T) ?? null
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{
    broker_id?: string
    week?: string
    apt?: string
  }>
}) {
  await getServerUser()
  const supabase = await createClient()
  const params = await searchParams

  // Determine the current week
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let weekStart: Date
  if (params.week) {
    weekStart = getMonday(new Date(params.week + "T00:00:00"))
  } else {
    weekStart = getMonday(today)
  }

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const weekDays = getWeekDays(weekStart)

  // Navigation dates
  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(weekStart.getDate() - 7)
  const nextWeekStart = new Date(weekStart)
  nextWeekStart.setDate(weekStart.getDate() + 7)

  // Fetch brokers for filter
  const { data: brokers } = await supabase
    .from("users")
    .select("id, name")
    .eq("role", "broker")
    .order("name")

  // Fetch appointments for the week
  let query = supabase
    .from("appointments")
    .select(
      `
      id, scheduled_at, duration_minutes, location, status, notes,
      lead:leads!lead_id(id, name, phone),
      broker:users!broker_id(id, name),
      property:properties!property_id(id, name)
    `
    )
    .gte("scheduled_at", weekStart.toISOString())
    .lte("scheduled_at", weekEnd.toISOString())
    .order("scheduled_at", { ascending: true })

  if (params.broker_id) {
    query = query.eq("broker_id", params.broker_id)
  }

  const { data: appointments } = await query

  // Group appointments by day
  const appointmentsByDay: Record<string, Appointment[]> = {}
  for (const day of weekDays) {
    appointmentsByDay[formatDateISO(day)] = []
  }
  if (appointments) {
    for (const apt of appointments) {
      const aptDate = new Date(apt.scheduled_at)
      const key = formatDateISO(aptDate)
      if (appointmentsByDay[key]) {
        appointmentsByDay[key].push(apt as Appointment)
      }
    }
  }

  // Selected appointment details
  let selectedApt: Appointment | null = null
  if (params.apt && appointments) {
    selectedApt =
      (appointments.find((a) => a.id === params.apt) as Appointment) ?? null
  }

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Marco",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  function buildUrl(overrides: Record<string, string | undefined>) {
    const base: Record<string, string> = {}
    if (params.broker_id) base.broker_id = params.broker_id
    if (params.week) base.week = params.week
    const merged = { ...base, ...overrides }
    const qs = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join("&")
    return `/dashboard/agenda${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <div className="flex items-center gap-3">
          {/* Broker filter */}
          <form method="get" className="flex items-center gap-2">
            <input type="hidden" name="week" value={formatDateISO(weekStart)} />
            {params.apt && (
              <input type="hidden" name="apt" value={params.apt} />
            )}
            <select
              name="broker_id"
              defaultValue={params.broker_id ?? ""}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Todos os corretores</option>
              {brokers?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Filtrar
            </button>
          </form>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
        <Link
          href={buildUrl({ week: formatDateISO(prevWeekStart), apt: undefined })}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          &larr; Anterior
        </Link>

        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">
            {weekStart.getDate()} {monthNames[weekStart.getMonth()]} -{" "}
            {weekEnd.getDate()} {monthNames[weekEnd.getMonth()]}{" "}
            {weekEnd.getFullYear()}
          </p>
          {!isSameDay(weekStart, getMonday(today)) && (
            <Link
              href={buildUrl({
                week: formatDateISO(getMonday(today)),
                apt: undefined,
              })}
              className="text-xs text-orange-600 hover:text-orange-700"
            >
              Ir para hoje
            </Link>
          )}
        </div>

        <Link
          href={buildUrl({ week: formatDateISO(nextWeekStart), apt: undefined })}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Proximo &rarr;
        </Link>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-gray-200 shadow-sm">
        {weekDays.map((day) => {
          const key = formatDateISO(day)
          const dayAppts = appointmentsByDay[key] ?? []
          const isToday = isSameDay(day, today)
          const isPast = day < today && !isToday

          return (
            <div
              key={key}
              className={`min-h-[180px] bg-white p-2 ${
                isToday ? "ring-2 ring-inset ring-orange-400" : ""
              } ${isPast ? "bg-gray-50" : ""}`}
            >
              {/* Day header */}
              <div className="mb-2 text-center">
                <p className="text-[10px] font-medium uppercase text-gray-400">
                  {dayNames[day.getDay()]}
                </p>
                <p
                  className={`text-lg font-bold ${
                    isToday
                      ? "mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white"
                      : "text-gray-800"
                  }`}
                >
                  {day.getDate()}
                </p>
              </div>

              {/* Appointments */}
              <div className="space-y-1">
                {dayAppts.map((apt) => {
                  const s = statusConfig[apt.status] ?? statusConfig.scheduled
                  const time = new Date(apt.scheduled_at)
                  const lead = extractRelation<RelatedLead>(apt.lead)
                  const broker = extractRelation<RelatedBroker>(apt.broker)
                  const isSelected = params.apt === apt.id

                  return (
                    <Link
                      key={apt.id}
                      href={buildUrl({
                        apt: isSelected ? undefined : apt.id,
                      })}
                      className={`block rounded border px-1.5 py-1 text-[11px] leading-tight transition-all ${s.bg} ${s.border} ${s.color} ${
                        isSelected
                          ? "ring-2 ring-orange-400"
                          : "hover:brightness-95"
                      }`}
                    >
                      <p className="font-semibold">
                        {time.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="truncate">{lead?.name ?? "Lead"}</p>
                      {broker && (
                        <p className="truncate text-[10px] opacity-75">
                          {broker.name}
                        </p>
                      )}
                    </Link>
                  )
                })}
                {dayAppts.length === 0 && (
                  <p className="text-center text-[10px] text-gray-300">-</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Appointment detail panel */}
      {selectedApt && (
        <AppointmentDetail
          apt={selectedApt}
          closeUrl={buildUrl({ apt: undefined })}
        />
      )}
    </div>
  )
}

function AppointmentDetail({
  apt,
  closeUrl,
}: {
  apt: Appointment
  closeUrl: string
}) {
  const s = statusConfig[apt.status] ?? statusConfig.scheduled
  const date = new Date(apt.scheduled_at)
  const lead = extractRelation<RelatedLead>(apt.lead)
  const broker = extractRelation<RelatedBroker>(apt.broker)
  const property = extractRelation<RelatedProperty>(apt.property)

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Detalhes do Agendamento
        </h2>
        <Link
          href={closeUrl}
          className="rounded-md px-3 py-1 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          Fechar
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-gray-400">
            Data / Hora
          </p>
          <p className="text-sm text-gray-900">
            {date.toLocaleDateString("pt-BR")} as{" "}
            {date.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            <span className="ml-1 text-gray-400">
              ({apt.duration_minutes}min)
            </span>
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-gray-400">Status</p>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.bg} ${s.color}`}
          >
            {s.label}
          </span>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-gray-400">Lead</p>
          <p className="text-sm text-gray-900">{lead?.name ?? "-"}</p>
          {lead?.phone && (
            <p className="text-xs text-gray-500">{lead.phone}</p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-gray-400">
            Corretor
          </p>
          <p className="text-sm text-gray-900">{broker?.name ?? "-"}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-gray-400">
            Empreendimento
          </p>
          <p className="text-sm text-gray-900">{property?.name ?? "-"}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-gray-400">Local</p>
          <p className="text-sm text-gray-900">{apt.location ?? "-"}</p>
        </div>

        {apt.notes && (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase text-gray-400">Notas</p>
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {apt.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
