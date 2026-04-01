import { createClient } from "@web/lib/supabase/server"
import { getServerUser } from "@web/lib/auth"

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  scheduled: {
    label: "Agendado",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  confirmed: {
    label: "Confirmado",
    color: "text-green-700",
    bg: "bg-green-100",
  },
  completed: {
    label: "Realizado",
    color: "text-gray-700",
    bg: "bg-gray-100",
  },
  cancelled: {
    label: "Cancelado",
    color: "text-red-700",
    bg: "bg-red-100",
  },
  no_show: {
    label: "Ausente",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
  },
}

export default async function BrokerAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date_from?: string; date_to?: string }>
}) {
  const user = await getServerUser()
  const supabase = await createClient()
  const params = await searchParams

  let query = supabase
    .from("appointments")
    .select(
      `
      id, scheduled_at, duration_minutes, location, status, notes, created_by,
      lead:leads!lead_id(id, name, phone),
      property:properties!property_id(id, name)
    `
    )
    .eq("broker_id", user.id)
    .order("scheduled_at", { ascending: true })

  if (params.date_from) {
    query = query.gte("scheduled_at", params.date_from)
  }

  if (params.date_to) {
    query = query.lte("scheduled_at", `${params.date_to}T23:59:59`)
  }

  // Default: show from today onwards
  if (!params.date_from && !params.date_to) {
    query = query.gte("scheduled_at", new Date().toISOString())
  }

  const { data: appointments } = await query

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Minha Agenda</h1>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            De
          </label>
          <input
            type="date"
            name="date_from"
            defaultValue={params.date_from ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Ate
          </label>
          <input
            type="date"
            name="date_to"
            defaultValue={params.date_to ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Filtrar
        </button>
      </form>

      <div className="rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-6 py-3">Data/Hora</th>
              <th className="px-6 py-3">Lead</th>
              <th className="px-6 py-3">Empreendimento</th>
              <th className="px-6 py-3">Local</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments && appointments.length > 0 ? (
              appointments.map((apt) => {
                const s = statusConfig[apt.status] ?? statusConfig.scheduled
                const date = new Date(apt.scheduled_at)
                const leadRaw = apt.lead as unknown
                const lead = Array.isArray(leadRaw) ? leadRaw[0] as { id: string; name: string; phone: string } | undefined : leadRaw as { id: string; name: string; phone: string } | null
                const propertyRaw = apt.property as unknown
                const property = Array.isArray(propertyRaw) ? propertyRaw[0] as { id: string; name: string } | undefined : propertyRaw as { id: string; name: string } | null

                return (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {date.toLocaleDateString("pt-BR")}{" "}
                      <span className="text-gray-500">
                        {date.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="ml-1 text-xs text-gray-400">
                        ({apt.duration_minutes}min)
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {lead?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {property?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {apt.location}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${s.bg} ${s.color}`}
                      >
                        {s.label}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  Nenhum agendamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
